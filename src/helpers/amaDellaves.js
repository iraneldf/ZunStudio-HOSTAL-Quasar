// Funcion que obtienes las habitaciones de la ama de llave y filtra los ids para ponerlos en el form de edit
import { loadSelectList, validarSoloNumeros } from 'src/GenericFunctions/funciones'

const obtenerHabitacionesPorAmaDeLlave = async (id) => {
  return await loadSelectList(`/api/Habitacion/ObtenerHabitacionesPorAmaDeLlaves?AmaDeLlavesId=${id}`)
  // return response.map(habitacion => habitacion.id)
}

// Label customizado del select de habitaciones
const getCustomLabel = (habitacion) => {
  return `${habitacion.numero} (${habitacion.estado})`
}

// validar el telefono
const validateTelefono = (val) => {
  return validarSoloNumeros(val) ? true : 'El teléfono solo debe contener números'
}

const validateCI = (val) => {
  return validarSoloNumeros(val) ? true : 'El CI solo debe contener números'
}

export {
  obtenerHabitacionesPorAmaDeLlave,
  getCustomLabel,
  validateTelefono,
  validateCI
}
