// src/utils/mathUtils.js

// Calcula el porcentaje de un número
export function calculatePercentage (value, total) {
  return ((value / total) * 100).toFixed(2)
}

// Genera un número aleatorio en un rango
export function randomInRange (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
