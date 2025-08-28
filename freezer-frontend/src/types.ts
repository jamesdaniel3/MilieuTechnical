export const Location = {
  TopDrawer: "Top Drawer",
  BottomDrawer: "Bottom Drawer",
  Door: "Door",
} as const;

export type Location = (typeof Location)[keyof typeof Location];

export interface FreezerItem {
  id: string;
  name: string;
  quantity: number;
  location: Location;
  addedAt: string; // ISO string for portability
  expiresOn: string; // ISO string
  notes?: string;
}
