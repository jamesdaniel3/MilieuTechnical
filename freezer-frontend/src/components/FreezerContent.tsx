import { Location } from "../types";
import type { FreezerItem } from "../types";
import { DrawerSections } from "./DrawerSections";
import { DoorSection } from "./DoorSection";

interface FreezerContentProps {
  itemsByLocation: Record<Location, FreezerItem[]>;
  sections: Record<Location, boolean>;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export function FreezerContent({
  itemsByLocation,
  sections,
  onEdit,
  onDelete,
}: FreezerContentProps) {
  const isDoorVisible = sections[Location.Door];

  return (
    <main
      id="main-content"
      className="w-[90vw] mx-auto p-4 pb-4 md:h-[calc(100vh-80px)] md:overflow-hidden"
    >
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <DrawerSections
          itemsByLocation={itemsByLocation}
          sections={sections}
          onEdit={onEdit}
          onDelete={onDelete}
          isDoorVisible={isDoorVisible}
        />

        <DoorSection
          itemsByLocation={itemsByLocation}
          sections={sections}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </main>
  );
}
