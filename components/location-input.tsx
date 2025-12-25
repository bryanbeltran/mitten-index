"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  onLocationChange: (lat: number, lon: number, locationName?: string) => void;
  isLoading?: boolean;
}

export function LocationInput({ onLocationChange, isLoading }: LocationInputProps) {
  const [zipCode, setZipCode] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange(latitude, longitude, "Current Location");
        setIsGettingLocation(false);
        toast.success("Location found!");
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to get your location. Please enter a ZIP code.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enter a ZIP code.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location unavailable. Please enter a ZIP code.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Please enter a ZIP code.";
        }
        toast.error(errorMessage);
        setIsGettingLocation(false);
      }
    );
  };

  const validateZipCode = (zip: string): string | null => {
    const trimmed = zip.trim();
    if (!trimmed) {
      return "Please enter a ZIP code";
    }
    const zipPattern = /^\d{5}(-\d{4})?$/;
    if (!zipPattern.test(trimmed)) {
      return "Please enter a valid 5-digit ZIP code (e.g., 55401)";
    }
    return null;
  };

  // Debounced validation
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!zipCode.trim()) {
      setValidationError(null);
      return;
    }

    // Debounce validation by 500ms
    debounceTimerRef.current = setTimeout(() => {
      const error = validateZipCode(zipCode);
      setValidationError(error);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [zipCode]);

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setZipCode(value);
    // Clear error immediately when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleZipCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const zip = zipCode.trim();

    const error = validateZipCode(zip);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    setIsGeocoding(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(zip)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 
          (response.status === 404 
            ? "ZIP code not found. Please verify the ZIP code is correct."
            : response.status === 400
            ? "Invalid ZIP code format. Please enter a 5-digit US ZIP code."
            : "Unable to find location. Please try again.");
        throw new Error(errorMessage);
      }

      const locationData = await response.json();
      
      // Validate coordinates
      if (!locationData.latitude || !locationData.longitude) {
        throw new Error("Invalid response from server");
      }

      // Format location name
      const locationName = locationData.name 
        ? `${locationData.name}${locationData.admin1 ? `, ${locationData.admin1}` : ""}`
        : undefined;

      onLocationChange(locationData.latitude, locationData.longitude, locationName);
      setIsGeocoding(false);
      toast.success(locationName ? `Found ${locationName}` : "Location found!");
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unable to find location for that ZIP code. Please try another.";
      
      console.error("Geocoding error:", error);
      toast.error(errorMessage);
      setIsGeocoding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGetCurrentLocation}
          disabled={isLoading || isGettingLocation}
          className="w-full"
          variant="outline"
        >
          <Navigation className="mr-2 h-4 w-4" />
          {isGettingLocation ? "Getting location..." : "Use Current Location"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <form onSubmit={handleZipCodeSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="zipcode">ZIP Code</Label>
            <Input
              id="zipcode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}(-[0-9]{4})?"
              placeholder="55401"
              value={zipCode}
              onChange={handleZipCodeChange}
              onBlur={() => {
                if (zipCode.trim()) {
                  const error = validateZipCode(zipCode);
                  setValidationError(error);
                }
              }}
              disabled={isLoading || isGeocoding}
              maxLength={10}
              className={cn(
                validationError && "border-red-500 focus-visible:ring-red-500"
              )}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? "zipcode-error" : "zipcode-help"}
            />
            {validationError ? (
              <p id="zipcode-error" className="text-xs text-red-600 mt-1">
                {validationError}
              </p>
            ) : (
              <p id="zipcode-help" className="text-xs text-muted-foreground mt-1">
                Enter a 5-digit US ZIP code
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || isGeocoding}
            className="w-full"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {isGeocoding ? "Looking up location..." : "Get Mitten Index"}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Quick examples:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={async () => {
                setZipCode("55401");
                setIsGeocoding(true);
                try {
                  const response = await fetch("/api/geocode?q=55401");
                  if (response.ok) {
                    const locationData = await response.json();
                    const locationName = locationData.name 
                      ? `${locationData.name}${locationData.admin1 ? `, ${locationData.admin1}` : ""}`
                      : undefined;
                    onLocationChange(locationData.latitude, locationData.longitude, locationName);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to load location");
                } finally {
                  setIsGeocoding(false);
                }
              }}
              className="text-blue-600 hover:underline"
              disabled={isLoading || isGeocoding}
            >
              Minneapolis (55401)
            </button>
            <button
              type="button"
              onClick={async () => {
                setZipCode("55802");
                setIsGeocoding(true);
                try {
                  const response = await fetch("/api/geocode?q=55802");
                  if (response.ok) {
                    const locationData = await response.json();
                    const locationName = locationData.name 
                      ? `${locationData.name}${locationData.admin1 ? `, ${locationData.admin1}` : ""}`
                      : undefined;
                    onLocationChange(locationData.latitude, locationData.longitude, locationName);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to load location");
                } finally {
                  setIsGeocoding(false);
                }
              }}
              className="text-blue-600 hover:underline"
              disabled={isLoading || isGeocoding}
            >
              Duluth (55802)
            </button>
            <button
              type="button"
              onClick={async () => {
                setZipCode("60601");
                setIsGeocoding(true);
                try {
                  const response = await fetch("/api/geocode?q=60601");
                  if (response.ok) {
                    const locationData = await response.json();
                    const locationName = locationData.name 
                      ? `${locationData.name}${locationData.admin1 ? `, ${locationData.admin1}` : ""}`
                      : undefined;
                    onLocationChange(locationData.latitude, locationData.longitude, locationName);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to load location");
                } finally {
                  setIsGeocoding(false);
                }
              }}
              className="text-blue-600 hover:underline"
              disabled={isLoading || isGeocoding}
            >
              Chicago (60601)
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

