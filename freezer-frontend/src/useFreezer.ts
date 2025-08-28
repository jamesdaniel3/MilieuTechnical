import { useCallback, useEffect, useMemo, useState } from "react";
import { freezerRepository } from "./repository";
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

  const createItem = useCallback(async (item: FreezerItem) => {
    await freezerRepository.create(item);
    // Optimistically update local state without re-fetching
    setItems((prev) => {
      const next = prev.slice();
      next.push(item);
      return next;
    });
  }, []);

  const updateItem = useCallback(async (item: FreezerItem) => {
    await freezerRepository.update(item);
    setItems((prev) => prev.map((it) => (it.id === item.id ? item : it)));
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await freezerRepository.delete(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

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
