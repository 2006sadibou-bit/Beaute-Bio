
import { NextResponse } from "next/server";
import { createWaveCheckout } from "@/lib/wave";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);
    const clientReference =
      typeof body.clientReference === "string"
        ? body.clientReference
        : `SOPE-${Date.now()}`;

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: "Montant invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const checkout = await createWaveCheckout(
      amount,
      clientReference
    );

    return NextResponse.json({
      success: true,
      checkoutId: checkout.id,
      waveLaunchUrl: checkout.wave_launch_url,
    });
  } catch (error) {
    console.error("Erreur Checkout Wave :", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue.",
      },
      {
        status: 500,
      }
    );
  }
}
