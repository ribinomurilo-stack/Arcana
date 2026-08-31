import { describe, expect, it } from "vitest";
import { drawings } from "@/data/drawings";
import { FLASH_ROTATION_ANCHOR, FLASH_ROTATION_MS, getActiveFlashDrawings, getDrawingShareUrl, getFlashCountdown, getNextFlashRotationAt, getVisibleFlashDrawings, hasMoreFlashDrawings, getWhatsAppShareUrl } from "./flashRotation";

describe("flash rotation and sharing helpers", () => {
  const flashDrawings = drawings.filter((drawing) => ["MISTICOS", "OS PECULIARES", "KNIGHT ANIMALS"].includes(drawing.category));

  it("returns eight active Flashs from the expanded multi-collection pool", () => {
    const blocks = [0, 1, 2, 3].map((cycle) => getActiveFlashDrawings(flashDrawings, FLASH_ROTATION_ANCHOR + cycle * FLASH_ROTATION_MS));

    expect(flashDrawings).toHaveLength(16);
    expect(blocks).toHaveLength(4);
    expect(blocks.every((block) => block.length === 8)).toBe(true);
    expect(new Set(blocks.flat().map((drawing) => drawing.id)).size).toBe(16);
    expect(new Set(blocks.flat().map((drawing) => drawing.category))).toEqual(new Set(["MISTICOS", "OS PECULIARES", "KNIGHT ANIMALS"]));
  });

  it("keeps the archive paginated and expands it by four", () => {
    expect(getVisibleFlashDrawings(flashDrawings, 4)).toHaveLength(4);
    expect(hasMoreFlashDrawings(flashDrawings, 4)).toBe(true);
    expect(getVisibleFlashDrawings(flashDrawings, flashDrawings.length)).toHaveLength(flashDrawings.length);
    expect(hasMoreFlashDrawings(flashDrawings, flashDrawings.length)).toBe(false);
  });

  it("calculates the next rotation and countdown values", () => {
    const now = FLASH_ROTATION_ANCHOR + 1_000;
    const nextRotation = getNextFlashRotationAt(now);
    const countdown = getFlashCountdown(now);

    expect(nextRotation).toBe(FLASH_ROTATION_ANCHOR + FLASH_ROTATION_MS);
    expect(countdown.days).toBe(2);
    expect(countdown.hours).toBe(23);
    expect(countdown.minutes).toBe(59);
    expect(countdown.seconds).toBe(59);
  });

  it("builds a copyable drawing URL and an encoded WhatsApp URL", () => {
    const link = getDrawingShareUrl("/manus-storage/flash.webp", "https://atlas.example");
    const whatsappLink = getWhatsAppShareUrl(`Veja este desenho: ${link}`);

    expect(link).toBe("https://atlas.example/manus-storage/flash.webp");
    expect(whatsappLink).toContain("https://api.whatsapp.com/send/?phone=5511984564012&text=");
    expect(whatsappLink).toContain(encodeURIComponent(link));
  });
});
