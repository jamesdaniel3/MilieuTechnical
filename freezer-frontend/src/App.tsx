import { useMemo, useState } from "react";
import { useFreezer } from "./useFreezer";
import { Location } from "./types";
import ItemForm from "./components/ItemForm";
import Modal from "./components/Modal";
import Header from "./components/Header";
import MobileHeader from "./components/MobileHeader";
import type { FreshnessFilter } from "./components/Header";
import ItemCard from "./components/ItemCard";
import { ToastContainer, toast } from "react-toastify";

function App() {
  const { items, createItem, updateItem, deleteItem } = useFreezer();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter] = useState<Location | "All">("All");
  const [search, setSearch] = useState("");
  const [freshnessFilter, setFreshnessFilter] = useState<
    Record<FreshnessFilter, boolean>
  >({
    Fresh: true,
    "Expiring Soon": true,
    Expired: true,
  });
  const [showNext7Days, setShowNext7Days] = useState(false);
  const [sections, setSections] = useState<Record<Location, boolean>>({
    [Location.TopDrawer]: true,
    [Location.BottomDrawer]: true,
    [Location.Door]: true,
  });

  // Helper function to determine item freshness
  const getItemFreshness = (expiresOn: string) => {
    const now = new Date();
    const expiresDate = new Date(expiresOn);
    const isExpired = expiresDate < now;
    const isExpiringSoon =
      !isExpired &&
      expiresDate < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    if (isExpired) return "Expired";
    if (isExpiringSoon) return "Expiring Soon";
    return "Fresh";
  };

  // Helper function to check if item expires in next 7 days
  const isExpiringInNext7Days = (expiresOn: string) => {
    const now = new Date();
    const expiresDate = new Date(expiresOn);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return expiresDate >= now && expiresDate <= sevenDaysFromNow;
  };

  const filtered = useMemo(() => {
    let pool =
      filter === "All" ? items : items.filter((i) => i.location === filter);

    // Apply section filter
    pool = pool.filter((i) => sections[i.location]);

    // Apply search filter
    const q = search.trim().toLowerCase();
    if (q) {
      pool = pool.filter((i) => i.name.toLowerCase().includes(q));
    }

    // Apply freshness filter
    const selectedFreshness = Object.entries(freshnessFilter)
      .filter(([, selected]) => selected)
      .map(([freshness]) => freshness as FreshnessFilter);

    // If no freshness levels are selected, show no items
    if (selectedFreshness.length === 0) {
      return [];
    }

    pool = pool.filter((i) =>
      selectedFreshness.includes(getItemFreshness(i.expiresOn))
    );

    // Apply next 7 days filter
    if (showNext7Days) {
      pool = pool.filter((i) => isExpiringInNext7Days(i.expiresOn));
    }

    return pool;
  }, [items, filter, search, sections, freshnessFilter, showNext7Days]);

  const editingItem = useMemo(
    () => items.find((i) => i.id === editingId),
    [items, editingId]
  );

  // Sort items by expiration date (expired first, then by how soon they expire)
  const sortedItems = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const now = new Date();
      const aExpires = new Date(a.expiresOn);
      const bExpires = new Date(b.expiresOn);

      const aIsExpired = aExpires < now;
      const bIsExpired = bExpires < now;

      // Expired items come first
      if (aIsExpired && !bIsExpired) return -1;
      if (!aIsExpired && bIsExpired) return 1;

      // If both are expired or both are not expired, sort by expiration date
      return aExpires.getTime() - bExpires.getTime();
    });
  }, [filtered]);

  const itemsByLocation = useMemo(() => {
    const result = {
      [Location.TopDrawer]: [] as typeof items,
      [Location.BottomDrawer]: [] as typeof items,
      [Location.Door]: [] as typeof items,
    };
    sortedItems.forEach((item) => {
      result[item.location].push(item);
    });
    return result;
  }, [sortedItems]);

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
    // Close modal immediately to show optimistic update
    handleModalClose();

    try {
      if (editingItem) {
        await updateItem(item);
      } else {
        await createItem(item);
      }
    } catch (error) {
      console.error("Failed to save item:", error);

      // Dismiss success toast and show error
      toast.dismiss();
      toast.error("Failed to save item. Changes have been rolled back.");
    }
  };

  return (
    <div className="h-screen bg-[#fbfcee] md:overflow-hidden overflow-y-auto">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile Header */}
      <header className="md:hidden">
        <MobileHeader
          search={search}
          onSearch={setSearch}
          sections={sections}
          onSectionsChange={setSections}
          freshnessFilter={freshnessFilter}
          onFreshnessFilterChange={setFreshnessFilter}
          showNext7Days={showNext7Days}
          onShowNext7DaysChange={setShowNext7Days}
          onAdd={() => setIsModalOpen(true)}
        />
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block">
        <Header
          search={search}
          onSearch={setSearch}
          sections={sections}
          onSectionsChange={setSections}
          freshnessFilter={freshnessFilter}
          onFreshnessFilterChange={setFreshnessFilter}
          showNext7Days={showNext7Days}
          onShowNext7DaysChange={setShowNext7Days}
          onAdd={() => setIsModalOpen(true)}
        />
      </header>

      <main
        id="main-content"
        className="w-[90vw] mx-auto p-4 pb-8 md:h-[calc(100vh-80px)]"
      >
        <div className="flex flex-col md:flex-row gap-6 h-full">
          {hasDrawers && (
            <div className={isDoorVisible ? "w-full md:w-[70%]" : "w-full"}>
              <div className="flex flex-col gap-6 md:h-full md:overflow-hidden">
                {isTopDrawerVisible && (
                  <section
                    className={`bg-white rounded-lg shadow-sm border border-[#00522C]/20 ${
                      visibleDrawers === 1
                        ? "md:h-full"
                        : "md:h-[calc(50%-12px)]"
                    }`}
                    aria-labelledby="top-drawer-heading"
                  >
                    <div className="p-4 border-b border-[#00522C]/20">
                      <h2
                        id="top-drawer-heading"
                        className="text-lg font-semibold text-[#00522C]"
                      >
                        {Location.TopDrawer}
                      </h2>
                    </div>
                    <div className="p-4 md:overflow-y-auto md:h-[calc(100%-64px)]">
                      {itemsByLocation[Location.TopDrawer].length > 0 ? (
                        <div
                          className="flex flex-wrap gap-4"
                          role="list"
                          aria-label={`Items in ${Location.TopDrawer}`}
                        >
                          {itemsByLocation[Location.TopDrawer].map((item) => (
                            <div key={item.id} role="listitem">
                              <ItemCard
                                item={item}
                                onEdit={() => handleEdit(item.id)}
                                onDelete={async () => {
                                  try {
                                    await deleteItem(item.id);
                                    if (editingId === item.id)
                                      setEditingId(null);
                                  } catch (error) {
                                    console.error(
                                      "Failed to delete item:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to delete item. Please try again."
                                    );
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p
                            className="text-[#00522C]/60 text-center"
                            aria-live="polite"
                          >
                            No items in {Location.TopDrawer}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {isBottomDrawerVisible && (
                  <section
                    className={`bg-white rounded-lg shadow-sm border border-[#00522C]/20 ${
                      visibleDrawers === 1
                        ? "md:h-full"
                        : "md:h-[calc(50%-12px)]"
                    }`}
                    aria-labelledby="bottom-drawer-heading"
                  >
                    <div className="p-4 border-b border-[#00522C]/20">
                      <h2
                        id="bottom-drawer-heading"
                        className="text-lg font-semibold text-[#00522C]"
                      >
                        {Location.BottomDrawer}
                      </h2>
                    </div>
                    <div className="p-4 md:overflow-y-auto md:h-[calc(100%-64px)]">
                      {itemsByLocation[Location.BottomDrawer].length > 0 ? (
                        <div
                          className="flex flex-wrap gap-4"
                          role="list"
                          aria-label={`Items in ${Location.BottomDrawer}`}
                        >
                          {itemsByLocation[Location.BottomDrawer].map(
                            (item) => (
                              <div key={item.id} role="listitem">
                                <ItemCard
                                  item={item}
                                  onEdit={() => handleEdit(item.id)}
                                  onDelete={async () => {
                                    try {
                                      await deleteItem(item.id);
                                      if (editingId === item.id)
                                        setEditingId(null);
                                    } catch (error) {
                                      console.error(
                                        "Failed to delete item:",
                                        error
                                      );
                                      toast.error(
                                        "Failed to delete item. Please try again."
                                      );
                                    }
                                  }}
                                />
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p
                            className="text-[#00522C]/60 text-center"
                            aria-live="polite"
                          >
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

          {isDoorVisible && (
            <div className={hasDrawers ? "w-full md:w-[30%]" : "w-full"}>
              <section
                className="bg-white rounded-lg shadow-sm border border-[#00522C]/20 md:h-full"
                aria-labelledby="door-heading"
              >
                <div className="p-4 border-b border-[#00522C]/20">
                  <h2
                    id="door-heading"
                    className="text-lg font-semibold text-[#00522C]"
                  >
                    {Location.Door}
                  </h2>
                </div>
                <div className="p-4 md:overflow-y-auto md:h-[calc(100%-64px)]">
                  {itemsByLocation[Location.Door].length > 0 ? (
                    <div
                      className="flex flex-col gap-3"
                      role="list"
                      aria-label={`Items in ${Location.Door}`}
                    >
                      {itemsByLocation[Location.Door].map((item) => (
                        <div key={item.id} role="listitem">
                          <ItemCard
                            item={item}
                            fullWidth={true}
                            onEdit={() => handleEdit(item.id)}
                            onDelete={async () => {
                              try {
                                await deleteItem(item.id);
                                if (editingId === item.id) setEditingId(null);
                              } catch (error) {
                                console.error("Failed to delete item:", error);
                                toast.error(
                                  "Failed to delete item. Please try again."
                                );
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p
                        className="text-[#00522C]/60 text-center"
                        aria-live="polite"
                      >
                        No items in {Location.Door}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

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
      </main>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
        aria-label="Notifications"
      />
    </div>
  );
}

export default App;
