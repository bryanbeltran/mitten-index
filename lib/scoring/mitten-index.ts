import type { WeatherData } from "@/lib/types/weather";
import type {
  MittenIndexScore,
  MittenIndexCategory,
  ScoreFactors,
  DressingRecommendation,
} from "@/lib/types/mitten-index";

/**
 * Calculate the Mitten Index score from weather data
 * Score: 0-100 where higher = more brutal
 */
export function calculateMittenIndex(weather: WeatherData): MittenIndexScore {
  const factors = calculateFactors(weather);
  const score = calculateOverallScore(factors);
  const category = getCategory(score);
  const recommendation = getRecommendation(category, score);

  return {
    score: Math.round(score),
    category,
    factors,
    recommendation,
  };
}

/**
 * Calculate individual factor contributions (0-100 each)
 */
function calculateFactors(weather: WeatherData): ScoreFactors {
  // Temperature factor: colder = higher score
  // Below 32°F (0°C) starts getting serious, below 0°F (-18°C) is brutal
  const tempFactor = calculateTemperatureFactor(weather.temperature);

  // Wind chill factor: uses apparent temperature (feels like)
  // The difference between actual and apparent temp indicates wind impact
  const windChillFactor = calculateWindChillFactor(
    weather.temperature,
    weather.apparentTemperature,
    weather.windSpeed
  );

  // Humidity factor: higher humidity makes cold feel worse (bone-deep chill)
  // But only matters when it's already cold
  const humidityFactor = calculateHumidityFactor(
    weather.temperature,
    weather.relativeHumidity
  );

  // Cloud cover factor: more clouds = colder feeling (no sun warmth)
  const cloudCoverFactor = weather.cloudCover;

  // Sunlight factor: inverse of cloud cover, but also considers solar radiation
  const sunlightFactor = calculateSunlightFactor(
    weather.cloudCover,
    weather.solarRadiation
  );

  return {
    temperature: tempFactor,
    windChill: windChillFactor,
    humidity: humidityFactor,
    cloudCover: cloudCoverFactor,
    sunlight: sunlightFactor,
  };
}

/**
 * Temperature contribution to score
 * Colder temperatures = higher score
 */
function calculateTemperatureFactor(tempCelsius: number): number {
  // Convert to Fahrenheit for more intuitive thresholds
  const tempF = celsiusToFahrenheit(tempCelsius);

  if (tempF >= 50) return 0; // Pleasant
  if (tempF >= 32) return 20; // Chilly
  if (tempF >= 20) return 40; // Cold
  if (tempF >= 0) return 60; // Very cold
  if (tempF >= -10) return 80; // Brutal
  return 100; // Arctic
}

/**
 * Wind chill contribution
 * Based on the difference between actual and apparent temperature
 */
function calculateWindChillFactor(
  tempC: number,
  apparentTempC: number,
  windSpeedKmh: number
): number {
  const tempF = celsiusToFahrenheit(tempC);
  const apparentTempF = celsiusToFahrenheit(apparentTempC);
  const windSpeedMph = kmhToMph(windSpeedKmh);

  // If it's already warm, wind doesn't matter much
  if (tempF >= 50) return 0;

  // Calculate wind chill impact
  const tempDifference = tempF - apparentTempF;

  // Wind speed contribution (mph)
  let windContribution = 0;
  if (windSpeedMph >= 25) windContribution = 40; // Strong wind
  else if (windSpeedMph >= 15) windContribution = 25;
  else if (windSpeedMph >= 10) windContribution = 15;
  else if (windSpeedMph >= 5) windContribution = 5;

  // Temperature difference contribution (how much colder it feels)
  const differenceContribution = Math.min(tempDifference * 2, 40);

  // Only apply wind chill when it's actually cold
  if (tempF < 32) {
    return Math.min(windContribution + differenceContribution, 100);
  }

  return Math.min(windContribution, 30);
}

/**
 * Humidity contribution
 * Higher humidity makes cold feel worse, but only when it's already cold
 */
function calculateHumidityFactor(tempC: number, humidity: number): number {
  const tempF = celsiusToFahrenheit(tempC);

  // Humidity only matters when it's cold
  if (tempF >= 40) return 0;

  // Higher humidity = worse when cold
  // But the effect is more pronounced the colder it gets
  if (tempF < 0) {
    // Very cold + high humidity = bone-deep chill
    return Math.min((humidity / 100) * 30, 30);
  } else if (tempF < 20) {
    // Cold + high humidity
    return Math.min((humidity / 100) * 20, 20);
  } else {
    // Chilly + high humidity
    return Math.min((humidity / 100) * 10, 10);
  }
}

