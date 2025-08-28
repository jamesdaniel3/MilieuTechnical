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
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  // Handle keyboard navigation for menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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

  // Calculate selected counts for ARIA labels
  const selectedSectionsCount = Object.values(sections).filter(Boolean).length;
  const selectedFreshnessCount =
    Object.values(freshnessFilter).filter(Boolean).length;

  return (
    <div className="sticky top-0 z-40 bg-[#fbfcee]/90 backdrop-blur border-b border-[#00522C]/20">
      <div className="w-[95vw] mx-auto p-3 flex items-center gap-3">
        {/* Add Button */}
        <button
          onClick={onAdd}
          aria-label="Add new item to freezer"
          className="bg-[#00522C] text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-[#00522C]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2"
        >
          <span aria-hidden="true">+</span>
        </button>

        {/* Search Bar */}
        <div className="flex-1">
          <input
            className="w-full px-3 py-2 rounded-2xl border border-[#00522C]/20 bg-[#fbfcee] focus:outline-none focus:border-[#00522C] focus:ring-1 focus:ring-[#00522C] appearance-none"
            placeholder="Search by name..."
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
            aria-label="Search freezer items by name"
            type="search"
          />
        </div>

        {/* Hamburger Menu */}
        <div className="relative" ref={menuRef}>
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label={`Filter menu. ${
              menuOpen ? "Expanded" : "Collapsed"
            }. ${selectedSectionsCount} sections and ${selectedFreshnessCount} freshness levels selected`}
            className="w-10 h-10 flex flex-col justify-center items-center gap-1 bg-[#00522C] rounded-lg hover:bg-[#00522C]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            <div
              className="w-5 h-0.5 bg-white rounded-full"
              aria-hidden="true"
            ></div>
            <div
              className="w-5 h-0.5 bg-white rounded-full"
              aria-hidden="true"
            ></div>
            <div
              className="w-5 h-0.5 bg-white rounded-full"
              aria-hidden="true"
            ></div>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-lg border border-[#00522C]/20 bg-white shadow-lg p-4"
              role="menu"
              aria-label="Filter options menu"
            >
              {/* Sections Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#00522C] mb-3">
                  Sections
                </h3>
                <div
                  className="space-y-3"
                  role="group"
                  aria-label="Section filter options"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sections[Location.TopDrawer]}
                      onChange={() => toggle(Location.TopDrawer)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          toggle(Location.TopDrawer);
                        }
                      }}
                      aria-label={`${Location.TopDrawer} section ${
                        sections[Location.TopDrawer]
                          ? "selected"
                          : "not selected"
                      }`}
                      className="w-4 h-4 text-[#00522C] focus:ring-2 focus:ring-[#00522C]"
                    />
                    <span className="text-[#00522C]">{Location.TopDrawer}</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sections[Location.BottomDrawer]}
                      onChange={() => toggle(Location.BottomDrawer)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          toggle(Location.BottomDrawer);
                        }
                      }}
                      aria-label={`${Location.BottomDrawer} section ${
                        sections[Location.BottomDrawer]
                          ? "selected"
                          : "not selected"
                      }`}
                      className="w-4 h-4 text-[#00522C] focus:ring-2 focus:ring-[#00522C]"
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          toggle(Location.Door);
                        }
                      }}
                      aria-label={`${Location.Door} section ${
                        sections[Location.Door] ? "selected" : "not selected"
                      }`}
                      className="w-4 h-4 text-[#00522C] focus:ring-2 focus:ring-[#00522C]"
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
                <div
                  className="space-y-3"
                  role="group"
                  aria-label="Freshness filter options"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={freshnessFilter["Fresh"]}
                      onChange={() => toggleFreshness("Fresh")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          toggleFreshness("Fresh");
                        }
                      }}
                      aria-label={`Fresh items ${
                        freshnessFilter["Fresh"] ? "selected" : "not selected"
                      }`}
                      className="w-4 h-4 text-[#00522C] focus:ring-2 focus:ring-[#00522C]"
                    />
                    <span className="text-[#00522C]">Fresh</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={freshnessFilter["Expiring Soon"]}
                      onChange={() => toggleFreshness("Expiring Soon")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          toggleFreshness("Expiring Soon");
                        }
                      }}
                      aria-label={`Expiring soon items ${
                        freshnessFilter["Expiring Soon"]
                          ? "selected"
                          : "not selected"
                      }`}
                      className="w-4 h-4 text-[#00522C] focus:ring-2 focus:ring-[#00522C]"
                    />
                    <span className="text-[#00522C]">Expiring Soon</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={freshnessFilter["Expired"]}
                      onChange={() => toggleFreshness("Expired")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          toggleFreshness("Expired");
                        }
                      }}
                      aria-label={`Expired items ${
                        freshnessFilter["Expired"] ? "selected" : "not selected"
                      }`}
                      className="w-4 h-4 text-[#00522C] focus:ring-2 focus:ring-[#00522C]"
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onShowNext7DaysChange(!showNext7Days);
                      }
                    }}
                    aria-label="Show only items expiring in the next 7 days"
                    className="w-4 h-4 text-[#00522C] focus:ring-2 focus:ring-[#00522C]"
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
