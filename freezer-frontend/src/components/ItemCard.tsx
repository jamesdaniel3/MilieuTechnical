import type { FreezerItem } from "../types";

export function ItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: FreezerItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isExpired = new Date(item.expiresOn) < new Date();
  const isExpiringSoon =
    new Date(item.expiresOn) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return (
    <div className="bg-white rounded-lg border border-[#00522C]/20 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-[#00522C] truncate">{item.name}</h3>
        <div className="flex gap-1">
          <button onClick={onEdit} className="text-sm px-2 py-1 rounded">
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm px-2 py-1 rounded"
            style={{ backgroundColor: "#dc2626" }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-1 text-sm text-[#00522C]/70">
        <div className="flex justify-between">
          <span>Quantity:</span>
          <span className="font-medium">
            {item.quantity} {item.units}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Added:</span>
          <span>{new Date(item.addedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Expires:</span>
          <span
            className={`font-medium ${
              isExpired
                ? "text-red-600"
                : isExpiringSoon
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {new Date(item.expiresOn).toLocaleDateString()}
          </span>
        </div>

        {item.notes && (
          <div className="pt-1 border-t border-[#00522C]/10">
            <span className="text-xs text-[#00522C]/50">Notes:</span>
            <p className="text-xs mt-1">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemCard;
