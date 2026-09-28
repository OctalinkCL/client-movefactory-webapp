// Porciones de un ítem de pauta. Se guardan como texto en
// meal_plan_items.portion con punto decimal ("1.5"); null = libre elección.

// Opciones del selector de la nutricionista: de ½ a 6½ en pasos de media porción.
export const PORTION_VALUES = Array.from({ length: 13 }, (_, i) => String((i + 1) / 2))

// Muestra un número con ½ en vez de decimales: 0.5 → "½", 2.5 → "2½".
// Valores que no son múltiplos de ½ (ej. unidades de un alimento escaladas)
// se redondean a 1 decimal para no mostrar ruido de punto flotante.
export function formatAmount(n: number): string {
  if (Number.isInteger(n * 2)) {
    const whole = Math.floor(n)
    const half = n - whole === 0.5 ? '½' : ''
    return whole === 0 && half ? half : `${whole}${half}`
  }
  return String(Math.round(n * 10) / 10)
}

// "½ porción", "1 porción", "1½ porciones"
export function portionLabel(portion: string | null): string {
  if (portion === null || portion === 'libre') return 'Libre elección'
  const n = Number(portion)
  return `${formatAmount(n)} ${n > 1 ? 'porciones' : 'porción'}`
}

// Solo se puede dividir en alimentos distintos un ítem de porciones enteras
// mayor a 1. Con medias porciones (1½, 2½...) el alumno elige un solo alimento.
export function canSplit(portion: string | null): boolean {
  const n = Number(portion)
  return Number.isInteger(n) && n > 1
}
