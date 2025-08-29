import { Location } from "../types";
import type { FreezerItem } from "../types";
import { FreezerSection } from "./FreezerSection";

interface DrawerSectionsProps {
  itemsByLocation: Record<Location, FreezerItem[]>;
  sections: Record<Location, boolean>;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  isDoorVisible: boolean;
}

export function DrawerSections({
  itemsByLocation,
  sections,
  onEdit,
  onDelete,
  isDoorVisible,
}: DrawerSectionsProps) {
  const isTopDrawerVisible = sections[Location.TopDrawer];
  const isBottomDrawerVisible = sections[Location.BottomDrawer];
  const visibleDrawers = [isTopDrawerVisible, isBottomDrawerVisible].filter(
    Boolean
  ).length;
  const hasDrawers = visibleDrawers > 0;

  if (!hasDrawers) {
    return null;
  }

  return (
    <div className={isDoorVisible ? "w-full md:w-[70%]" : "w-full"}>
      <div className="flex flex-col gap-6 md:h-full md:overflow-hidden">
        {isTopDrawerVisible && (
          <FreezerSection
            location={Location.TopDrawer}
            items={itemsByLocation[Location.TopDrawer]}
            onEdit={onEdit}
            onDelete={onDelete}
            className={
              visibleDrawers === 1 ? "md:h-full" : "md:h-[calc(50%-12px)]"
            }
          />
        )}

        {isBottomDrawerVisible && (
          <FreezerSection
            location={Location.BottomDrawer}
            items={itemsByLocation[Location.BottomDrawer]}
            onEdit={onEdit}
            onDelete={onDelete}
            className={
              visibleDrawers === 1 ? "md:h-full" : "md:h-[calc(50%-12px)]"
            }
          />
        )}
      </div>
    </div>
  );
}
