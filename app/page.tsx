"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MittenIndexDisplay } from "@/components/mitten-index-display";
import { LocationInput } from "@/components/location-input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MittenIndexScore } from "@/lib/types/mitten-index";
import type { WeatherData } from "@/lib/types/weather";

interface MittenIndexResponse extends MittenIndexScore {
  weather: WeatherData;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  timestamp?: string; // When the data was fetched
}

interface CachedData {
  data: MittenIndexResponse;
  timestamp: number;
  locationKey: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function Home() {
  const [data, setData] = useState<MittenIndexResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const cacheRef = useRef<Map<string, CachedData>>(new Map());

  // Check cache before fetching
  const getCachedData = useCallback((lat: number, lon: number): MittenIndexResponse | null => {
    const locationKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    const cached = cacheRef.current.get(locationKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Remove expired cache entry
    if (cached) {
      cacheRef.current.delete(locationKey);
    }
    
    return null;
  }, []);

  // Store in cache
  const setCachedData = useCallback((lat: number, lon: number, data: MittenIndexResponse) => {
    const locationKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    cacheRef.current.set(locationKey, {
      data: { ...data, timestamp: new Date().toISOString() },
      timestamp: Date.now(),
      locationKey,
    });
  }, []);

  const handleLocationChange = useCallback(async (lat: number, lon: number, name?: string, forceRefresh = false) => {
    setLocationName(name || null);
    setError(null);
    
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getCachedData(lat, lon);
      if (cached) {
        setData(cached);
        setLastLocation({ lat, lon, name });
        return;
      }
    }

    setIsLoading(true);
    setData(null);

    try {
      const response = await fetch(`/api/mitten-index?lat=${lat}&lon=${lon}`, {
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

      // Add timestamp
      const resultWithTimestamp = { ...result, timestamp: new Date().toISOString() };
      
      // Cache the result
      setCachedData(lat, lon, resultWithTimestamp);
      
      setData(resultWithTimestamp);
      setLastLocation({ lat, lon, name });
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
  }, [getCachedData, setCachedData]);

  const handleRefresh = useCallback(() => {
    if (lastLocation) {
      handleLocationChange(lastLocation.lat, lastLocation.lon, lastLocation.name, true);
    }
  }, [lastLocation, handleLocationChange]);

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
          <LoadingSkeleton />
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-red-800 mb-1">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="flex gap-2">
                  {lastLocation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError(null);
                        handleLocationChange(
                          lastLocation.lat,
                          lastLocation.lon,
                          lastLocation.name,
                          true // Force refresh
                        );
                      }}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Try Again
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-red-700 hover:bg-red-100"
                    aria-label="Dismiss error"
                  >
                    Dismiss
                  </Button>
                </div>
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
                relativeHumidity: data.weather.relativeHumidity,
                cloudCover: data.weather.cloudCover,
              },
            }}
            locationName={locationName || data.location.name}
            timestamp={data.timestamp}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-24 w-full max-w-md mx-auto" />
            <Skeleton className="h-12 w-32 mx-auto" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
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
  );
}
