import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names using clsx and tailwind-merge.
 * This utility is commonly used in Shadcn UI components to allow
 * conditional class names and proper overriding of Tailwind classes.
 *
 * @param inputs - A list of class values (strings, objects, arrays, etc.)
 * @returns A merged string of class names with conflicts resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
