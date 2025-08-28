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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      onKeyDown={handleKeyDown}
      aria-label={`${isEdit ? "Edit" : "Add"} freezer item form`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#00522C]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Chicken"
            maxLength={25}
            className={`px-3 py-2 border border-[#00522C]/20 rounded focus:outline-none focus:border-[#00522C] focus:ring-1 focus:ring-[#00522C] ${
              errors.name ? "border-red-500" : ""
            }`}
            aria-label="Item name"
            aria-describedby={errors.name ? "name-error" : "name-help"}
            aria-invalid={!!errors.name}
            required
          />
          <div className="flex justify-between items-center">
            {errors.name && (
              <span
                id="name-error"
                className="text-xs text-red-500"
                role="alert"
              >
                {errors.name}
              </span>
            )}
            <span id="name-help" className="text-xs text-[#00522C]/60 ml-auto">
              {name.length}/25
            </span>
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#00522C]">Quantity</span>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            className={`px-3 py-2 border border-[#00522C]/20 rounded focus:outline-none focus:border-[#00522C] focus:ring-1 focus:ring-[#00522C] ${
              errors.quantity ? "border-red-500" : ""
            }`}
            aria-label="Item quantity"
            aria-describedby={errors.quantity ? "quantity-error" : undefined}
            aria-invalid={!!errors.quantity}
            required
          />
          {errors.quantity && (
            <span
              id="quantity-error"
              className="text-xs text-red-500"
              role="alert"
            >
              {errors.quantity}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#00522C]">Units</span>
          <input
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="e.g., cups"
            className={`px-3 py-2 border border-[#00522C]/20 rounded focus:outline-none focus:border-[#00522C] focus:ring-1 focus:ring-[#00522C] ${
              errors.units ? "border-red-500" : ""
            }`}
            aria-label="Item units"
            aria-describedby={errors.units ? "units-error" : undefined}
            aria-invalid={!!errors.units}
            required
          />
          {errors.units && (
            <span
              id="units-error"
              className="text-xs text-red-500"
              role="alert"
            >
              {errors.units}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#00522C]">Location</span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as Location)}
            className="px-3 py-2 border border-[#00522C]/20 rounded focus:outline-none focus:border-[#00522C] focus:ring-1 focus:ring-[#00522C]"
            aria-label="Storage location"
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
            className={`px-3 py-2 border border-[#00522C]/20 rounded focus:outline-none focus:border-[#00522C] focus:ring-1 focus:ring-[#00522C] ${
              errors.expiresOn ? "border-red-500" : ""
            }`}
            aria-label="Expiration date"
            aria-describedby={
              errors.expiresOn ? "expires-error" : "expires-help"
            }
            aria-invalid={!!errors.expiresOn}
            required
          />
          {errors.expiresOn && (
            <span
              id="expires-error"
              className="text-xs text-red-500"
              role="alert"
            >
              {errors.expiresOn}
            </span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[#00522C]">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          maxLength={75}
          rows={3}
          className="px-3 py-2 border border-[#00522C]/20 rounded focus:outline-none focus:border-[#00522C] focus:ring-1 focus:ring-[#00522C]"
          aria-label="Optional notes about the item"
          aria-describedby="notes-help"
        />
        <div className="flex justify-end">
          <span id="notes-help" className="text-xs text-[#00522C]/60">
            {notes.length}/75
          </span>
        </div>
      </label>

      <div
        className="flex justify-between pt-4"
        role="group"
        aria-label="Form actions"
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#00522C] text-[#00522C] bg-white hover:bg-[#00522C]/5 focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2"
            aria-label="Cancel and close form"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className={`px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2 ${
            isValid
              ? "bg-[#00522C] text-white hover:bg-[#00522C]/80"
              : "bg-white text-[#00522C] border border-[#00522C] opacity-50 cursor-not-allowed"
          }`}
          aria-label={`${isEdit ? "Save" : "Add"} item${
            !isValid ? " (form has errors)" : ""
          }`}
        >
          {isEdit ? "Save" : "Add"}
        </button>
      </div>
    </form>
  );
}

export default ItemForm;
