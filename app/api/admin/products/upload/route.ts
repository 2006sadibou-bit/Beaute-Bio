import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from "@/lib/conseil/admin-session";
import { supabaseAdmin } from "@/lib/conseil/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { error: "Accès refusé. Reconnecte-toi." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucune photo reçue." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La photo dépasse la limite de 5 Mo." },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: "Format accepté : JPG, PNG, WEBP ou GIF." },
        { status: 400 }
      );
    }

    const path = `products/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("ERREUR UPLOAD PHOTO :", uploadError);

      return NextResponse.json(
        { error: "Envoi impossible : " + uploadError.message },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(path);

    return NextResponse.json({
      success: true,
      image_url: data.publicUrl,
    });
  } catch (error) {
    console.error("ERREUR API UPLOAD :", error);

    return NextResponse.json(
      { error: "Erreur interne pendant l'envoi de la photo." },
      { status: 500 }
    );
  }
}
