// Label personalidos del select de clientes

import { date } from 'quasar'
import { ref } from 'vue'

const getCustomLabelCliente = (cliente) => {
  return `${cliente.ci} ${cliente.nombre} ${cliente.apellidos}`
}
const getCustomLabelHabitacion = (habitacion) => {
  return `${habitacion.numero} (${habitacion.estado})`
}

// Manejo de las fechas del fomulario
const errorMessage = ref(null)
const fechasSeleccionadas = ref({})
const validarFechas = (value) => {
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
    }
  } else {
    errorMessage.value = 'Las fechas son obligatorias.'
  }
}

export {
  getCustomLabelCliente,
  getCustomLabelHabitacion,
  validarFechas,
  fechasSeleccionadas,
  errorMessage
}
