/**
 * Weather data types for Open-Meteo API
 */

export interface WeatherData {
  temperature: number; // Celsius
  apparentTemperature: number; // "Feels like" temperature in Celsius
  windSpeed: number; // km/h
  windDirection: number; // degrees
  relativeHumidity: number; // percentage (0-100)
  cloudCover: number; // percentage (0-100)
  solarRadiation?: number; // W/m² (if available)
  time: string; // ISO timestamp
}

export interface OpenMeteoCurrentResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    relative_humidity_2m: number;
    cloud_cover: number;
    sunshine_duration?: number;
    direct_radiation?: number;
  };
  current_units: {
    temperature_2m: string;
    apparent_temperature: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    relative_humidity_2m: string;
    cloud_cover: string;
  };
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

