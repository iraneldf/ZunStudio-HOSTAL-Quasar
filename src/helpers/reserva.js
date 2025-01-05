// Label personalidos del select de clientes

import { date } from 'quasar'
import { ref } from 'vue'
import { loadGet, loadSelectList } from 'src/GenericFunctions/funciones'
import { api } from 'boot/axios'

const serverUrl = process.env.SERVER_URL
const arrayClientes = ref([])
const arrayHabitaciones = ref([])
const cargandoClientes = ref(false)
const cargandoHabitaciones = ref(false)
const errorMessage = ref(null)
const fechasSeleccionadas = ref({})
const habitacionActual = ref({})

const getCustomLabelCliente = (cliente) => {
  const vip = cliente.vip ? '(VIP)' : ''
  return `${cliente.ci} ${cliente.nombre} ${cliente.apellidos} ${vip}`
}
const getCustomLabelHabitacion = (habitacion) => {
  return `${habitacion.numero} (${habitacion.estado})`
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
    arrayHabitaciones.value.push(habitacionActual.value)
  }
  cargandoHabitaciones.value = false
}

// Manejo de las fechas del fomulario
const validarFechas = async (value) => {
  arrayHabitaciones.value = []
  if (value) {
    const {
      from,
      to
    } = value
    const hoy = date.formatDate(new Date(), 'YYYY-MM-DD')
    if (from && to) {
      const entrada = new Date(from)
      const salida = new Date(to)
      const diffTime = salida - entrada
      const diffDays = diffTime / (1000 * 60 * 60 * 24) // Convertir milisegundos a días

      if (from <= hoy) {
        errorMessage.value = 'La fecha de entrada debe ser posterior a la actual.'
      } else if (diffDays < 2) {
        errorMessage.value = 'La reservas deben ser de 3 días como mínimo.'
      } else {
        errorMessage.value = null
      }

      if (!errorMessage.value) {
        await getHabitaciones(from, to)
      }
    }
  } else {
    errorMessage.value = 'Las fechas son obligatorias.'
  }
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

export {
  getCustomLabelCliente,
  getCustomLabelHabitacion,
  validarFechas,
  getClientes,
  getHabitaciones,
  obtenerHabitacion,
  fechasSeleccionadas,
  errorMessage,
  arrayClientes,
  arrayHabitaciones,
  cargandoHabitaciones,
  cargandoClientes
}
