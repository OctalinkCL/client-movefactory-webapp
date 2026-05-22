export const METRICS = [
  { key: 'weight',      label: 'Peso',             unit: 'kg' },
  { key: 'fat_pct',     label: '% Masa grasa',     unit: '%'  },
  { key: 'fat_kg',      label: 'Masa grasa',       unit: 'kg' },
  { key: 'muscle_pct',  label: '% Masa muscular',  unit: '%'  },
  { key: 'muscle_kg',   label: 'Masa muscular',    unit: 'kg' },
  { key: 'arm_relaxed', label: 'Brazo relajado',   unit: 'cm' },
  { key: 'arm_flexed',  label: 'Brazo flexionado', unit: 'cm' },
  { key: 'waist',       label: 'Cintura',          unit: 'cm' },
  { key: 'glute',       label: 'Glúteo',           unit: 'cm' },
  { key: 'thigh',       label: 'Muslo medio',      unit: 'cm' },
  { key: 'calf',        label: 'Pantorrilla',      unit: 'cm' },
] as const

export type MetricKey = typeof METRICS[number]['key']

export function getMetric(key: string) {
  return METRICS.find(m => m.key === key)
}
