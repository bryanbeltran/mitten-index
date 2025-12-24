import { describe, it, expect } from "vitest";
import { calculateMittenIndex, getDressingRecommendation } from "../mitten-index";
import type { WeatherData } from "@/lib/types/weather";

describe("calculateMittenIndex", () => {
  it("should calculate a low score for pleasant weather", () => {
    const weather: WeatherData = {
      temperature: 20, // 68°F - pleasant
      apparentTemperature: 20,
      windSpeed: 5, // ~3 mph - light wind
      windDirection: 180,
      relativeHumidity: 50,
      cloudCover: 20, // Mostly sunny
      solarRadiation: 500,
      time: "2024-01-01T12:00:00Z",
    };

    const result = calculateMittenIndex(weather);

    expect(result.score).toBeLessThan(30);
    expect(result.category).toBe("pleasant");
    expect(result.factors.temperature).toBeLessThan(30);
  });

  it("should calculate a high score for brutal cold weather", () => {
    const weather: WeatherData = {
      temperature: -15, // 5°F - very cold
      apparentTemperature: -25, // -13°F - feels much colder
      windSpeed: 30, // ~19 mph - strong wind
      windDirection: 270,
      relativeHumidity: 80, // High humidity makes it worse
      cloudCover: 90, // Overcast
      solarRadiation: 0,
      time: "2024-01-01T12:00:00Z",
    };

    const result = calculateMittenIndex(weather);

    // Score should be in the cold/brutal range
    expect(result.score).toBeGreaterThan(40);
    expect(["cold", "brutal"]).toContain(result.category);
    expect(result.factors.temperature).toBeGreaterThanOrEqual(60);
    expect(result.factors.windChill).toBeGreaterThan(20);
  });

  it("should calculate arctic category for extreme cold", () => {
    const weather: WeatherData = {
      temperature: -30, // -22°F - extremely cold
      apparentTemperature: -50, // -58°F - extreme wind chill
      windSpeed: 50, // ~31 mph - very strong wind
      windDirection: 0,
      relativeHumidity: 90, // Very high humidity
      cloudCover: 100, // Completely overcast
      solarRadiation: 0,
      time: "2024-01-01T12:00:00Z",
    };

    const result = calculateMittenIndex(weather);

    // Should be in brutal or arctic range
    expect(result.score).toBeGreaterThan(60);
    expect(["brutal", "arctic"]).toContain(result.category);
    expect(result.factors.temperature).toBe(100); // Max temperature factor
  });

  it("should factor in wind chill correctly", () => {
    const coldWithWind: WeatherData = {
      temperature: 0, // 32°F
      apparentTemperature: -15, // 5°F - wind makes it feel much colder
      windSpeed: 25, // ~15 mph
      windDirection: 180,
      relativeHumidity: 60,
      cloudCover: 50,
      solarRadiation: 200,
      time: "2024-01-01T12:00:00Z",
    };

    const coldWithoutWind: WeatherData = {
      temperature: 0, // 32°F
      apparentTemperature: 0, // 32°F - no wind
      windSpeed: 2, // ~1 mph
      windDirection: 180,
      relativeHumidity: 60,
      cloudCover: 50,
      solarRadiation: 200,
      time: "2024-01-01T12:00:00Z",
    };

    const withWind = calculateMittenIndex(coldWithWind);
    const withoutWind = calculateMittenIndex(coldWithoutWind);

    expect(withWind.score).toBeGreaterThan(withoutWind.score);
    expect(withWind.factors.windChill).toBeGreaterThan(withoutWind.factors.windChill);
  });

  it("should factor in cloud cover and sunlight", () => {
    const sunny: WeatherData = {
      temperature: 5, // 41°F
      apparentTemperature: 5,
      windSpeed: 10,
      windDirection: 180,
      relativeHumidity: 50,
      cloudCover: 10, // Mostly sunny
      solarRadiation: 600, // High solar radiation
      time: "2024-01-01T12:00:00Z",
    };

    const overcast: WeatherData = {
      temperature: 5, // 41°F
      apparentTemperature: 5,
      windSpeed: 10,
      windDirection: 180,
      relativeHumidity: 50,
      cloudCover: 100, // Overcast
      solarRadiation: 0, // No solar radiation
      time: "2024-01-01T12:00:00Z",
    };

    const sunnyResult = calculateMittenIndex(sunny);
    const overcastResult = calculateMittenIndex(overcast);

    // Overcast should feel colder (higher score)
    expect(overcastResult.score).toBeGreaterThan(sunnyResult.score);
  });

  it("should provide a recommendation", () => {
    const weather: WeatherData = {
      temperature: -10, // 14°F
      apparentTemperature: -20, // -4°F
      windSpeed: 20,
      windDirection: 180,
      relativeHumidity: 70,
      cloudCover: 80,
      solarRadiation: 100,
      time: "2024-01-01T12:00:00Z",
    };

    const result = calculateMittenIndex(weather);

    expect(result.recommendation).toBeTruthy();
    expect(result.recommendation.length).toBeGreaterThan(0);
  });

  it("should handle edge cases", () => {
    const veryWarm: WeatherData = {
      temperature: 30, // 86°F - not cold at all
      apparentTemperature: 30,
      windSpeed: 5,
      windDirection: 180,
      relativeHumidity: 50,
      cloudCover: 30,
      solarRadiation: 700,
      time: "2024-01-01T12:00:00Z",
    };

    const result = calculateMittenIndex(veryWarm);

    expect(result.score).toBeLessThan(20);
    expect(result.category).toBe("pleasant");
  });
});

describe("getDressingRecommendation", () => {
  it("should return appropriate recommendations for pleasant weather", () => {
    const rec = getDressingRecommendation("pleasant", 15);

    expect(rec.layers).toContain("T-shirt or light sweater");
    expect(rec.accessories.length).toBe(0);
  });

  it("should return appropriate recommendations for brutal weather", () => {
    const rec = getDressingRecommendation("brutal", 75);

    expect(rec.layers.length).toBeGreaterThan(2);
    expect(rec.accessories).toContain("Warm hat");
    expect(rec.accessories).toContain("Insulated gloves");
    expect(rec.tips.length).toBeGreaterThan(0);
  });

  it("should return appropriate recommendations for arctic weather", () => {
    const rec = getDressingRecommendation("arctic", 95);

    expect(rec.layers.length).toBeGreaterThan(3);
    expect(rec.accessories).toContain("Face mask or balaclava");
    expect(rec.tips).toContain("Limit outdoor exposure");
  });
});