/**
 * Sunlight contribution (inverse of cloud cover)
 * More sunlight = lower score (feels warmer)
 */
function calculateSunlightFactor(
  cloudCover: number,
  solarRadiation?: number
): number {
  // Cloud cover: 0% = sunny (good), 100% = overcast (bad)
  // We want to subtract from the score when sunny
  const cloudPenalty = cloudCover;

  // Solar radiation bonus (if available)
  // Higher radiation = more warmth from sun
  let radiationBonus = 0;
  if (solarRadiation !== undefined) {
    // Normalize solar radiation (typical range 0-1000 W/m²)
    radiationBonus = Math.min((solarRadiation / 1000) * 15, 15);
  }

  // Return the penalty (higher = worse)
  // This will be subtracted from the score
  return cloudPenalty - radiationBonus;
}

/**
 * Calculate overall score from factors
 * Weighted combination of all factors
 */
function calculateOverallScore(factors: ScoreFactors): number {
  // Weighted contributions
  const weights = {
    temperature: 0.40, // Most important
    windChill: 0.30, // Very important
    humidity: 0.15, // Matters when cold
    cloudCover: 0.10, // Moderate impact
    sunlight: -0.05, // Subtracts from score (sunlight helps)
  };

  let score =
    factors.temperature * weights.temperature +
    factors.windChill * weights.windChill +
    factors.humidity * weights.humidity +
    factors.cloudCover * weights.cloudCover -
    factors.sunlight * Math.abs(weights.sunlight);

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get category from score
 */
function getCategory(score: number): MittenIndexCategory {
  if (score < 20) return "pleasant";
  if (score < 40) return "chilly";
  if (score < 60) return "cold";
  if (score < 80) return "brutal";
  return "arctic";
}

/**
 * Get dressing recommendation based on category and score
 */
function getRecommendation(
  category: MittenIndexCategory,
  score: number
): string {
  const recommendations: Record<MittenIndexCategory, string[]> = {
    pleasant: [
      "Light jacket or sweater should be fine",
      "You might not even need a jacket if you're moving around",
    ],
    chilly: [
      "Grab a jacket or light coat",
      "Maybe a hat if you're sensitive to cold",
    ],
    cold: [
      "Wear a warm coat",
      "Hat and gloves recommended",
      "Consider layers",
    ],
    brutal: [
      "Heavy winter coat essential",
      "Wear multiple layers",
      "Hat, gloves, and scarf required",
      "Consider long underwear",
      "Protect exposed skin",
    ],
    arctic: [
      "Full winter gear required",
      "Multiple layers including base layer",
      "Heavy coat, hat, gloves, scarf, face protection",
      "Limit time outdoors",
      "Consider hand and foot warmers",
    ],
  };

  const categoryRecs = recommendations[category];
  // Return the most appropriate recommendation based on score within category
  const index = Math.min(
    Math.floor((score % 20) / 5),
    categoryRecs.length - 1
  );
  return categoryRecs[index] || categoryRecs[0];
}

/**
 * Get detailed dressing recommendations
 */
export function getDressingRecommendation(
  category: MittenIndexCategory,
  score: number
): DressingRecommendation {
  const baseRecommendations: Record<
    MittenIndexCategory,
    DressingRecommendation
  > = {
    pleasant: {
      layers: ["T-shirt or light sweater"],
      accessories: [],
      tips: ["You'll be comfortable in light clothing"],
    },
    chilly: {
      layers: ["Long-sleeve shirt", "Light jacket or sweater"],
      accessories: ["Optional hat"],
      tips: ["Layer up if you'll be outside for a while"],
    },
    cold: {
      layers: ["Base layer", "Warm sweater or fleece", "Winter coat"],
      accessories: ["Hat", "Gloves"],
      tips: ["Keep your head and hands warm"],
    },
    brutal: {
      layers: [
        "Base layer (long underwear)",
        "Insulating layer (fleece or wool)",
        "Heavy winter coat",
      ],
      accessories: ["Warm hat", "Insulated gloves", "Scarf"],
      tips: [
        "Cover all exposed skin",
        "Wear warm socks and boots",
        "Consider hand warmers",
      ],
    },
    arctic: {
      layers: [
        "Thermal base layer",
        "Insulating mid-layer",
        "Heavy insulated coat",
        "Windproof outer layer",
      ],
      accessories: [
        "Insulated hat with ear coverage",
        "Insulated gloves or mittens",
        "Face mask or balaclava",
        "Scarf",
      ],
      tips: [
        "Limit outdoor exposure",
        "Use hand and foot warmers",
        "Watch for signs of frostbite",
        "Stay dry - moisture makes it worse",
      ],
    },
  };

  return baseRecommendations[category];
}

// Utility functions
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

