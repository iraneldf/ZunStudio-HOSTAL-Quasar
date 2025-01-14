// src/utils/stringUtils.js

// Capitaliza la primera letra de un string
export function capitalize (str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Trunca un string a una longitud máxima y agrega "..." si es necesario
export function truncate (str, maxLength = 50) {
  if (!str) return ''
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str
}

// Convierte un string a camelCase
export function toCamelCase (str) {
  return str.replace(/([-_][a-z])/gi, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  )
}
