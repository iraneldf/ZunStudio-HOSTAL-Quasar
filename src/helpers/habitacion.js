/* eslint-disable no-unreachable */
// IMPORT
import { api } from 'src/boot/axios'
import { reactive } from 'vue'
import { Error, Success } from 'src/boot/notify'

const serverUrl = process.env.SERVER_URL
const objetoInicial = reactive({
  id: '',
  estado: null,
  numero: null
})
// Columnas de la Tabla,
const columns = [
  {
    name: 'numero',
    align: 'center',
    label: 'Número',
    field: 'numero',
    sortable: true
  },
  {
    name: 'estado',
    align: 'center',
    label: 'Estado',
    field: 'estado',
    sortable: true
  },
  {
    name: 'action',
    align: 'center',
    label: 'Acciones',
    field: 'action',
    sortable: false
  }
]
// opciones de estado
const estados = [
  {
    label: 'Disponible',
    value: 0
  },
  {
    label: 'Fuera De Servicio',
    value: 1
  }
]
const cambiarEstado = async (endpoint, objeto, load, close, dialogLoad) => {
  const respuesta = reactive({
    resultado: null,
    mensajeError: null
  })

  try {
    dialogLoad.value = true
    const url = `${serverUrl}${endpoint}`
    const method = 'get'
    respuesta.resultado = await api[method](url, objeto)
    Success.call(this, 'El estado ha sido cambiado correctamente')
    await load()
    await close()
    dialogLoad.value = false
    return respuesta
  } catch (error) {
    console.log(error)
    if (error.response) {
      console.error('Error de red:', error.response.data.errorMessage)
      respuesta.mensajeError = error.response.data.errorMessage
      Error.call(this, error.response.data.errorMessage)
    } else if (error.request) {
      console.error('Error de red:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    dialogLoad.value = false
    return respuesta
  }
}

export {
  cambiarEstado,
  columns,
  objetoInicial,
  estados
}
