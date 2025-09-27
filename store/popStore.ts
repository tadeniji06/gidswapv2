import { create } from "zustand";
interface op {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void,
}
const usePopStore = create<op>((set) => ({
  isOpen: false,
  setIsOpen: (open: boolean) => set({ isOpen: open }),
}));

export default usePopStore;
