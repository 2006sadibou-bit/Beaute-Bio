import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";

import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  createAdminToken,
} from "@/lib/conseil/admin-session";

export const runtime = "nodejs";

function verifyPin(pin: string): boolean {
  const storedHash = process.env.ADMIN_PIN_HASH;

  if (!storedHash) {
    throw new Error("ADMIN_PIN_HASH manquant.");
  }

  const [algorithm, salt, hash] = storedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !salt ||
    !hash ||
    !/^[a-f0-9]{128}$/i.test(hash)
  ) {
    throw new Error("Format ADMIN_PIN_HASH invalide.");
  }

  const calculatedHash = scryptSync(pin, salt, 64);
  const expectedHash = Buffer.from(hash, "hex");

  return (
    calculatedHash.length === expectedHash.length &&
    timingSafeEqual(calculatedHash, expectedHash)
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = body.pin;

    if (typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: "Veuillez saisir un PIN valide à 6 chiffres." },
        { status: 400 }
      );
    }

    if (!verifyPin(pin)) {
      return NextResponse.json(
        { error: "Code PIN incorrect." },
        { status: 401 }
      );
    }

    const token = createAdminToken();

    const response = NextResponse.json({
      success: true,
      message: "Connexion administrateur réussie.",
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Erreur connexion administrateur :", error);

    const details =
      error instanceof Error ? error.message : "Erreur inconnue";

    return NextResponse.json(
      {
        error: "Erreur interne lors de la connexion.",
        ...(process.env.NODE_ENV !== "production" ? { details } : {}),
      },
      { status: 500 }
    );
  }
}