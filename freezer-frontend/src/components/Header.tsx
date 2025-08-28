import { useEffect, useMemo, useRef, useState } from "react";
import { Location } from "../types";

export type SectionMap = Record<Location, boolean>;

export function Header({
  search,
  onSearch,
  sections,
  onSectionsChange,
  onAdd,
}: {
  search: string;
  onSearch: (q: string) => void;
  sections: SectionMap;
  onSectionsChange: (sections: SectionMap) => void;
  onAdd: () => void;
}) {
  const [internal, setInternal] = useState(search);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep local input in sync with external state
  useEffect(() => {
    setInternal(search);
  }, [search]);

  // Debounce input -> onSearch
  useEffect(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      onSearch(internal.trim());
    }, 300);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [internal, onSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const allChecked = useMemo(
    () =>
      sections[Location.TopDrawer] &&
      sections[Location.BottomDrawer] &&
      sections[Location.Door],
    [sections]
  );

  const toggle = (loc: Location) => {
    onSectionsChange({ ...sections, [loc]: !sections[loc] });
  };

  const setAll = (value: boolean) => {
    onSectionsChange({
      [Location.TopDrawer]: value,
      [Location.BottomDrawer]: value,
      [Location.Door]: value,
    });
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
      <div className="w-[95vw] mx-auto p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button onClick={onAdd}>+ Add Item</button>
        </div>
        <div className="flex-1 flex justify-center">
          <input
            className="w-full max-w-lg"
            placeholder="Search by name..."
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
          />
        </div>
        <div className="relative" ref={containerRef}>
          <button onClick={() => setOpen((v) => !v)}>Sections</button>
          {open && (
            <div className="absolute right-0 mt-2 w-64 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow p-3">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => setAll(e.target.checked)}
                />
                <span>Select all</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sections[Location.TopDrawer]}
                    onChange={() => toggle(Location.TopDrawer)}
                  />
                  <span>{Location.TopDrawer}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sections[Location.BottomDrawer]}
                    onChange={() => toggle(Location.BottomDrawer)}
                  />
                  <span>{Location.BottomDrawer}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sections[Location.Door]}
                    onChange={() => toggle(Location.Door)}
                  />
                  <span>{Location.Door}</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
