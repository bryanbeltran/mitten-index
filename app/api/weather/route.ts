import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentWeather } from "@/lib/api/open-meteo";
import type { LocationCoordinates } from "@/lib/types/weather";

/**
 * API route to fetch current weather data
 * GET /api/weather?lat=44.9778&lon=-93.265
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing latitude or longitude parameters" },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: "Invalid latitude or longitude values" },
      { status: 400 }
    );
  }

  const location: LocationCoordinates = { latitude, longitude };
  const weatherData = await fetchCurrentWeather(location);

  if (!weatherData) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }

  return NextResponse.json(weatherData);
}

