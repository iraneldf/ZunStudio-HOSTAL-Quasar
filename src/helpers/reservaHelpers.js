// Label personalidos del select de clientes

import { computed, ref } from 'vue'
import { loadGet, loadSelectList } from 'src/GenericFunctions/funciones'
import { api } from 'boot/axios'

const serverUrl = process.env.SERVER_URL
const arrayClientes = ref([])
const arrayHabitaciones = ref([])
const cargandoClientes = ref(false)
const cargandoHabitaciones = ref(false)
const errorMessage = ref(null)
const fechasSeleccionadas = ref(null)
// Propiedad computada para formatear el rango de fechas
const formattedDateRange = ref('')

const habitacionActual = ref({})

const getCustomLabelCliente = (cliente) => {
  return `${cliente.nombre} ${cliente.apellidos} (CI: ${cliente.ci})`
}
// Llamar clientes y habitaciones
const getClientes = async () => {
  cargandoClientes.value = true
  arrayClientes.value = await loadGet('/api/Cliente/ObtenerListadoPaginado')
  cargandoClientes.value = false
}
const getHabitaciones = async (fI, fF, habitacionId) => {
  cargandoHabitaciones.value = true
  arrayHabitaciones.value = await loadSelectList(`/api/Habitacion/ListaDeHabitacionesDisponiblesPorFechaService?fechaInicio=${fI}&fechaFin=${fF}`)
  // cuando es editar le pasa la habitacion actual a las opcions del select ya que el endpoint no la trae pq la restreccion de las fechas
  if (habitacionId) {
    await obtenerHabitacion(habitacionId)
    // agregar la habitacion actual si no la contiene
    if (!arrayHabitaciones.value.some(h => h.id === habitacionActual.value.id)) {
      arrayHabitaciones.value.push(habitacionActual.value)
    }
  }
  cargandoHabitaciones.value = false
}

// Funcion para Obtener una habitacion por el id
const obtenerHabitacion = async (id) => {
  // dialogLoad.value = true
  await api.get(`${serverUrl}/api/Habitacion/ObtenerPorId/${id}`)
    .then(r => {
      // dialog.value = true
      habitacionActual.value = r.data.result
    }).catch((error) => {
      error.response === undefined ? Error.call(this, error.message) : Error.call(this, error.response.data.mensajeError)
    })
  // dialogLoad.value = false
}

const condicionMostrarSelects = computed(() => {
  if (!fechasSeleccionadas.value) return false
  return fechasSeleccionadas.value.to && fechasSeleccionadas.value.from && !errorMessage.value
})

const esFechaPasada = (fecha) => {
  // Obtener la fecha actual y normalizarla (sin horas, minutos, segundos ni milisegundos)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0) // Establece la hora a 00:00:00.000

  // Convertir la fecha a comparar y normalizarla
  const fechaComparar = new Date(fecha)
  fechaComparar.setHours(0, 0, 0, 0) // Establece la hora a 00:00:00.000

  // Comparar solo las fechas (días)
  return fechaComparar < hoy
}

const esFechaFutura = (fecha) => {
  // Obtener la fecha actual y normalizarla (sin horas, minutos, segundos ni milisegundos)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0) // Establece la hora a 00:00:00.000

  // Convertir la fecha a comparar y normalizarla
  const fechaComparar = new Date(fecha)
  fechaComparar.setHours(0, 0, 0, 0) // Establece la hora a 00:00:00.000

  // Comparar solo las fechas (días)
  return fechaComparar > hoy
}
const esDiaDeEntrada = (fechaEntrada) => {
  // Obtener la fecha actual y normalizarla (sin horas, minutos, segundos ni milisegundos)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0) // Establece la hora a 00:00:00.000

  // Convertir la fecha a comparar y normalizarla
  const fechaComparar = new Date(fechaEntrada)
  fechaComparar.setHours(0, 0, 0, 0) // Establece la hora a 00:00:00.000
  // Comparar solo las fechas (días)
  return fechaComparar === hoy
}

// Función para determinar la clase de la fila
const getRowClass = (row) => {
  return row.props.estaCancelada ? 'bg-red-1' : ''
}

export {
  getCustomLabelCliente,
  esDiaDeEntrada,
  esFechaPasada,
  esFechaFutura,
  getClientes,
  getHabitaciones,
  obtenerHabitacion,
  getRowClass,
  condicionMostrarSelects,
  fechasSeleccionadas,
  formattedDateRange,
  errorMessage,
  arrayClientes,
  arrayHabitaciones,
  cargandoHabitaciones,
  cargandoClientes
}
