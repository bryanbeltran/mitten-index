import { NextRequest, NextResponse } from "next/server";
import { geocodeLocation, geocodeZipCode } from "@/lib/api/geocoding";
import { GeocodingError, ValidationError } from "@/lib/errors";

/**
 * API route to geocode a location (ZIP code or city name)
 * GET /api/geocode?q=55401 or /api/geocode?q=Minneapolis
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter 'q'" },
        { status: 400 }
      );
    }

    // Check if it looks like a ZIP code (5 digits)
    const zipCodePattern = /^\d{5}(-\d{4})?$/;
    const isZipCode = zipCodePattern.test(query.trim());

    const coordinates = isZipCode
      ? await geocodeZipCode(query)
      : await geocodeLocation(query);

    return NextResponse.json(coordinates);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    if (error instanceof GeocodingError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    console.error("Unexpected error in geocode route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

