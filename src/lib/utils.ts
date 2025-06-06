import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn - Utility function to concatenate class names conditionally.
 *
 * @param {...ClassValue[]} inputs - Class values (strings, arrays, objects).
 * @returns {string} Concatenated class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
