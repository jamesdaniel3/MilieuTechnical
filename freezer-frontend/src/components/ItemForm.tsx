import { useState } from "react";
import type { FreezerItem } from "../types";
import { Location } from "../types";

function uid() {
  return Math.random().toString(36).slice(2);
}

export function ItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<FreezerItem>;
  onSave: (item: FreezerItem) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [quantity, setQuantity] = useState<number>(initial?.quantity ?? 1);
  const [location, setLocation] = useState<Location>(
    initial?.location ?? Location.TopDrawer
  );
  const [expiresOn, setExpiresOn] = useState<string>(initial?.expiresOn ?? "");
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  const isEdit = Boolean(initial?.id);

  const handleSubmit = () => {
    const nowIso = new Date().toISOString();
    const item: FreezerItem = {
      id: initial?.id ?? uid(),
      name: name.trim(),
      quantity: Number.isFinite(quantity) ? quantity : 1,
      location,
      addedAt: initial?.addedAt ?? nowIso,
      expiresOn: expiresOn || nowIso,
      notes: notes.trim() || undefined,
    };
    onSave(item);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Chicken"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Quantity</span>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Location</span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as Location)}
          >
            <option value={Location.TopDrawer}>{Location.TopDrawer}</option>
            <option value={Location.BottomDrawer}>
              {Location.BottomDrawer}
            </option>
            <option value={Location.Door}>{Location.Door}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Expires On</span>
          <input
            type="date"
            value={expiresOn ? expiresOn.slice(0, 10) : ""}
            onChange={(e) =>
              setExpiresOn(
                e.target.value ? new Date(e.target.value).toISOString() : ""
              )
            }
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm">Notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit}>
          {isEdit ? "Save" : "Add"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="bg-gray-200 text-gray-900 dark:bg-neutral-700 dark:text-neutral-50"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default ItemForm;
