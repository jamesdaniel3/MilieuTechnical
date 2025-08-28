import type { FreezerItem } from "../types";
import editIcon from "../assets/edit-icon.png";
import trashIcon from "../assets/trash-icon.png";

export function ItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: FreezerItem;
  onEdit: () => void;
  onDelete: () => void;
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
    <div className="bg-white rounded-lg border border-[#00522C]/20 p-3 shadow-sm w-48 flex-shrink-0 hover:border-[#00522C] hover:border-2">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-[#00522C] truncate flex-1 mr-2">
          {item.name}
        </h3>
        {getStatusBadge()}
      </div>

      <div className="text-sm text-[#00522C]/70 mb-3">
        {item.quantity} {item.units}
      </div>

      <div className="flex gap-2">
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
