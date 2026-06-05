import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string, format = 'DD/MM/YYYY'): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  const map: Record<string, string> = { DD: d, MM: m, YYYY: y }
  return format.replace(/DD|MM|YYYY/g, k => map[k])
}

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/)
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
