import { useMemo, useState, useCallback } from "react";
import { useFreezer } from "./useFreezer";
import { Location } from "./types";
import ItemForm from "./components/ItemForm";
import Modal from "./components/Modal";
import Header from "./components/Header";
import MobileHeader from "./components/MobileHeader";
import type { FreshnessFilter } from "./components/Header";
import { FreezerContent } from "./components/FreezerContent";
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

  const getItemFreshness = useCallback((expiresOn: string) => {
    const now = new Date();
    const expiresDate = new Date(expiresOn);
    const isExpired = expiresDate < now;
    const isExpiringSoon =
      !isExpired &&
      expiresDate < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    if (isExpired) return "Expired";
    if (isExpiringSoon) return "Expiring Soon";
    return "Fresh";
  }, []);

  const isExpiringInNext7Days = useCallback((expiresOn: string) => {
    const now = new Date();
    const expiresDate = new Date(expiresOn);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return expiresDate >= now && expiresDate <= sevenDaysFromNow;
  }, []);

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
  }, [
    items,
    filter,
    search,
    sections,
    freshnessFilter,
    showNext7Days,
    getItemFreshness,
    isExpiringInNext7Days,
  ]);

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

  const handleEdit = useCallback((itemId: string) => {
    setEditingId(itemId);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
  }, []);

  const handleSave = useCallback(
    async (item: import("./types").FreezerItem) => {
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

        toast.error("Failed to save item. Changes have been rolled back.");
      }
    },
    [handleModalClose, editingItem, updateItem, createItem]
  );

  const createDeleteHandler = useCallback(
    (itemId: string) => {
      return async () => {
        try {
          await deleteItem(itemId);
          if (editingId === itemId) setEditingId(null);
        } catch (error) {
          console.error("Failed to delete item:", error);
          toast.error("Failed to delete item. Please try again.");
        }
      };
    },
    [deleteItem, editingId]
  );

  return (
    <div className="min-h-screen bg-[#fbfcee] md:h-screen md:overflow-hidden">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="md:hidden sticky top-0 z-40">
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

      <FreezerContent
        itemsByLocation={itemsByLocation}
        sections={sections}
        onEdit={handleEdit}
        onDelete={(itemId) => createDeleteHandler(itemId)()}
      />

      <Modal open={isModalOpen} onClose={handleModalClose}>
        <ItemForm
          initial={editingItem ?? {}}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
        closeButton={false}
        aria-label="Notifications"
      />
    </div>
  );
}

export default App;
