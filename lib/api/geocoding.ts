import type { LocationCoordinates } from "@/lib/types/weather";
import { GeocodingError, ValidationError } from "@/lib/errors";

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}

export interface GeocodingLocation {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  admin1?: string; // State/Province
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

/**
 * Geocode a zip code or city name to coordinates
 * @param query - ZIP code or city name
 * @returns Location with coordinates and name
 * @throws GeocodingError if geocoding fails
 */
export async function geocodeLocation(
  query: string
): Promise<GeocodingLocation> {
  const searchQuery = query.trim();
  
  if (!searchQuery) {
    throw new ValidationError("Query cannot be empty");
  }

  try {
    const params = new URLSearchParams({
      name: searchQuery,
      count: "1", // Just get the first result
      language: "en",
      format: "json",
    });

    const url = `${GEOCODING_BASE_URL}?${params.toString()}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new GeocodingError(
        `Geocoding API returned ${response.status}: ${response.statusText}`
      );
    }

    const data: GeocodingResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new GeocodingError(`No results found for "${searchQuery}"`);
    }

    const result = data.results[0];
    
    // Validate coordinates
    if (isNaN(result.latitude) || isNaN(result.longitude)) {
      throw new GeocodingError("Invalid coordinates returned from geocoding API");
    }

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
      country: result.country,
      admin1: result.admin1,
    };
  } catch (error) {
    if (error instanceof GeocodingError || error instanceof ValidationError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new GeocodingError("Request timeout: Geocoding API did not respond in time");
    }
    throw new GeocodingError(
      `Failed to geocode location: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Geocode a US ZIP code specifically
 * Open-Meteo works with city names, but for ZIP codes we can try the format
 * @throws GeocodingError if ZIP code cannot be geocoded
 */
export async function geocodeZipCode(
  zipCode: string
): Promise<GeocodingLocation> {
  // Remove any non-numeric characters
  const cleanZip = zipCode.replace(/\D/g, "");
  
  // US ZIP codes are 5 digits (or 5+4 format)
  if (cleanZip.length < 5) {
    throw new ValidationError("ZIP code must be at least 5 digits");
  }

  // Try with just the zip code first
  try {
    return await geocodeLocation(cleanZip);
  } catch (error) {
    // If that fails, try with "zipcode, US" format
    try {
      return await geocodeLocation(`${cleanZip}, US`);
    } catch (secondError) {
      // If both fail, throw the original error
      throw new GeocodingError(
        `Could not find location for ZIP code ${zipCode}. Please verify the ZIP code is correct.`
      );
    }
  }
}

