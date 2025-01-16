import { ref, reactive } from 'vue'
import { obtener, eliminarElemento, saveData } from 'src/GenericFunctions/funciones.js'
import { errorMessage, fechasSeleccionadas, getClientes, getHabitaciones } from 'src/helpers/reservaHelpers'

export function useReserva (loadPaginate) {
  const objetoInicial = reactive({
    fechaEntrada: null,
    fechaSalida: null,
    clienteId: null,
    habitacionId: null
  })

  const objeto = reactive({ ...objetoInicial })
  const dialog = ref(false)
  const dialogLoad = ref(false)
  const isDialogoEliminarAbierto = ref(false)
  const dialogConfirmarLlegada = ref(false)
  const dialogCambiarHabitacion = ref(false)
  const idElementoSeleccionado = ref(null)
  const reservaSeleccionada = ref(null)

  const onSave = async () => {
    if (!errorMessage.value) {
      objeto.fechaEntrada = fechasSeleccionadas.value.from
      objeto.fechaSalida = fechasSeleccionadas.value.to
      const url = objeto.id ? '/api/Reserva/Actualizar' : '/api/Reserva/Crear'
      await saveData(url, objeto, loadPaginate, onCloseDialog, dialogLoad)
    }
  }

  const onEdit = async (id) => {
    await obtener('/api/Reserva/ObtenerPorId', id, objeto, dialogLoad, dialog)
    await getClientes()
    await getHabitaciones(objeto.fechaEntrada, objeto.fechaSalida, objeto.habitacionId)
  }

  const onDelete = async () => {
    await eliminarElemento('/api/Reserva/Eliminar', idElementoSeleccionado.value, loadPaginate, dialogLoad)
  }

  const onConfirmArrival = (elemento) => {
    reservaSeleccionada.value = elemento
    dialogConfirmarLlegada.value = true
  }

  const onChangeRoom = (elemento) => {
    reservaSeleccionada.value = elemento
    dialogCambiarHabitacion.value = true
  }

  // Funcion para abrir el dialog de eliminar y pasar el ID del elemento
  const onOpenDialogoEliminar = (id) => {
    idElementoSeleccionado.value = id
    isDialogoEliminarAbierto.value = true
  }

  const onCloseDialog = () => {
    dialog.value = false
    Object.assign(objeto, objetoInicial)
  }

  const onCloseEliminar = () => {
    isDialogoEliminarAbierto.value = false
  }

  const onCloseConfirmarLlegada = () => {
    dialogConfirmarLlegada.value = false
  }

  const onCloseCambiarHabitacion = () => {
    dialogCambiarHabitacion.value = false
  }

  return {
    objeto,
    dialog,
    dialogLoad,
    isDialogoEliminarAbierto,
    dialogConfirmarLlegada,
    dialogCambiarHabitacion,
    idElementoSeleccionado,
    reservaSeleccionada,
    onSave,
    onEdit,
    onDelete,
    onConfirmArrival,
    onChangeRoom,
    onOpenDialogoEliminar,
    onCloseDialog,
    onCloseEliminar,
    onCloseConfirmarLlegada,
    onCloseCambiarHabitacion
  }
}
