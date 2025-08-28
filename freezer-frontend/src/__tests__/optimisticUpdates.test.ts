import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFreezer } from "../useFreezer";
import { freezerRepository, SimulatedFailureError } from "../repository";
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

describe("Optimistic Updates", () => {
  beforeEach(async () => {
    await freezerRepository.clearAll();
    setGuaranteedFailure(false);
    vi.clearAllTimers();
  });

  describe("Optimistic update rolls back after simulated failure", () => {
    it("rolls back createItem on failure", async () => {
      const { result } = renderHook(() => useFreezer());

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const initialItems = result.current.items;
      const newItem = makeItem({ id: "test-item" });

      // Enable guaranteed failure
      setGuaranteedFailure(true);

      // Attempt to create item (should fail)
      await act(async () => {
        try {
          await result.current.createItem(newItem);
        } catch (error) {
          expect(error).toBeInstanceOf(SimulatedFailureError);
        }
      });

      // Verify rollback - items should be back to initial state
      expect(result.current.items).toEqual(initialItems);
      expect(result.current.items).not.toContainEqual(newItem);
    });

    it("rolls back updateItem on failure", async () => {
      const { result } = renderHook(() => useFreezer());

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Create an item first
      const item = makeItem({ id: "test-item" });
      await act(async () => {
        await result.current.createItem(item);
      });

      const initialItems = result.current.items;
      const updatedItem = { ...item, name: "Updated Name" };

      // Enable guaranteed failure
      setGuaranteedFailure(true);

      // Attempt to update item (should fail)
      await act(async () => {
        try {
          await result.current.updateItem(updatedItem);
        } catch (error) {
          expect(error).toBeInstanceOf(SimulatedFailureError);
        }
      });

      // Verify rollback - items should be back to initial state
      expect(result.current.items).toEqual(initialItems);
      expect(result.current.items.find((i) => i.id === item.id)?.name).toBe(
        item.name
      );
      expect(result.current.items.find((i) => i.id === item.id)?.name).not.toBe(
        "Updated Name"
      );
    });

    it("rolls back deleteItem on failure", async () => {
      const { result } = renderHook(() => useFreezer());

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Create an item first
      const item = makeItem({ id: "test-item" });
      await act(async () => {
        await result.current.createItem(item);
      });

      const initialItems = result.current.items;

      // Enable guaranteed failure
      setGuaranteedFailure(true);

      // Attempt to delete item (should fail)
      await act(async () => {
        try {
          await result.current.deleteItem(item.id);
        } catch (error) {
          expect(error).toBeInstanceOf(SimulatedFailureError);
        }
      });

      // Verify rollback - items should be back to initial state
      expect(result.current.items).toEqual(initialItems);
      expect(result.current.items).toContainEqual(item);
    });
  });

  describe("Successful operations update state correctly", () => {
    it("successfully creates item", async () => {
      const { result } = renderHook(() => useFreezer());

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const initialCount = result.current.items.length;
      const newItem = makeItem({ id: "test-item" });

      await act(async () => {
        await result.current.createItem(newItem);
      });

      expect(result.current.items).toHaveLength(initialCount + 1);
      expect(result.current.items).toContainEqual(newItem);
    });

    it("successfully updates item", async () => {
      const { result } = renderHook(() => useFreezer());

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Create an item first
      const item = makeItem({ id: "test-item" });
      await act(async () => {
        await result.current.createItem(item);
      });

      const updatedItem = { ...item, name: "Updated Name" };

      await act(async () => {
        await result.current.updateItem(updatedItem);
      });

      expect(result.current.items.find((i) => i.id === item.id)?.name).toBe(
        "Updated Name"
      );
    });

    it("successfully deletes item", async () => {
      const { result } = renderHook(() => useFreezer());

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Create an item first
      const item = makeItem({ id: "test-item" });
      await act(async () => {
        await result.current.createItem(item);
      });

      const initialCount = result.current.items.length;

      await act(async () => {
        await result.current.deleteItem(item.id);
      });

      expect(result.current.items).toHaveLength(initialCount - 1);
      expect(result.current.items).not.toContainEqual(item);
    });
  });
});
