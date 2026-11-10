import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/conseil/supabase-admin";

export const runtime = "nodejs";

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

type ModelAnswer = {
  answer?: string;
  needs_human?: boolean;
  product_ids?: string[];
};

function parseModelJson(raw: string): ModelAnswer {
  try {
    return JSON.parse(raw) as ModelAnswer;
  } catch {
    return {
      answer: "Je préfère vérifier cette information auprès de Gnilane afin de vous donner une réponse fiable.",
      needs_human: true,
      product_ids: [],
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body?.message ?? "").trim();
    const conversationId = body?.conversationId;

    if (message.length < 2 || message.length > 1500) {
      return NextResponse.json(
        { error: "Votre message doit contenir entre 2 et 1 500 caractères." },
        { status: 400 }
      );
    }

    if (!isUuid(conversationId)) {
      return NextResponse.json({ error: "Identifiant de conversation invalide." }, { status: 400 });
    }

    // Créer la conversation si c'est le premier message de cette cliente.
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("beauty_conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (!existing) {
      const { error: createError } = await supabaseAdmin.from("beauty_conversations").insert({
        id: conversationId,
        status: "open",
        last_user_question: message,
      });
      if (createError) throw createError;
    }

    // Enregistrer le message de la cliente avant d'appeler l'IA.
    const { error: userMessageError } = await supabaseAdmin.from("beauty_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });
    if (userMessageError) throw userMessageError;

    const { error: conversationUpdateError } = await supabaseAdmin
      .from("beauty_conversations")
      .update({
        last_user_question: message,
        updated_at: new Date().toISOString(),
        status: "open",
      })
      .eq("id", conversationId);

    if (conversationUpdateError) throw conversationUpdateError;

    // Valeurs de secours : même si le service IA est indisponible,
    // la question reste enregistrée et visible dans l'espace privé de Gnilane.
    let answer = "Merci pour votre message. Le conseiller automatique ne peut pas préparer une réponse fiable pour le moment.";
    let needsHuman = true;
    let recommendedProducts: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
      category: string;
      description: string | null;
      in_stock: boolean;
      available_on_order: boolean;
    }> = [];
    let automaticReplyAvailable = false;

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY manquante.");
      }

      const [productsResult, knowledgeResult, historyResult] = await Promise.all([
        supabaseAdmin
          .from("beauty_products")
          .select("id,name,price,image,category,description,in_stock,available_on_order")
          .order("id"),
        supabaseAdmin
          .from("beauty_knowledge")
          .select("question,answer")
          .eq("approved", true)
          .order("created_at", { ascending: false })
          .limit(40),
        supabaseAdmin
          .from("beauty_messages")
          .select("role,content")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (knowledgeResult.error) throw knowledgeResult.error;
      if (historyResult.error) throw historyResult.error;

      const safeProducts = (productsResult.data || []).map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
        in_stock: product.in_stock,
        available_on_order: product.available_on_order,
      }));

      const previousMessages = (historyResult.data || []).reverse().slice(0, -1);
      const conversationHistory = previousMessages
        .map((item) =>
          `${item.role === "user" ? "Cliente" : item.role === "admin" ? "Gnilane" : "Conseiller"}: ${item.content}`
        )
        .join("\n");

      const knowledgeText = (knowledgeResult.data || [])
        .map((item) => `Question validée : ${item.question}\nRéponse validée : ${item.answer}`)
        .join("\n\n");

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        instructions: `Tu es le conseiller beauté officiel de Beauté Bio by Gnilane, une boutique sénégalaise. Réponds en français simple, chaleureux et concis. Tu dois te baser UNIQUEMENT sur le catalogue et les réponses validées ci-dessous pour les faits concernant les produits, prix, ingrédients, disponibilité et usages. Ne crée jamais un produit, un prix, un ingrédient, une composition ou une propriété. Ne transforme jamais une description commerciale en promesse médicale : ne diagnostique pas, ne garantis pas la guérison et conseille de consulter un professionnel de santé pour une maladie, une réaction importante ou persistante. Si l'information demandée n'est pas présente, si la demande touche une situation médicale/personnelle nécessitant un avis spécialisé, ou si aucun produit ne correspond clairement, mets needs_human=true et dis poliment que Gnilane va vérifier. Ne prétends jamais qu'un humain répondra immédiatement. Recommande au maximum 3 produits existants dont les identifiants sont dans le catalogue. Retourne UNIQUEMENT un objet JSON valide avec les clés answer (string), needs_human (boolean), product_ids (array de chaînes). Catalogue JSON : ${JSON.stringify(safeProducts)}. Réponses déjà validées : ${knowledgeText || "Aucune réponse enregistrée."}`,
        input: `Historique récent :\n${conversationHistory}\n\nNouveau message du client : ${message}`,
        text: { format: { type: "json_object" } },
        max_output_tokens: 850,
      });

      const parsed = parseModelJson(completion.output_text || "");
      answer = String(
        parsed.answer || "Je n'ai pas assez d'informations pour vous répondre avec certitude."
      ).slice(0, 3500);
      needsHuman = Boolean(parsed.needs_human);

      const requestedIds = Array.isArray(parsed.product_ids)
        ? parsed.product_ids.map(String)
        : [];

      recommendedProducts = safeProducts
        .filter(
          (product) =>
            requestedIds.includes(product.id) &&
            (product.in_stock || product.available_on_order)
        )
        .slice(0, 3);
      automaticReplyAvailable = true;
    } catch (aiError) {
      // L'erreur est visible dans les journaux serveur, pas dans le navigateur.
      console.error("Beauty advisor unavailable; forwarding to Gnilane:", aiError);
      answer = "Merci pour votre message. Gnilane va vous répondre dès que possible.";
      needsHuman = true;
      recommendedProducts = [];
    }

    const finalAnswer = needsHuman
      ? answer.includes("Gnilane")
        ? answer
        : `${answer}\n\nVotre question est transmise à Gnilane pour vérification.`
      : answer;

    // Enregistrer aussi une réponse IA (ou un accusé de réception de secours).
    // Cela permet au client de voir immédiatement que son message a été pris en compte.
    const { error: assistantError } = await supabaseAdmin.from("beauty_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: finalAnswer,
      metadata: {
        recommended_products: recommendedProducts,
        needs_human: needsHuman,
        automatic_reply_available: automaticReplyAvailable,
      },
    });

    if (assistantError) {
      console.error("Could not save advisor response:", assistantError);
      // La demande initiale existe déjà en base et reste visible à Gnilane.
    }

    const { error: statusError } = await supabaseAdmin
      .from("beauty_conversations")
      .update({
        status: needsHuman ? "waiting_gnilane" : "open",
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (statusError) throw statusError;

    return NextResponse.json({
      conversationId,
      answer: finalAnswer,
      needsHuman,
      automaticReplyAvailable,
      responseSaved: !assistantError,
      products: recommendedProducts,
    });
  } catch (error) {
    console.error("Conseil chat error:", error);
    return NextResponse.json(
      { error: "Votre question n'a pas pu être enregistrée. Vérifiez votre connexion puis réessayez." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!isUuid(conversationId)) {
    return NextResponse.json({ error: "Conversation invalide." }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("beauty_messages")
      .select("id,role,content,metadata,created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      console.error("Could not load beauty conversation:", error);
      return NextResponse.json(
        { error: "Impossible de charger les messages depuis la base de données." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { messages: data || [] },
      { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  } catch (error) {
    console.error("Beauty conversation GET error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue pendant le chargement de la conversation." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
