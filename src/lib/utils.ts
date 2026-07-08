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

export function calcAge(iso: string): number {
  const birth = new Date(iso)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  return hasBirthdayPassed ? age : age - 1
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function sexLabel(sex: string | null): string | null {
  if (sex === 'male') return 'Masculino'
  if (sex === 'female') return 'Femenino'
  return null
}

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/)
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
