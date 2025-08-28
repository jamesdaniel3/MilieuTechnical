import { describe, it, expect, beforeEach } from "vitest";
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

describe("freezerRepository", () => {
  beforeEach(async () => {
    await freezerRepository.clearAll();
    // Reset guaranteed failure flag
    setGuaranteedFailure(false);
  });

  it("creates and retrieves an item", async () => {
    const item = makeItem();
    await freezerRepository.create(item);
    const got = await freezerRepository.getById(item.id);
    expect(got).toBeTruthy();
    expect(got?.name).toBe(item.name);
  });

  it("updates an existing item", async () => {
    const item = makeItem();
    await freezerRepository.create(item);
    const updated = { ...item, name: "Ground Beef", quantity: 5 };
    await freezerRepository.update(updated);
    const got = await freezerRepository.getById(item.id);
    expect(got?.name).toBe("Ground Beef");
    expect(got?.quantity).toBe(5);
  });

  it("deletes an item", async () => {
    const item = makeItem();
    await freezerRepository.create(item);
    await freezerRepository.delete(item.id);
    const got = await freezerRepository.getById(item.id);
    expect(got).toBeUndefined();
    const all = await freezerRepository.getAll();
    expect(all.length).toBe(0);
  });

  it("retrieves items by location", async () => {
    const a = makeItem({ id: "a", location: Location.TopDrawer });
    const b = makeItem({ id: "b", location: Location.BottomDrawer });
    const c = makeItem({ id: "c", location: Location.TopDrawer });
    await freezerRepository.create(a);
    await freezerRepository.create(b);
    await freezerRepository.create(c);

    const tops = await freezerRepository.getByLocation(Location.TopDrawer);
    const bottoms = await freezerRepository.getByLocation(
      Location.BottomDrawer
    );
    const doors = await freezerRepository.getByLocation(Location.Door);

    expect(tops.map((i) => i.id).sort()).toEqual(["a", "c"]);
    expect(bottoms.map((i) => i.id)).toEqual(["b"]);
    expect(doors.length).toBe(0);
  });

  it("throws SimulatedFailureError when guaranteed failure is set", async () => {
    setGuaranteedFailure(true);
    const item = makeItem();

    await expect(freezerRepository.create(item)).rejects.toThrow(
      SimulatedFailureError
    );
    await expect(freezerRepository.update(item)).rejects.toThrow(
      SimulatedFailureError
    );
  });

  it("does not throw error when guaranteed failure is disabled", async () => {
    setGuaranteedFailure(false);
    const item = makeItem();

    await expect(freezerRepository.create(item)).resolves.not.toThrow();
    await expect(freezerRepository.update(item)).resolves.not.toThrow();
  });
});
