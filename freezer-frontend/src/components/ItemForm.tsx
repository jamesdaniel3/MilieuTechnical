import { useState } from "react";
import type { FreezerItem } from "../types";
import { Location } from "../types";
import { toast } from "react-toastify";

function uid() {
  return Math.random().toString(36).slice(2);
}

interface ValidationErrors {
  name?: string;
  quantity?: string;
  units?: string;
  expiresOn?: string;
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
  const [units, setUnits] = useState(initial?.units ?? "");
  const [location, setLocation] = useState<Location>(
    initial?.location ?? Location.TopDrawer
  );
  const [expiresOn, setExpiresOn] = useState<string>(
    initial?.expiresOn ? new Date(initial.expiresOn).toLocaleDateString() : ""
  );
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const isEdit = Boolean(initial?.id);

  // Validate form data
  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!quantity || quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!units.trim()) {
      newErrors.units = "Units are required";
    }

    if (!expiresOn.trim()) {
      newErrors.expiresOn = "Expiration date is required";
    } else {
      const date = new Date(expiresOn);
      if (isNaN(date.getTime())) {
        newErrors.expiresOn = "Please enter a valid date (MM/DD/YYYY)";
      }
    }

    return newErrors;
  };

  const isValid = Object.keys(validateForm()).length === 0;

  const handleSubmit = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Show toast with validation errors
      //const errorMessages = Object.values(validationErrors).join(", ");
      toast.error(`Your form is incomplete!`);
      return;
    }

    const nowIso = new Date().toISOString();
    const item: FreezerItem = {
      id: initial?.id ?? uid(),
      name: name.trim(),
      quantity: Number.isFinite(quantity) ? quantity : 1,
      units: units.trim(),
      location,
      addedAt: initial?.addedAt ?? nowIso,
      expiresOn: new Date(expiresOn).toISOString(),
      notes: notes.trim() || undefined,
    };
    onSave(item);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#00522C]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Chicken"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#00522C]">Quantity</span>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            className={errors.quantity ? "border-red-500" : ""}
          />
          {errors.quantity && (
            <span className="text-xs text-red-500">{errors.quantity}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#00522C]">Units</span>
          <input
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="e.g., cups"
            className={errors.units ? "border-red-500" : ""}
          />
          {errors.units && (
            <span className="text-xs text-red-500">{errors.units}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#00522C]">Location</span>
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

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium text-[#00522C]">Expires On</span>
          <input
            value={expiresOn}
            onChange={(e) => setExpiresOn(e.target.value)}
            placeholder="MM/DD/YYYY"
            className={errors.expiresOn ? "border-red-500" : ""}
          />
          {errors.expiresOn && (
            <span className="text-xs text-red-500">{errors.expiresOn}</span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[#00522C]">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
        />
      </label>

      <div className="flex justify-between pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#00522C] text-[#00522C] bg-white hover:bg-[#00522C]/5"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-4 py-2 ${
            isValid
              ? "bg-[#00522C] text-white"
              : "bg-white text-[#00522C] border border-[#00522C]"
          }`}
        >
          {isEdit ? "Save" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default ItemForm;
