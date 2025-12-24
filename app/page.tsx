"use client";

import { useState } from "react";
import { MittenIndexDisplay } from "@/components/mitten-index-display";
import { LocationInput } from "@/components/location-input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MittenIndexScore } from "@/lib/types/mitten-index";
import type { WeatherData } from "@/lib/types/weather";

interface MittenIndexResponse extends MittenIndexScore {
  weather: WeatherData & {
    windDirection?: number;
    time?: string;
  };
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

export default function Home() {
  const [data, setData] = useState<MittenIndexResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  const handleLocationChange = async (lat: number, lon: number, name?: string) => {
    setLocationName(name || null);
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
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-20 w-32" />
                  </div>
                  <Skeleton className="h-8 w-full max-w-md mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-red-800 mb-1">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    // Retry with last location if available
                    if (data?.location) {
                      handleLocationChange(
                        data.location.latitude,
                        data.location.longitude,
                        locationName || undefined
                      );
                    }
                  }}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!data && !isLoading && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">🧤</div>
                <h3 className="text-xl font-semibold">Get Your Mitten Index</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter a ZIP code or use your current location to see how brutal it really feels out there.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {data && !isLoading && (
          <MittenIndexDisplay
            data={{
              ...data,
              weather: {
                temperature: data.weather.temperature,
                apparentTemperature: data.weather.apparentTemperature,
                windSpeed: data.weather.windSpeed,
                windDirection: data.weather.windDirection,
                relativeHumidity: data.weather.relativeHumidity,
                cloudCover: data.weather.cloudCover,
                time: data.weather.time,
              },
            }}
            locationName={locationName || data.location.name}
            onRefresh={() => {
              if (data.location) {
                handleLocationChange(
                  data.location.latitude,
                  data.location.longitude,
                  locationName || undefined
                );
              }
            }}
            isRefreshing={isLoading}
          />
        )}
      </div>
    </main>
  );
}
