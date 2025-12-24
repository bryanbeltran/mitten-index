import type { LocationCoordinates } from "@/lib/types/weather";

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

/**
 * Geocode a zip code or city name to coordinates
 * @param query - ZIP code or city name
 * @returns Coordinates or null if not found
 */
export async function geocodeLocation(
  query: string
): Promise<LocationCoordinates | null> {
  try {
    // For US zip codes, we can try to use the format "zipcode, US" or just the zipcode
    const searchQuery = query.trim();
    
    const params = new URLSearchParams({
      name: searchQuery,
      count: "1", // Just get the first result
      language: "en",
      format: "json",
    });

    const url = `${GEOCODING_BASE_URL}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Geocoding API error:", response.statusText);
      return null;
    }

    const data: GeocodingResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
}

/**
 * Geocode a US ZIP code specifically
 * Open-Meteo works with city names, but for ZIP codes we can try the format
 */
export async function geocodeZipCode(
  zipCode: string
): Promise<LocationCoordinates | null> {
  // Remove any non-numeric characters
  const cleanZip = zipCode.replace(/\D/g, "");
  
  // US ZIP codes are 5 digits (or 5+4 format)
  if (cleanZip.length < 5) {
    return null;
  }

  // Try with just the zip code, or with "US" suffix
  const result = await geocodeLocation(cleanZip);
  if (result) {
    return result;
  }

  // Try with "zipcode, US" format
  return await geocodeLocation(`${cleanZip}, US`);
}

