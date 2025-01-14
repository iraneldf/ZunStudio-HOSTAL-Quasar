// src/utils/validationUtils.js

// Valida si un string es un email válido
export function isEmail (email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Valida si un string es un número
export function isNumber (value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

// Función para validar carnet
export const validarCarnet = (val) => {
  // Verificar que tenga 11 dígitos
  if (val.length !== 11) {
    return false
  }
  // Obtener el número de mes
  const mes = parseInt(val.substr(2, 2), 10)

  // Verificar que el mes esté entre 01 y 12
  if (mes < 1 || mes > 12) {
    return false
  }

  // Obtener el número de días permitidos para el mes
  const diasEnMes = new Date(2024, mes, 0).getDate()

  // Obtener los dígitos 5 y 6
  const diaStr = val.substr(4, 2)
  const dia = parseInt(diaStr, 10)

  // Verificar que el día esté dentro del rango válido
  if (dia < 1 || dia > diasEnMes) {
    return false
  }

  // Si pasó todas las validaciones, es un val válido
  return true
}
// Funcion para validar letras y caracteres especiales(¨Generalmente se utiliza para validar los nombres¨)
export const validarLetrasYCaracteresEspeciales = (val) => {
  // Expresión regular que acepta letras y caracteres especiales, pero no números
  const regex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s#&]+$/

  return regex.test(val)
}
// Funcion para validar correo
export const validarCorreo = (val) => {
  // Expresión regular para validar direcciones de correo electrónico
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  return regex.test(val)
}
// Funcion para validar solo numeros
export const validarSoloNumeros = (val) => {
  // Expresión regular que solo acepta números
  const regex = /^[0-9]+$/

  return regex.test(val)
}
