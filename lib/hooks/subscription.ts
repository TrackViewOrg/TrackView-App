import { create } from 'zustand'

interface SubscriptionModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

/**
 * Zustand store for managing the state of the subscription modal.
 * Allows components to open or close the modal from anywhere in the application.
 */
export const useSubscriptionModal = create<SubscriptionModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
