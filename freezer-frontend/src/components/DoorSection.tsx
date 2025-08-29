import { Location } from "../types";
import type { FreezerItem } from "../types";
import { FreezerSection } from "./FreezerSection";

interface DoorSectionProps {
  itemsByLocation: Record<Location, FreezerItem[]>;
  sections: Record<Location, boolean>;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export function DoorSection({
  itemsByLocation,
  sections,
  onEdit,
  onDelete,
}: DoorSectionProps) {
  const isDoorVisible = sections[Location.Door];
  const isTopDrawerVisible = sections[Location.TopDrawer];
  const isBottomDrawerVisible = sections[Location.BottomDrawer];
  const visibleDrawers = [isTopDrawerVisible, isBottomDrawerVisible].filter(
    Boolean
  ).length;
  const hasDrawers = visibleDrawers > 0;

  if (!isDoorVisible) {
    return null;
  }

  return (
    <div className={hasDrawers ? "w-full md:w-[30%]" : "w-full"}>
      <FreezerSection
        location={Location.Door}
        items={itemsByLocation[Location.Door]}
        onEdit={onEdit}
        onDelete={onDelete}
        fullWidth={hasDrawers}
        className="md:h-full"
      />
    </div>
  );
}
