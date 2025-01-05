/* eslint-disable no-unreachable */
// IMPORT
import { api } from 'src/boot/axios'
import { reactive, ref } from 'vue'
import { Error, Success } from 'src/boot/notify'

const serverUrl = process.env.SERVER_URL
const title = ref('')

const enviarStorage = (value) => {
  if (value !== '') {
    localStorage.setItem('empresa', JSON.stringify(value))
  }
}

const recibirStorage = () => {
  return JSON.parse(localStorage.getItem('empresa'))
}
// Funcion para cargar todos los datos de una tabla
const loadGet = async (endpoint) => {
  return await api
    .get(`${serverUrl}${endpoint}`)
    .then((r) => {
      console.log()
      return r.data.result.elementos
    })
    .catch((error) => {
      error.response === undefined
        ? Error.call(this, error.message)
        : Error.call(this, error.response.data.mensajeError)
    })
}
// Funcion que se utiliza para cargar los datos en las opciones de los select
const loadSelectList = async (endpoint) => {
  return await api
    .get(`${serverUrl}${endpoint}`)
    .then((r) => {
      return r.data.result
    })
    .catch((error) => {
      error.response === undefined
        ? Error.call(this, error.message)
        : Error.call(this, error.response.data.mensajeError)
    })
}
// Funcion para obtener una lista pasandole el endpoint y el arreglo
const load = async (endpoint, lista) => {
  await api
    .get(endpoint)
    .then((r) => {
      lista.value = r.data.result.elementos
    })
    .catch((error) => {
      error.response === undefined
        ? Error.call(this, error.message)
        : Error.call(this, error.response.data.mensajeError)
    })
}
// Funcion para guardar y editar
const saveData = async (endpoint, objeto, load, close, dialogLoad) => {
  const respuesta = reactive({
    resultado: null,
    mensajeError: null
  })

  try {
    dialogLoad.value = true

    const method = objeto.id ? 'put' : 'post'
    const url = `${serverUrl}${endpoint}/${objeto.id || ''}`
    console.log(url)
    console.log(objeto)
    respuesta.resultado = await api[method](url, objeto)
    Success.call(this, objeto.id ? 'El elemento ha sido modificado correctamente' : 'El elemento ha sido creado correctamente')

    await load()
    await close()
    dialogLoad.value = false

    return respuesta
  } catch (error) {
    if (error.response) {
      // La solicitud fue exitosa, pero hubo un problema con el cuerpo
      // o los encabezados de la respuesta.
      console.error('Error de red:')
      respuesta.mensajeError = error.response.data.errorMessage || error.response.data.title
      Error.call(this, error.response.data.errorMessage || error.response.data.title)
    } else if (error.request) {
      // La solicitud nunca tomó vuela y nunca recibió respuesta,
      // ni siquiera un error de red.
    } else {
      // Otros tipos de errores
      console.error('Error:', error.message)
    }
    // await load()
    // await close()
    dialogLoad.value = false
    return respuesta
  }
}
// Funcion de Eliminar
const eliminarElemento = async (endpoint, id, load, dialogLoad) => {
  const respuesta = reactive({
    resultado: null,
    mensajeError: null,
    errorApi: null
  })

  try {
    dialogLoad.value = true

    const [response] = await Promise.all([api.delete(`${serverUrl}${endpoint}/${id}`)])
    respuesta.resultado = response
    Success.call(this, 'El elemento ha sido eliminado correctamente')

    await load()
    dialogLoad.value = false

    return respuesta
  } catch (error) {
    console.error('Error en eliminarElemento:', error)

    if (error.response) {
      // La solicitud fue exitosa, pero hubo un problema con el cuerpo o los encabezados de la respuesta.
      respuesta.mensajeError = error.response.data || error.message
      respuesta.errorApi = error.response.status
    } else if (error.request) {
      // La solicitud nunca tomó vuelo y nunca recibió respuesta, ni siquiera un error de red.
      respuesta.mensajeError = 'Error de conexión: No se pudo conectar con el servidor.'
    } else {
      // Otros tipos de errores
      respuesta.mensajeError = error.message || 'Ha ocurrido un error inesperado.'
    }

    Error.call(this, respuesta.mensajeError)``

    await load()
    dialogLoad.value = false

    return respuesta
  }
}

// Funcion para Obtener datos por id esto se utiliza generalmente para cargar los datos del formulario
const obtener = async (endpoint, id, objeto, dialogLoad, dialog) => {
  dialogLoad.value = true
  await api.get(`${serverUrl}${endpoint}/${id}`)
    .then(r => {
      title.value = `Editar ${endpoint}`
      Object.assign(objeto, r.data.result)
      dialog.value = true
    }).catch((error) => {
      error.response === undefined ? Error.call(this, error.message) : Error.call(this, error.response.data.mensajeError)
    })
  dialogLoad.value = false
}

// Funcion para verificar que los campos sean unicos
const isValorRepetido = (val, propiedad, objeto, items) => {
  return items.some((e) => e[propiedad] === val && objeto.id !== e.id)
}
// Funcion para resetear los campos del dialogo y cerrarlo
const closeDialog = (objeto, objetoInicial, myForm, dialog) => {
  myForm.value.resetValidation()
  Object.assign(objeto, objetoInicial)
  dialog.value = false
}
// Funcion para Filtrado
const filterOptions = (val, update, options, filterField, array) => {
  update(() => {
    const needle = val ? val.toLowerCase() : ''
    options = array.filter(
      (v) => v[filterField] && v[filterField].toLowerCase().indexOf(needle) >= 0
    )
  }, (ref) => {
    if (
      val !== '' &&
      ref.options.length > 0 &&
      ref.getOptionIndex() === -1
    ) {
      ref.moveOptionSelection(1, true) // enfoca la primera opción seleccionable y no actualiza el valor del input
      ref.toggleOption(ref.options[ref.optionIndex], true) // alterna la opción enfocada
    }
  })
  return options
}
// Filtrar por varios campos
const filterOptionsMultipleFields = (val, update, options, filterFields, array) => {
  update(() => {
    const needle = val ? val.toLowerCase() : ''

    // Filtrar por múltiples campos
    options = array.filter(item => {
      let match = false

      // Verificar cada campo de filtro
      filterFields.forEach(field => {
        if (item[field] && item[field].toLowerCase().includes(needle)) {
          match = true
        }
      })

      return match
    })
  }, (ref) => {
    if (
      val !== '' &&
      ref.options.length > 0 &&
      ref.getOptionIndex() === -1
    ) {
      ref.moveOptionSelection(1, true)
      ref.toggleOption(ref.options[ref.optionIndex], true)
    }
  })

  return options
}

// Función para validar carnet
const validarCarnet = (val) => {
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
const validarLetrasYCaracteresEspeciales = (val) => {
  // Expresión regular que acepta letras y caracteres especiales, pero no números
  const regex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s#&]+$/

  return regex.test(val)
}
// Funcion para validar correo
const validarCorreo = (val) => {
  // Expresión regular para validar direcciones de correo electrónico
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  return regex.test(val)
}
// Funcion para validar solo numeros
const validarSoloNumeros = (val) => {
  // Expresión regular que solo acepta números
  const regex = /^[0-9]+$/

  return regex.test(val)
}

export {
  saveData,
  closeDialog,
  load,
  obtener,
  validarSoloNumeros,
  validarCorreo,
  filterOptions,
  filterOptionsMultipleFields,
  eliminarElemento,
  validarCarnet,
  isValorRepetido,
  validarLetrasYCaracteresEspeciales,
  loadGet,
  enviarStorage,
  loadSelectList,
  recibirStorage
}
