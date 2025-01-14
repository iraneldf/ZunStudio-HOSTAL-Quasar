// useFetch.js
import { ref } from 'vue'
import axios from 'axios'

export function useFetch (endpoint, options = {}) {
  const data = ref(null) // Datos obtenidos de la solicitud
  const error = ref(null) // Error en caso de que falle la solicitud
  const loading = ref(false) // Estado de carga
  const serverUrl = process.env.SERVER_URL

  const fetchData = async () => {
    loading.value = true // Inicia la carga
    try {
      const response = await axios(`${serverUrl}${endpoint}`, options) // Realiza la solicitud

      data.value = response.data.result
    } catch (err) {
      error.value = err // Captura el error
      err.response === undefined
        ? Error.call(this, err.message)
        : Error.call(this, err.response.data.mensajeError)
    } finally {
      loading.value = false // Finaliza la carga
    }
  }

  return [
    data,
    error,
    loading,
    fetchData // Permite volver a realizar la solicitud manualmente
  ]
}
