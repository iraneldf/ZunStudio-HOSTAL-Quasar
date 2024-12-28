// Funcion que obtienes las habitaciones de la ama de llave y filtra los ids para ponerlos en el form de edit
import { loadSelectList } from 'src/GenericFunctions/funciones'

const obtenerHabitacionesPorAmaDeLlave = async (id) => {
  const response = await loadSelectList(`/api/Habitacion/ObtenerHabitacionesPorAmaDeLlaves?AmaDeLlavesId=${id}`)
  return response.map(habitacion => habitacion.id)
}

// Label customizado del select de habitaciones
const getCustomLabel = (habitacion) => {
  return `${habitacion.numero} (${habitacion.estado})`
}
export {
  obtenerHabitacionesPorAmaDeLlave,
  getCustomLabel
}
