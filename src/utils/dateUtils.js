// src/utils/dateUtils.js

// Formatea una fecha en un formato legible (ej: "25/12/2023")
export function formatDate (date, separator = '/') {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}${separator}${month}${separator}${year}`
}

// Calcula la diferencia en días entre dos fechas
export function diffInDays (startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
