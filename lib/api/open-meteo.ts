import type { WeatherData, OpenMeteoCurrentResponse, LocationCoordinates } from "@/lib/types/weather";

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Fetch current weather data from Open-Meteo API
 * @param location - Latitude and longitude coordinates
 * @returns Weather data or null if fetch fails
 */
export async function fetchCurrentWeather(
  location: LocationCoordinates
): Promise<WeatherData | null> {
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
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Open-Meteo API error:", response.statusText);
      return null;
    }

    const data: OpenMeteoCurrentResponse = await response.json();

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
    console.error("Error fetching weather data:", error);
    return null;
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

