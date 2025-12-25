"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { MittenIndexScore } from "@/lib/types/mitten-index";
import { getDressingRecommendation } from "@/lib/scoring/mitten-index";
import { cn } from "@/lib/utils";

interface MittenIndexDisplayProps {
  data: MittenIndexScore & {
    weather?: {
      temperature: number;
      apparentTemperature: number;
      windSpeed: number;
      relativeHumidity: number;
      cloudCover: number;
    };
  };
  locationName?: string | null;
  timestamp?: string;
  onRefresh?: () => void;
}

const categoryColors: Record<string, string> = {
  pleasant: "bg-green-100 text-green-800 border-green-300",
  chilly: "bg-blue-100 text-blue-800 border-blue-300",
  cold: "bg-cyan-100 text-cyan-800 border-cyan-300",
  brutal: "bg-orange-100 text-orange-800 border-orange-300",
  arctic: "bg-red-100 text-red-800 border-red-300",
};

const categoryEmojis: Record<string, string> = {
  pleasant: "😊",
  chilly: "🧊",
  cold: "🥶",
  brutal: "🧤",
  arctic: "❄️",
};

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

export function MittenIndexDisplay({ data, locationName, timestamp, onRefresh }: MittenIndexDisplayProps) {
  const { score, category, factors, recommendation, weather } = data;
  const detailedRecommendation = getDressingRecommendation(category, score);

  const formatTimestamp = (ts?: string) => {
    if (!ts) return null;
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Score Display */}
      <Card className="text-center">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Mitten Index</CardTitle>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
                aria-label="Refresh weather data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          {locationName && (
            <p className="text-sm text-muted-foreground mt-2">{locationName}</p>
          )}
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated {formatTimestamp(timestamp)}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score Gauge Visualization */}
          <div className="w-full max-w-md mx-auto space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden border border-gray-300">
              <div
                className={cn(
                  "h-8 rounded-full transition-all duration-1000 ease-out",
                  score < 20
                    ? "bg-green-500"
                    : score < 40
                    ? "bg-blue-500"
                    : score < 60
                    ? "bg-cyan-500"
                    : score < 80
                    ? "bg-orange-500"
                    : "bg-red-500"
                )}
                style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Mitten Index score: ${score} out of 100`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className="text-6xl">{categoryEmojis[category]}</span>
            <div>
              <div className="text-7xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>
          <Badge
            className={`text-lg px-4 py-2 ${categoryColors[category]}`}
            variant="outline"
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
          <p className="text-lg font-medium mt-4">{recommendation}</p>
        </CardContent>
      </Card>

      {/* Detailed Dressing Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>What to Wear</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Layers:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {detailedRecommendation.layers.map((layer, index) => (
                <li key={index} className="text-muted-foreground">{layer}</li>
              ))}
            </ul>
          </div>
          {detailedRecommendation.accessories.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Accessories:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {detailedRecommendation.accessories.map((accessory, index) => (
                  <li key={index} className="text-muted-foreground">{accessory}</li>
                ))}
              </ul>
            </div>
          )}
          {detailedRecommendation.tips.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {detailedRecommendation.tips.map((tip, index) => (
                  <li key={index} className="text-muted-foreground">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weather Conditions */}
      {weather && (
        <Card>
          <CardHeader>
            <CardTitle>Current Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Temperature</div>
                <div className="text-2xl font-bold">
                  {Math.round(celsiusToFahrenheit(weather.temperature))}°F
                </div>
                <div className="text-xs text-muted-foreground">
                  Feels like {Math.round(celsiusToFahrenheit(weather.apparentTemperature))}°F
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Wind Speed</div>
                <div className="text-2xl font-bold">
                  {Math.round(kmhToMph(weather.windSpeed))} mph
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Humidity</div>
                <div className="text-2xl font-bold">
                  {Math.round(weather.relativeHumidity)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Cloud Cover</div>
                <div className="text-2xl font-bold">
                  {Math.round(weather.cloudCover)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contributing Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Contributing Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FactorBar
            label="Temperature"
            value={factors.temperature}
            weight={40}
          />
          <FactorBar
            label="Wind Chill"
            value={factors.windChill}
            weight={30}
          />
          <FactorBar label="Humidity" value={factors.humidity} weight={15} />
          <FactorBar
            label="Cloud Cover"
            value={factors.cloudCover}
            weight={10}
          />
          <FactorBar
            label="Sunlight"
            value={factors.sunlight}
            weight={5}
            isBonus
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FactorBar({
  label,
  value,
  weight,
  isBonus = false,
}: {
  label: string;
  value: number;
  weight: number;
  isBonus?: boolean;
}) {
  const percentage = Math.round(value);
  const contribution = Math.round((value * weight) / 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {isBonus ? `-${contribution}` : `+${contribution}`} points
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${
            isBonus ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

