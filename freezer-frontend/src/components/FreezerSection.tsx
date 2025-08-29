import { Location } from "../types";
import type { FreezerItem } from "../types";
import ItemCard from "./ItemCard";

interface FreezerSectionProps {
  location: Location;
  items: FreezerItem[];
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  fullWidth?: boolean;
  className?: string;
}

export function FreezerSection({
  location,
  items,
  onEdit,
  onDelete,
  fullWidth = false,
  className = "",
}: FreezerSectionProps) {
  const headingId = `${location.toLowerCase().replace(/\s+/g, "-")}-heading`;

  return (
    <section
      className={`bg-white rounded-lg shadow-sm border border-[#00522C]/20 ${className}`}
      aria-labelledby={headingId}
    >
      <div className="p-4 border-b border-[#00522C]/20">
        <h2 id={headingId} className="text-lg font-semibold text-[#00522C]">
          {location}
        </h2>
      </div>
      <div className="p-4 md:overflow-y-auto md:h-[calc(100%-64px)]">
        {items.length > 0 ? (
          <div
            className={`${
              fullWidth
                ? "flex flex-col gap-3"
                : "flex flex-col md:flex-row md:flex-wrap gap-4"
            }`}
            role="list"
            aria-label={`Items in ${location}`}
          >
            {items.map((item) => (
              <div key={item.id} role="listitem">
                <ItemCard
                  item={item}
                  fullWidth={fullWidth}
                  onEdit={() => onEdit(item.id)}
                  onDelete={() => onDelete(item.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#00522C]/60 text-center" aria-live="polite">
              No items in {location}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
