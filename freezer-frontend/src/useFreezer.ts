import { useCallback, useEffect, useMemo, useState } from "react";
import { freezerRepository, SimulatedFailureError } from "./repository";
import type { FreezerItem } from "./types";
import { Location } from "./types";

export function useFreezer() {
  const [items, setItems] = useState<FreezerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await freezerRepository.getAll();
      if (mounted) {
        setItems(all);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const createItem = useCallback(
    async (item: FreezerItem) => {
      // Store the current state for potential rollback
      const previousItems = items;

      // Optimistically update local state
      setItems((prev) => {
        const next = prev.slice();
        next.push(item);
        return next;
      });

      try {
        await freezerRepository.create(item);
      } catch (error) {
        // Rollback on failure
        setItems(previousItems);

        if (error instanceof SimulatedFailureError) {
          console.warn(
            "Simulated failure occurred during item creation:",
            error.message
          );
        }

        // Re-throw the error so the UI can handle it
        throw error;
      }
    },
    [items]
  );

  const updateItem = useCallback(
    async (item: FreezerItem) => {
      // Store the current state for potential rollback
      const previousItems = items;

      // Optimistically update local state
      setItems((prev) => prev.map((it) => (it.id === item.id ? item : it)));

      try {
        await freezerRepository.update(item);
      } catch (error) {
        // Rollback on failure
        setItems(previousItems);

        if (error instanceof SimulatedFailureError) {
          console.warn(
            "Simulated failure occurred during item update:",
            error.message
          );
        }

        // Re-throw the error so the UI can handle it
        throw error;
      }
    },
    [items]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      // Store the current state for potential rollback
      const previousItems = items;

      // Optimistically update local state
      setItems((prev) => prev.filter((it) => it.id !== id));

      try {
        await freezerRepository.delete(id);
      } catch (error) {
        // Rollback on failure
        setItems(previousItems);

        if (error instanceof SimulatedFailureError) {
          console.warn(
            "Simulated failure occurred during item deletion:",
            error.message
          );
        }

        // Re-throw the error so the UI can handle it
        throw error;
      }
    },
    [items]
  );

  const getByLocation = useCallback(
    async (location: Location): Promise<FreezerItem[]> => {
      return freezerRepository.getByLocation(location);
    },
    []
  );

  return useMemo(
    () => ({
      items,
      loading,
      createItem,
      updateItem,
      deleteItem,
      getByLocation,
    }),
    [items, loading, createItem, updateItem, deleteItem, getByLocation]
  );
}
