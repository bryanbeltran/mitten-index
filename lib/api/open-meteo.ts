import type { WeatherData, OpenMeteoCurrentResponse, LocationCoordinates } from "@/lib/types/weather";
import { WeatherAPIError, ValidationError } from "@/lib/errors";

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Validate location coordinates
 */
function validateLocation(location: LocationCoordinates): void {
  if (isNaN(location.latitude) || isNaN(location.longitude)) {
    throw new ValidationError("Invalid coordinates: latitude and longitude must be numbers");
  }
  if (location.latitude < -90 || location.latitude > 90) {
    throw new ValidationError("Invalid latitude: must be between -90 and 90");
  }
  if (location.longitude < -180 || location.longitude > 180) {
    throw new ValidationError("Invalid longitude: must be between -180 and 180");
  }
}

/**
 * Fetch current weather data from Open-Meteo API
 * @param location - Latitude and longitude coordinates
 * @returns Weather data
 * @throws WeatherAPIError if the API call fails
 */
export async function fetchCurrentWeather(
  location: LocationCoordinates
): Promise<WeatherData> {
  validateLocation(location);

  try {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      current: [
        "temperature_2m",
        "apparent_temperature",
        "wind_speed_10m",
        "wind_direction_10m",
        "relative_humidity_2m",
        "cloud_cover",
        "direct_radiation",
      ].join(","),
      timezone: "auto",
    });

    const url = `${OPEN_METEO_BASE_URL}?${params.toString()}`;
    const response = await fetch(url, {
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new WeatherAPIError(
        `Weather API returned ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data: OpenMeteoCurrentResponse = await response.json();

    // Validate response data
    if (!data.current) {
      throw new WeatherAPIError("Invalid response from weather API: missing current data");
    }

    // Check for required fields
    const requiredFields = [
      "temperature_2m",
      "apparent_temperature",
      "wind_speed_10m",
      "relative_humidity_2m",
      "cloud_cover",
    ];

    for (const field of requiredFields) {
      if (data.current[field as keyof typeof data.current] === undefined) {
        throw new WeatherAPIError(`Missing required weather field: ${field}`);
      }
    }

    return {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      relativeHumidity: data.current.relative_humidity_2m,
      cloudCover: data.current.cloud_cover,
      solarRadiation: data.current.direct_radiation,
      time: data.current.time,
    };
  } catch (error) {
    if (error instanceof WeatherAPIError || error instanceof ValidationError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new WeatherAPIError("Request timeout: Weather API did not respond in time");
    }
    throw new WeatherAPIError(
      `Failed to fetch weather data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get coordinates for a city name (simple geocoding)
 * For MVP, we'll use a simple lookup. Can be enhanced with a geocoding API later.
 */
export function getCityCoordinates(cityName: string): LocationCoordinates | null {
  // Simple lookup for common cities - can be expanded or replaced with geocoding API
  const cityMap: Record<string, LocationCoordinates> = {
    minneapolis: { latitude: 44.9778, longitude: -93.265 },
    "st. paul": { latitude: 44.9537, longitude: -93.09 },
    duluth: { latitude: 46.7867, longitude: -92.1005 },
    chicago: { latitude: 41.8781, longitude: -87.6298 },
    newyork: { latitude: 40.7128, longitude: -74.006 },
  };

  const normalized = cityName.toLowerCase().trim();
  return cityMap[normalized] || null;
}

