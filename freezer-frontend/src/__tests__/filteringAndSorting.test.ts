import { describe, it, expect, beforeEach } from "vitest";
import { freezerRepository } from "../repository";
import type { FreezerItem } from "../types";
import { Location } from "../types";
import { setGuaranteedFailure } from "../config";

function makeItem(overrides: Partial<FreezerItem> = {}): FreezerItem {
  const base: FreezerItem = {
    id: Math.random().toString(36).slice(2),
    name: "Chicken Breast",
    quantity: 2,
    units: "pieces",
    location: Location.TopDrawer,
    addedAt: new Date("2025-01-01").toISOString(),
    expiresOn: new Date("2025-02-01").toISOString(),
    notes: "Family pack",
  };
  return { ...base, ...overrides };
}

// Helper function to determine item freshness (copied from App.tsx logic)
const getItemFreshness = (expiresOn: string) => {
  const now = new Date();
  const expiresDate = new Date(expiresOn);
  const isExpired = expiresDate < now;
  const isExpiringSoon =
    !isExpired &&
    expiresDate < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  if (isExpired) return "Expired";
  if (isExpiringSoon) return "Expiring Soon";
  return "Fresh";
};

describe("Filtering and Sorting", () => {
  beforeEach(async () => {
    await freezerRepository.clearAll();
    setGuaranteedFailure(false);
  });

  describe("Filtering by status", () => {
    it("returns correct subset for Fresh items", () => {
      const now = new Date();
      const freshItems = [
        makeItem({
          expiresOn: new Date(
            now.getTime() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
        makeItem({
          expiresOn: new Date(
            now.getTime() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      ];

      const filtered = freshItems.filter(
        (item) => getItemFreshness(item.expiresOn) === "Fresh"
      );
      expect(filtered).toHaveLength(2);
      expect(
        filtered.every((item) => getItemFreshness(item.expiresOn) === "Fresh")
      ).toBe(true);
    });

    it("returns correct subset for Expiring Soon items", () => {
      const now = new Date();
      const expiringSoonItems = [
        makeItem({
          expiresOn: new Date(
            now.getTime() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
        makeItem({
          expiresOn: new Date(
            now.getTime() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      ];

      const filtered = expiringSoonItems.filter(
        (item) => getItemFreshness(item.expiresOn) === "Expiring Soon"
      );
      expect(filtered).toHaveLength(2);
      expect(
        filtered.every(
          (item) => getItemFreshness(item.expiresOn) === "Expiring Soon"
        )
      ).toBe(true);
    });

    it("returns correct subset for Expired items", () => {
      const now = new Date();
      const expiredItems = [
        makeItem({
          expiresOn: new Date(
            now.getTime() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
        makeItem({
          expiresOn: new Date(
            now.getTime() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      ];

      const filtered = expiredItems.filter(
        (item) => getItemFreshness(item.expiresOn) === "Expired"
      );
      expect(filtered).toHaveLength(2);
      expect(
        filtered.every((item) => getItemFreshness(item.expiresOn) === "Expired")
      ).toBe(true);
    });
  });

  describe("Sorting by expiration date", () => {
    it("places earliest expiring item first", () => {
      const now = new Date();
      const items = [
        makeItem({
          expiresOn: new Date(
            now.getTime() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
        makeItem({
          expiresOn: new Date(
            now.getTime() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
        makeItem({
          expiresOn: new Date(
            now.getTime() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      ];

      const sorted = [...items].sort((a, b) => {
        const aExpires = new Date(a.expiresOn);
        const bExpires = new Date(b.expiresOn);
        return aExpires.getTime() - bExpires.getTime();
      });

      expect(sorted[0].expiresOn).toBe(items[1].expiresOn); // 2 days
      expect(sorted[1].expiresOn).toBe(items[2].expiresOn); // 5 days
      expect(sorted[2].expiresOn).toBe(items[0].expiresOn); // 10 days
    });

    it("places expired items first, then by expiration date", () => {
      const now = new Date();
      const items = [
        makeItem({
          expiresOn: new Date(
            now.getTime() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
        makeItem({
          expiresOn: new Date(
            now.getTime() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
        makeItem({
          expiresOn: new Date(
            now.getTime() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      ];

      const sorted = [...items].sort((a, b) => {
        const now = new Date();
        const aExpires = new Date(a.expiresOn);
        const bExpires = new Date(b.expiresOn);

        const aIsExpired = aExpires < now;
        const bIsExpired = bExpires < now;

        // Expired items come first
        if (aIsExpired && !bIsExpired) return -1;
        if (!aIsExpired && bIsExpired) return 1;

        // If both are expired or both are not expired, sort by expiration date
        return aExpires.getTime() - bExpires.getTime();
      });

      // First two should be expired items, sorted by expiration date
      expect(new Date(sorted[0].expiresOn) < now).toBe(true);
      expect(new Date(sorted[1].expiresOn) < now).toBe(true);
      expect(new Date(sorted[2].expiresOn) > now).toBe(true);

      // Expired items should be sorted by expiration date (earliest first)
      expect(new Date(sorted[0].expiresOn).getTime()).toBeLessThan(
        new Date(sorted[1].expiresOn).getTime()
      );
    });
  });
});
