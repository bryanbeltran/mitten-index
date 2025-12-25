import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentWeather } from "@/lib/api/open-meteo";
import { calculateMittenIndex } from "@/lib/scoring/mitten-index";
import { WeatherAPIError, ValidationError } from "@/lib/errors";
import type { LocationCoordinates } from "@/lib/types/weather";

/**
 * API route to calculate Mitten Index
 * GET /api/mitten-index?lat=44.9778&lon=-93.265
 */
export async function GET(request: NextRequest) {
  try {
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

    // Fetch weather data
    const weatherData = await fetchCurrentWeather(location);

    // Calculate Mitten Index
    const mittenIndex = calculateMittenIndex(weatherData);

    // Add cache headers (5 minutes)
    const response = NextResponse.json({
      ...mittenIndex,
      weather: weatherData,
      location,
    });

    // Set cache headers for client-side caching
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    if (error instanceof WeatherAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 502 }
      );
    }
    console.error("Unexpected error in mitten-index route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

