// src/utils/objectUtils.js

// Combina dos objetos (shallow merge)
export function mergeObjects (obj1, obj2) {
  return { ...obj1, ...obj2 }
}

// Verifica si un objeto está vacío
export function isEmptyObject (obj) {
  return Object.keys(obj).length === 0
}
