import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ActiveRowStore = Record<string, string>;

interface ActiveRowState {
  rows: ActiveRowStore;
  setActiveRow: (key: string, id: string) => void;
  getActiveRow: (key: string) => string;
  clearActiveRow: (key: string) => void;
}

const useActiveRowStore = create<ActiveRowState>()(
  persist(
    (set, get) => ({
      rows: {},
      setActiveRow: (key: string, id: string) =>
        set((state) => ({
          rows: { ...state.rows, [key]: id },
        })),
      getActiveRow: (key: string) => get().rows[key] || "",
      clearActiveRow: (key: string) =>
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: _, ...rest } = state.rows;
          return { rows: rest };
        }),
    }),
    {
      name: "active-row-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export const useActiveRow = (key: string) => {
  const { rows, setActiveRow, clearActiveRow } = useActiveRowStore();

  return {
    activeRowId: rows[key] || "",
    setActiveRowId: (id: string) => setActiveRow(key, id),
    clearActiveRowId: () => clearActiveRow(key),
  };
};
