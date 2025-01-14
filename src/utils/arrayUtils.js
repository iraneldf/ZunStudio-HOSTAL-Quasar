// src/utils/arrayUtils.js

// Elimina elementos duplicados de un array
export function removeDuplicates (array) {
  return [...new Set(array)]
}

// Ordena un array de objetos por una propiedad específica
export function sortByProperty (array, property, order = 'asc') {
  return array.sort((a, b) => {
    if (a[property] < b[property]) return order === 'asc' ? -1 : 1
    if (a[property] > b[property]) return order === 'asc' ? 1 : -1
    return 0
  })
}
