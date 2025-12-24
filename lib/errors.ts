/**
 * Custom error types for the application
 */

export class WeatherAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "WeatherAPIError";
  }
}

export class GeocodingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeocodingError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

