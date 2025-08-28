import { useMemo, useState } from "react";
import { useFreezer } from "./useFreezer";
import { Location } from "./types";
import ItemForm from "./components/ItemForm";
import Modal from "./components/Modal";
import Header from "./components/Header";
import ItemCard from "./components/ItemCard";

function App() {
  const { items, createItem, updateItem, deleteItem } = useFreezer();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter] = useState<Location | "All">("All");
  const [search, setSearch] = useState("");
  const [sections, setSections] = useState<Record<Location, boolean>>({
    [Location.TopDrawer]: true,
    [Location.BottomDrawer]: true,
    [Location.Door]: true,
  });

  const filtered = useMemo(() => {
    const pool =
      filter === "All" ? items : items.filter((i) => i.location === filter);
    const bySection = pool.filter((i) => sections[i.location]);
    const q = search.trim().toLowerCase();
    return q
      ? bySection.filter((i) => i.name.toLowerCase().includes(q))
      : bySection;
  }, [items, filter, search, sections]);

  const editingItem = useMemo(
    () => items.find((i) => i.id === editingId),
    [items, editingId]
  );

  const itemsByLocation = useMemo(() => {
    const result = {
      [Location.TopDrawer]: [] as typeof items,
      [Location.BottomDrawer]: [] as typeof items,
      [Location.Door]: [] as typeof items,
    };
    filtered.forEach((item) => {
      result[item.location].push(item);
    });
    return result;
  }, [filtered]);

  // Calculate which sections are visible
  const isDoorVisible = sections[Location.Door];
  const isTopDrawerVisible = sections[Location.TopDrawer];
  const isBottomDrawerVisible = sections[Location.BottomDrawer];
  const visibleDrawers = [isTopDrawerVisible, isBottomDrawerVisible].filter(
    Boolean
  ).length;
  const hasDrawers = visibleDrawers > 0;

  const handleEdit = (itemId: string) => {
    setEditingId(itemId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (item: import("./types").FreezerItem) => {
    if (editingItem) {
      await updateItem(item);
    } else {
      await createItem(item);
    }
    handleModalClose();
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-neutral-900 overflow-hidden">
      <Header
        search={search}
        onSearch={setSearch}
        sections={sections}
        onSectionsChange={setSections}
        onAdd={() => setIsModalOpen(true)}
      />

      <div className="w-[90vw] mx-auto p-4 h-[calc(100vh-80px)]">
        {/* Main content area with responsive layout */}
        <div className="flex gap-6 h-full">
          {/* Left side: Drawers Container */}
          {hasDrawers && (
            <div className={isDoorVisible ? "w-[70%]" : "w-full"}>
              <div className="flex flex-col gap-6 h-full overflow-hidden">
                {/* Top Drawer Section */}
                {isTopDrawerVisible && (
                  <section
                    className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 ${
                      visibleDrawers === 1 ? "h-full" : "h-[calc(50%-12px)]"
                    }`}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                        {Location.TopDrawer}
                      </h2>
                    </div>
                    <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
                      {itemsByLocation[Location.TopDrawer].length > 0 ? (
                        <div className="space-y-4">
                          {itemsByLocation[Location.TopDrawer].map((item) => (
                            <ItemCard
                              key={item.id}
                              item={item}
                              onEdit={() => handleEdit(item.id)}
                              onDelete={async () => {
                                await deleteItem(item.id);
                                if (editingId === item.id) setEditingId(null);
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 dark:text-neutral-400 text-center">
                            No items in {Location.TopDrawer}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Bottom Drawer Section */}
                {isBottomDrawerVisible && (
                  <section
                    className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 ${
                      visibleDrawers === 1 ? "h-full" : "h-[calc(50%-12px)]"
                    }`}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                        {Location.BottomDrawer}
                      </h2>
                    </div>
                    <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
                      {itemsByLocation[Location.BottomDrawer].length > 0 ? (
                        <div className="space-y-4">
                          {itemsByLocation[Location.BottomDrawer].map(
                            (item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                onEdit={() => handleEdit(item.id)}
                                onDelete={async () => {
                                  await deleteItem(item.id);
                                  if (editingId === item.id) setEditingId(null);
                                }}
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 dark:text-neutral-400 text-center">
                            No items in {Location.BottomDrawer}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}

          {/* Right side: Door */}
          {isDoorVisible && (
            <div className={hasDrawers ? "w-[30%]" : "w-full"}>
              <section className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 h-full">
                <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {Location.Door}
                  </h2>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
                  {itemsByLocation[Location.Door].length > 0 ? (
                    <div className="grid gap-4">
                      {itemsByLocation[Location.Door].map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleEdit(item.id)}
                          onDelete={async () => {
                            await deleteItem(item.id);
                            if (editingId === item.id) setEditingId(null);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-neutral-400 text-center">
                        No items in {Location.Door}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Add/Edit Item Modal */}
        <Modal
          open={isModalOpen}
          onClose={handleModalClose}
          title={editingItem ? "Edit Item" : "Add Item"}
        >
          <ItemForm
            initial={editingItem ?? {}}
            onSave={handleSave}
            onCancel={handleModalClose}
          />
        </Modal>
      </div>
    </div>
  );
}

export default App;
