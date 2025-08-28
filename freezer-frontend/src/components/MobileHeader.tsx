import { useEffect, useMemo, useRef, useState } from "react";
import { Location } from "../types";

export type SectionMap = Record<Location, boolean>;

export type FreshnessFilter = "Fresh" | "Expiring Soon" | "Expired";

export function MobileHeader({
  search,
  onSearch,
  sections,
  onSectionsChange,
  freshnessFilter,
  onFreshnessFilterChange,
  showNext7Days,
  onShowNext7DaysChange,
  onAdd,
}: {
  search: string;
  onSearch: (q: string) => void;
  sections: SectionMap;
  onSectionsChange: (sections: SectionMap) => void;
  freshnessFilter: Record<FreshnessFilter, boolean>;
  onFreshnessFilterChange: (filter: Record<FreshnessFilter, boolean>) => void;
  showNext7Days: boolean;
  onShowNext7DaysChange: (show: boolean) => void;
  onAdd: () => void;
}) {
  const [internal, setInternal] = useState(search);
  const [menuOpen, setMenuOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const toggle = (loc: Location) => {
    onSectionsChange({ ...sections, [loc]: !sections[loc] });
  };

  const toggleFreshness = (freshness: FreshnessFilter) => {
    onFreshnessFilterChange({
      ...freshnessFilter,
      [freshness]: !freshnessFilter[freshness],
    });
  };

  return (
    <div className="sticky top-0 z-40 bg-[#fbfcee]/90 backdrop-blur border-b border-[#00522C]/20">
      <div className="w-[95vw] mx-auto p-3 flex items-center gap-3">
        {/* Add Button */}
        <button
          onClick={onAdd}
          className="bg-[#00522C] text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-[#00522C]/80 transition-colors"
        >
          +
        </button>

        {/* Search Bar */}
        <div className="flex-1">
          <input
            className="w-full px-3 py-2 rounded-lg border border-[#00522C]/20 bg-white focus:outline-none focus:border-[#00522C]"
            placeholder="Search by name..."
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
          />
        </div>

        {/* Hamburger Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 flex flex-col justify-center items-center gap-1 bg-[#00522C] rounded-lg"
          >
            <div className="w-5 h-0.5 bg-white rounded-full"></div>
            <div className="w-5 h-0.5 bg-white rounded-full"></div>
            <div className="w-5 h-0.5 bg-white rounded-full"></div>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-[#00522C]/20 bg-white shadow-lg p-4">
              {/* Sections Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#00522C] mb-3">
                  Sections
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sections[Location.TopDrawer]}
                      onChange={() => toggle(Location.TopDrawer)}
                      className="w-4 h-4 text-[#00522C]"
                    />
                    <span className="text-[#00522C]">{Location.TopDrawer}</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sections[Location.BottomDrawer]}
                      onChange={() => toggle(Location.BottomDrawer)}
                      className="w-4 h-4 text-[#00522C]"
                    />
                    <span className="text-[#00522C]">
                      {Location.BottomDrawer}
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sections[Location.Door]}
                      onChange={() => toggle(Location.Door)}
                      className="w-4 h-4 text-[#00522C]"
                    />
                    <span className="text-[#00522C]">{Location.Door}</span>
                  </label>
                </div>
              </div>

              {/* Freshness Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#00522C] mb-3">
                  Freshness
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={freshnessFilter["Fresh"]}
                      onChange={() => toggleFreshness("Fresh")}
                      className="w-4 h-4 text-[#00522C]"
                    />
                    <span className="text-[#00522C]">Fresh</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={freshnessFilter["Expiring Soon"]}
                      onChange={() => toggleFreshness("Expiring Soon")}
                      className="w-4 h-4 text-[#00522C]"
                    />
                    <span className="text-[#00522C]">Expiring Soon</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={freshnessFilter["Expired"]}
                      onChange={() => toggleFreshness("Expired")}
                      className="w-4 h-4 text-[#00522C]"
                    />
                    <span className="text-[#00522C]">Expired</span>
                  </label>
                </div>
              </div>

              {/* Next 7 Days Filter */}
              <div>
                <h3 className="text-sm font-semibold text-[#00522C] mb-3">
                  Time Filter
                </h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showNext7Days}
                    onChange={(e) => onShowNext7DaysChange(e.target.checked)}
                    className="w-4 h-4 text-[#00522C]"
                  />
                  <span className="text-[#00522C]">Next 7 days</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileHeader;
