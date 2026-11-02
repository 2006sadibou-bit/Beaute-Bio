import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { origin, destination } = await request.json();

    const values = [
      origin?.longitude,
      origin?.latitude,
      destination?.longitude,
      destination?.latitude,
    ];

    if (
      !values.every(
        (value) =>
          typeof value === "number" && Number.isFinite(value)
      )
    ) {
      return NextResponse.json(
        { error: "Coordonnées invalides" },
        { status: 400 }
      );
    }

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.longitude},${origin.latitude};` +
      `${destination.longitude},${destination.latitude}` +
      `?overview=false`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Erreur du service de calcul");
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: "Aucun itinéraire trouvé" },
        { status: 404 }
      );
    }

    const route = data.routes[0];

    return NextResponse.json({
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      durationMinutes: Math.ceil(route.duration / 60),
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Impossible de calculer la distance" },
      { status: 500 }
    );
  }
}