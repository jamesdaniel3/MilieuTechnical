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
  const isExpiringSoon = new Date(item.expiresOn) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-neutral-100 truncate">
          {item.name}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="space-y-1 text-sm text-gray-600 dark:text-neutral-400">
        <div className="flex justify-between">
          <span>Quantity:</span>
          <span className="font-medium">{item.quantity}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Added:</span>
          <span>{new Date(item.addedAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Expires:</span>
          <span className={`font-medium ${
            isExpired ? 'text-red-600' : 
            isExpiringSoon ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {new Date(item.expiresOn).toLocaleDateString()}
          </span>
        </div>
        
        {item.notes && (
          <div className="pt-1 border-t border-gray-100 dark:border-neutral-600">
            <span className="text-xs text-gray-500 dark:text-neutral-500">Notes:</span>
            <p className="text-xs mt-1">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemCard;
