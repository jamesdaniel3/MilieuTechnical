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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    } else if (isExpiringSoon) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Expiring Soon
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Fresh
        </span>
      );
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-[#00522C]/20 p-3 shadow-sm hover:border-[#00522C] hover:border-2 ${
        fullWidth ? "w-full" : "w-full md:w-64"
      } ${!fullWidth ? "h-40 flex flex-col" : ""}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-[#00522C] truncate flex-1 mr-2">
          {item.name}
        </h3>
        {getStatusBadge()}
      </div>

      <div className="text-sm text-[#00522C]/70 mb-2">
        {item.quantity} {item.units}
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
          >
            {item.notes}
          </div>
        </div>
      )}

      {!item.notes && !fullWidth && <div className="flex-1"></div>}

      <div className="flex gap-2 mt-auto">
        <button
          onClick={onEdit}
          className="flex-1 bg-[#00522C] hover:bg-[#00522C]/80 text-white p-2 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <img
            src={editIcon}
            alt="Edit"
            className="w-4 h-4"
            style={{
              filter: "brightness(0) invert(1)", // Makes the black icon white
            }}
          />
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-[#00522C] hover:bg-[#00522C]/80 text-white p-2 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <img
            src={trashIcon}
            alt="Delete"
            className="w-4 h-4"
            style={{
              filter: "brightness(0) invert(1)", // Makes the black icon white
            }}
          />
        </button>
      </div>
    </div>
  );
}

export default ItemCard;
