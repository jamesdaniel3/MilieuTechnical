import { useEffect, useMemo, useRef, useState } from "react";
import { Location } from "../types";

export type SectionMap = Record<Location, boolean>;

export type FreshnessFilter = "Fresh" | "Expiring Soon" | "Expired";

export function Header({
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
  const [open, setOpen] = useState(false);
  const [freshnessOpen, setFreshnessOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const freshnessContainerRef = useRef<HTMLDivElement>(null);
  const sectionsButtonRef = useRef<HTMLButtonElement>(null);
  const freshnessButtonRef = useRef<HTMLButtonElement>(null);

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
      if (!open && !freshnessOpen) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        freshnessContainerRef.current &&
        !freshnessContainerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setFreshnessOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, freshnessOpen]);

  // Handle keyboard navigation for dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setFreshnessOpen(false);
        if (open) sectionsButtonRef.current?.focus();
        if (freshnessOpen) freshnessButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, freshnessOpen]);

  const allChecked = useMemo(
    () =>
      sections[Location.TopDrawer] &&
      sections[Location.BottomDrawer] &&
      sections[Location.Door],
    [sections]
  );

  const allFreshnessChecked = useMemo(
    () =>
      freshnessFilter["Fresh"] &&
      freshnessFilter["Expiring Soon"] &&
      freshnessFilter["Expired"],
    [freshnessFilter]
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

  const toggleFreshness = (freshness: FreshnessFilter) => {
    onFreshnessFilterChange({
      ...freshnessFilter,
      [freshness]: !freshnessFilter[freshness],
    });
  };

  const setAllFreshness = (value: boolean) => {
    onFreshnessFilterChange({
      Fresh: value,
      "Expiring Soon": value,
      Expired: value,
    });
  };

  return (
    <div className="sticky top-0 z-40 bg-[#fbfcee]/90 backdrop-blur border-b border-[#00522C]/20">
      <div className="w-[95vw] mx-auto p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onAdd}
            aria-label="Add new item to freezer"
            className="bg-[#00522C] text-white px-4 py-2 rounded hover:bg-[#00522C]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2"
          >
            + Add Item
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <input
            className="w-full max-w-lg px-3 py-2 rounded border border-[#00522C]/20 focus:outline-none focus:border-[#00522C] focus:ring-1 focus:ring-[#00522C]"
            placeholder="Search by name..."
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
            aria-label="Search freezer items by name"
            type="search"
          />
        </div>

        {/* Sections Filter */}
        <div className="relative" ref={containerRef}>
          <button
            ref={sectionsButtonRef}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="true"
            aria-label={`Sections filter. ${open ? "Expanded" : "Collapsed"}. ${
              Object.values(sections).filter(Boolean).length
            } of 3 sections selected`}
            className="px-4 py-2 border border-[#00522C]/20 rounded hover:bg-[#00522C]/5 focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2"
          >
            Sections
          </button>
          {open && (
            <div
              className="absolute right-0 mt-2 w-64 rounded border border-[#00522C]/20 bg-white shadow p-3"
              role="menu"
              aria-label="Sections filter options"
            >
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => setAll(e.target.checked)}
                  aria-label="Select all sections"
                  className="focus:ring-2 focus:ring-[#00522C]"
                />
                <span className="text-[#00522C]">Select all</span>
              </label>
              <div
                className="space-y-2"
                role="group"
                aria-label="Individual section options"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sections[Location.TopDrawer]}
                    onChange={() => toggle(Location.TopDrawer)}
                    aria-label={`${Location.TopDrawer} section ${
                      sections[Location.TopDrawer] ? "selected" : "not selected"
                    }`}
                    className="focus:ring-2 focus:ring-[#00522C]"
                  />
                  <span className="text-[#00522C]">{Location.TopDrawer}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sections[Location.BottomDrawer]}
                    onChange={() => toggle(Location.BottomDrawer)}
                    aria-label={`${Location.BottomDrawer} section ${
                      sections[Location.BottomDrawer]
                        ? "selected"
                        : "not selected"
                    }`}
                    className="focus:ring-2 focus:ring-[#00522C]"
                  />
                  <span className="text-[#00522C]">
                    {Location.BottomDrawer}
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sections[Location.Door]}
                    onChange={() => toggle(Location.Door)}
                    aria-label={`${Location.Door} section ${
                      sections[Location.Door] ? "selected" : "not selected"
                    }`}
                    className="focus:ring-2 focus:ring-[#00522C]"
                  />
                  <span className="text-[#00522C]">{Location.Door}</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Freshness Filter */}
        <div className="relative" ref={freshnessContainerRef}>
          <button
            ref={freshnessButtonRef}
            onClick={() => setFreshnessOpen((v) => !v)}
            aria-expanded={freshnessOpen}
            aria-haspopup="true"
            aria-label={`Freshness filter. ${
              freshnessOpen ? "Expanded" : "Collapsed"
            }. ${
              Object.values(freshnessFilter).filter(Boolean).length
            } of 3 freshness levels selected`}
            className="px-4 py-2 border border-[#00522C]/20 rounded hover:bg-[#00522C]/5 focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2"
          >
            Freshness
          </button>
          {freshnessOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded border border-[#00522C]/20 bg-white shadow p-3"
              role="menu"
              aria-label="Freshness filter options"
            >
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={allFreshnessChecked}
                  onChange={(e) => setAllFreshness(e.target.checked)}
                  aria-label="Select all freshness levels"
                  className="focus:ring-2 focus:ring-[#00522C]"
                />
                <span className="text-[#00522C]">Select all</span>
              </label>
              <div
                className="space-y-2"
                role="group"
                aria-label="Individual freshness level options"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={freshnessFilter["Fresh"]}
                    onChange={() => toggleFreshness("Fresh")}
                    aria-label={`Fresh items ${
                      freshnessFilter["Fresh"] ? "selected" : "not selected"
                    }`}
                    className="focus:ring-2 focus:ring-[#00522C]"
                  />
                  <span className="text-[#00522C]">Fresh</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={freshnessFilter["Expiring Soon"]}
                    onChange={() => toggleFreshness("Expiring Soon")}
                    aria-label={`Expiring soon items ${
                      freshnessFilter["Expiring Soon"]
                        ? "selected"
                        : "not selected"
                    }`}
                    className="focus:ring-2 focus:ring-[#00522C]"
                  />
                  <span className="text-[#00522C]">Expiring Soon</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={freshnessFilter["Expired"]}
                    onChange={() => toggleFreshness("Expired")}
                    aria-label={`Expired items ${
                      freshnessFilter["Expired"] ? "selected" : "not selected"
                    }`}
                    className="focus:ring-2 focus:ring-[#00522C]"
                  />
                  <span className="text-[#00522C]">Expired</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Next 7 Days Filter */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showNext7Days}
              onChange={(e) => onShowNext7DaysChange(e.target.checked)}
              aria-label="Show only items expiring in the next 7 days"
              className="focus:ring-2 focus:ring-[#00522C]"
            />
            <span className="text-[#00522C] text-sm">Next 7 days</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Header;
