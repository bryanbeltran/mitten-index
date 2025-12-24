import { describe, it, expect } from "vitest";
import { WeatherAPIError, GeocodingError, ValidationError } from "@/lib/errors";

describe("Custom Errors", () => {
  describe("WeatherAPIError", () => {
    it("should create error with message", () => {
      const error = new WeatherAPIError("Weather API failed");
      expect(error.message).toBe("Weather API failed");
      expect(error.name).toBe("WeatherAPIError");
    });

    it("should create error with status code", () => {
      const error = new WeatherAPIError("Not found", 404);
      expect(error.statusCode).toBe(404);
    });
  });

  describe("GeocodingError", () => {
    it("should create error with message", () => {
      const error = new GeocodingError("Location not found");
      expect(error.message).toBe("Location not found");
      expect(error.name).toBe("GeocodingError");
    });
  });

  describe("ValidationError", () => {
    it("should create error with message", () => {
      const error = new ValidationError("Invalid input");
      expect(error.message).toBe("Invalid input");
      expect(error.name).toBe("ValidationError");
    });

    it("should create error with field", () => {
      const error = new ValidationError("Invalid latitude", "latitude");
      expect(error.field).toBe("latitude");
    });
  });
});

