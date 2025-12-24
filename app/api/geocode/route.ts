import { NextRequest, NextResponse } from "next/server";
import { geocodeLocation, geocodeZipCode } from "@/lib/api/geocoding";

/**
 * API route to geocode a location (ZIP code or city name)
 * GET /api/geocode?q=55401 or /api/geocode?q=Minneapolis
 */
export async function GET(request: NextRequest) {
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

  if (!coordinates) {
    return NextResponse.json(
      { error: "Location not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(coordinates);
}

