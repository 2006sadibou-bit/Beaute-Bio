import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from "@/lib/conseil/admin-session";

import { supabaseAdmin } from "@/lib/conseil/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  const { data: conversations, error } = await supabaseAdmin
    .from("beauty_conversations")
    .select("id,status,last_user_question,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { error: "Impossible de charger les questions." },
      { status: 500 }
    );
  }

  const ids = (conversations || []).map((item) => item.id);

  const { data: messages, error: messagesError } = ids.length
    ? await supabaseAdmin
        .from("beauty_messages")
        .select(
          "id,conversation_id,role,content,metadata,created_at"
        )
        .in("conversation_id", ids)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (messagesError) {
    return NextResponse.json(
      { error: "Impossible de charger les conversations." },
      { status: 500 }
    );
  }

  const grouped = new Map<string, typeof messages>();

  for (const message of messages || []) {
    const list = grouped.get(message.conversation_id) || [];

    list.push(message);
    grouped.set(message.conversation_id, list);
  }

  return NextResponse.json(
    {
      conversations: (conversations || []).map((item) => ({
        ...item,
        messages: grouped.get(item.id) || [],
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}

/* SUPPRESSION D'UNE CONVERSATION */

export async function DELETE(request: NextRequest) {
  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 401 }
    );
  }

  let body: { conversationId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }

  const conversationId = body.conversationId;

  if (
    typeof conversationId !== "string" ||
    !conversationId.trim()
  ) {
    return NextResponse.json(
      { error: "Identifiant de conversation manquant." },
      { status: 400 }
    );
  }

  // Vérifier que la conversation existe.
  const { data: conversation, error: findError } = await supabaseAdmin
    .from("beauty_conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();

  if (findError) {
    return NextResponse.json(
      { error: "Impossible de vérifier cette conversation." },
      { status: 500 }
    );
  }

  if (!conversation) {
    return NextResponse.json(
      { error: "Cette conversation n'existe pas." },
      { status: 404 }
    );
  }

  // Supprimer d'abord tous les messages associés.
  const { error: messagesDeleteError } = await supabaseAdmin
    .from("beauty_messages")
    .delete()
    .eq("conversation_id", conversationId);

  if (messagesDeleteError) {
    return NextResponse.json(
      { error: "Impossible de supprimer les messages de cette conversation." },
      { status: 500 }
    );
  }

  // Supprimer ensuite la conversation.
  const { error: conversationDeleteError } = await supabaseAdmin
    .from("beauty_conversations")
    .delete()
    .eq("id", conversationId);

  if (conversationDeleteError) {
    return NextResponse.json(
      { error: "Impossible de supprimer cette conversation." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Conversation supprimée avec succès.",
  });
}