"use client";

import { useState } from "react";
import { MittenIndexDisplay } from "@/components/mitten-index-display";
import { LocationInput } from "@/components/location-input";
import type { MittenIndexScore } from "@/lib/types/mitten-index";
import type { WeatherData } from "@/lib/types/weather";

interface MittenIndexResponse extends MittenIndexScore {
  weather: WeatherData;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function Home() {
  const [data, setData] = useState<MittenIndexResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/mitten-index?lat=${lat}&lon=${lon}`, {
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.error || "Failed to fetch Mitten Index";
        
        // Provide user-friendly error messages
        if (response.status === 400) {
          errorMessage = "Invalid location. Please try a different ZIP code.";
        } else if (response.status === 404) {
          errorMessage = "Location not found. Please verify the ZIP code.";
        } else if (response.status === 502 || response.status === 503) {
          errorMessage = "Weather service is temporarily unavailable. Please try again later.";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
        
        throw new Error(errorMessage);
      }

      const result: MittenIndexResponse = await response.json();
      
      // Validate response data
      if (!result.score && result.score !== 0) {
        throw new Error("Invalid response from server");
      }

      setData(result);
    } catch (err) {
      let errorMessage = "An error occurred";
      
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage = "Request timed out. Please check your connection and try again.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setData(null);
      console.error("Error fetching Mitten Index:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">🧤 Mitten Index</h1>
          <p className="text-lg text-muted-foreground">
            How brutal does it really feel out there?
          </p>
        </div>

        <LocationInput
          onLocationChange={handleLocationChange}
          isLoading={isLoading}
        />

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-muted-foreground">
              Calculating Mitten Index...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {data && !isLoading && (
          <MittenIndexDisplay
            data={{
              ...data,
              weather: {
                temperature: data.weather.temperature,
                apparentTemperature: data.weather.apparentTemperature,
                windSpeed: data.weather.windSpeed,
                relativeHumidity: data.weather.relativeHumidity,
                cloudCover: data.weather.cloudCover,
              },
            }}
          />
        )}
      </div>
    </main>
  );
}
