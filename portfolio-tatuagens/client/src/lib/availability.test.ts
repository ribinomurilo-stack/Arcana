import { describe, expect, it } from "vitest";
import { getAvailabilityClass, getAvailabilityLabel } from "./availability";

describe("drawing availability", () => {
  it("renders the available state", () => {
    expect(getAvailabilityLabel("Disponível")).toBe("Disponível");
    expect(getAvailabilityClass("Disponível")).toBe("is-available");
  });

  it("renders the reserved state", () => {
    expect(getAvailabilityLabel("Reservado")).toBe("Reservado");
    expect(getAvailabilityClass("Reservado")).toBe("is-reserved");
  });

  it("renders the unavailable state", () => {
    expect(getAvailabilityLabel("Indisponível")).toBe("Indisponível");
    expect(getAvailabilityClass("Indisponível")).toBe("is-unavailable");
  });
});
