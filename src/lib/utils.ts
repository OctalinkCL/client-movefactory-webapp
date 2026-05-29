import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/)
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
