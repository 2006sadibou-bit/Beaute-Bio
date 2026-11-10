import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/conseil/admin-session";
import { supabaseAdmin } from "@/lib/conseil/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const conversationId = String(body?.conversationId || "");
    const answer = String(body?.answer || "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(conversationId) || answer.length < 2 || answer.length > 4000) {
      return NextResponse.json({ error: "Réponse ou conversation invalide." }, { status: 400 });
    }

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("beauty_conversations").select("id,last_user_question").eq("id", conversationId).maybeSingle();
    if (conversationError || !conversation) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });

    const { error: messageError } = await supabaseAdmin.from("beauty_messages").insert({
      conversation_id: conversationId,
      role: "admin",
      content: answer,
    });
    if (messageError) throw messageError;

    const { error: updateError } = await supabaseAdmin.from("beauty_conversations").update({
      status: "answered",
      updated_at: new Date().toISOString(),
    }).eq("id", conversationId);
    if (updateError) throw updateError;

    // La réponse à la cliente est déjà enregistrée. La mémorisation est secondaire :
    // une erreur sur cette table ne doit pas faire croire que le message a échoué.
    let knowledgeSaved = true;
    const { error: knowledgeError } = await supabaseAdmin.from("beauty_knowledge").insert({
      question: conversation.last_user_question,
      answer,
      approved: true,
    });
    if (knowledgeError) {
      knowledgeSaved = false;
      console.error("La réponse est envoyée, mais la mémorisation a échoué :", knowledgeError);
    }

    return NextResponse.json({ ok: true, knowledgeSaved });
  } catch (error) {
    console.error("Admin answer error:", error);
    return NextResponse.json({ error: "La réponse n'a pas pu être enregistrée." }, { status: 500 });
  }
}
