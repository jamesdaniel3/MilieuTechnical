import type { FreezerItem } from "../types";
import editIcon from "../assets/edit-icon.png";
import trashIcon from "../assets/trash-icon.png";

export function ItemCard({
  item,
  onEdit,
  onDelete,
  fullWidth = false,
}: {
  item: FreezerItem;
  onEdit: () => void;
  onDelete: () => void;
  fullWidth?: boolean;
}) {
  const now = new Date();
  const expiresDate = new Date(item.expiresOn);
  const isExpired = expiresDate < now;
  const isExpiringSoon =
    !isExpired &&
    expiresDate < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
          aria-label="Status: Expired"
        >
          Expired
        </span>
      );
    } else if (isExpiringSoon) {
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
          aria-label="Status: Expiring Soon"
        >
          Expiring Soon
        </span>
      );
    } else {
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
          aria-label="Status: Fresh"
        >
          Fresh
        </span>
      );
    }
  };

  // Format expiration date for screen readers
  const formatExpirationDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const expirationText = formatExpirationDate(expiresDate);
  const statusText = isExpired
    ? "expired"
    : isExpiringSoon
    ? "expiring soon"
    : "fresh";

  return (
    <div
      className={`bg-white rounded-lg border border-[#00522C]/20 p-3 shadow-sm hover:border-[#00522C] hover:border-2 w-full ${
        !fullWidth ? "md:w-64 h-40 flex flex-col" : ""
      }`}
      role="article"
      aria-label={`${item.name}, ${item.quantity} ${item.units}, ${statusText}, expires ${expirationText}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-[#00522C] truncate flex-1 mr-2">
          {item.name}
        </h3>
        {getStatusBadge()}
      </div>

      <div className="text-sm text-[#00522C]/70 mb-2">
        <span aria-label={`Quantity: ${item.quantity} ${item.units}`}>
          {item.quantity} {item.units}
        </span>
      </div>

      {item.notes && (
        <div className="text-xs text-[#00522C]/60 mb-3 overflow-hidden flex-1">
          <div
            className="line-clamp-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            aria-label={`Notes: ${item.notes}`}
          >
            {item.notes}
          </div>
        </div>
      )}

      {!item.notes && !fullWidth && <div className="flex-1"></div>}

      <div
        className="flex gap-2 mt-auto"
        role="group"
        aria-label={`Actions for ${item.name}`}
      >
        <button
          onClick={onEdit}
          aria-label={`Edit ${item.name}`}
          className="flex-1 bg-[#00522C] hover:bg-[#00522C]/80 text-white p-2 rounded-md transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2"
        >
          <img
            src={editIcon}
            alt=""
            className="w-4 h-4"
            aria-hidden="true"
            style={{
              filter: "brightness(0) invert(1)", // Makes the black icon white
            }}
          />
          <span className="sr-only">Edit</span>
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete ${item.name}`}
          className="flex-1 bg-[#00522C] hover:bg-[#00522C]/80 text-white p-2 rounded-md transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2"
        >
          <img
            src={trashIcon}
            alt=""
            className="w-4 h-4"
            aria-hidden="true"
            style={{
              filter: "brightness(0) invert(1)", // Makes the black icon white
            }}
          />
          <span className="sr-only">Delete</span>
        </button>
      </div>
    </div>
  );
}

export default ItemCard;
