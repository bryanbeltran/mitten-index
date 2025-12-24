"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

interface LocationInputProps {
  onLocationChange: (lat: number, lon: number) => void;
  isLoading?: boolean;
}

export function LocationInput({ onLocationChange, isLoading }: LocationInputProps) {
  const [zipCode, setZipCode] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange(latitude, longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please enter a ZIP code.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleZipCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const zip = zipCode.trim();

    if (!zip) {
      alert("Please enter a ZIP code");
      return;
    }

    // Basic validation for US ZIP codes (5 digits, optionally with -4 extension)
    const zipPattern = /^\d{5}(-\d{4})?$/;
    if (!zipPattern.test(zip)) {
      alert("Please enter a valid 5-digit ZIP code (e.g., 55401)");
      return;
    }

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

      const coordinates = await response.json();
      
      // Validate coordinates
      if (!coordinates.latitude || !coordinates.longitude) {
        throw new Error("Invalid response from server");
      }

      onLocationChange(coordinates.latitude, coordinates.longitude);
      setIsGeocoding(false);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unable to find location for that ZIP code. Please try another.";
      
      // Don't show alert for user-initiated errors, but log them
      console.error("Geocoding error:", error);
      alert(errorMessage);
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <form onSubmit={handleZipCodeSubmit} className="space-y-3">
          <div>
            <label htmlFor="zipcode" className="text-sm text-muted-foreground">
              ZIP Code
            </label>
            <Input
              id="zipcode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}(-[0-9]{4})?"
              placeholder="55401"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              disabled={isLoading || isGeocoding}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a 5-digit US ZIP code
            </p>
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
                    const coords = await response.json();
                    onLocationChange(coords.latitude, coords.longitude);
                  }
                } catch (error) {
                  console.error(error);
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
                    const coords = await response.json();
                    onLocationChange(coords.latitude, coords.longitude);
                  }
                } catch (error) {
                  console.error(error);
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
                    const coords = await response.json();
                    onLocationChange(coords.latitude, coords.longitude);
                  }
                } catch (error) {
                  console.error(error);
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

