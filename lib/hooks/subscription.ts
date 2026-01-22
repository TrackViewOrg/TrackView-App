import { create } from "zustand";

interface SubscriptionModalStore {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useSubscriptionModal = create<SubscriptionModalStore>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));