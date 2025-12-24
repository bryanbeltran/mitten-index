/**
 * Mitten Index scoring types
 */

export interface MittenIndexScore {
  score: number; // 0-100, where higher = more brutal
  category: MittenIndexCategory;
  factors: ScoreFactors;
  recommendation: string;
}

export type MittenIndexCategory =
  | "pleasant"
  | "chilly"
  | "cold"
  | "brutal"
  | "arctic";

export interface ScoreFactors {
  temperature: number; // 0-100 contribution
  windChill: number; // 0-100 contribution
  humidity: number; // 0-100 contribution
  cloudCover: number; // 0-100 contribution
  sunlight: number; // 0-100 contribution (inverse of cloud cover)
}

export interface DressingRecommendation {
  layers: string[];
  accessories: string[];
  tips: string[];
}

