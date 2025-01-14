import { ref } from 'vue'
import { loadSelectList } from 'src/GenericFunctions/funciones'

export function usePagination (entidad) {
  // Elementos paginados cargados
  const items = ref([])

  // Configuración de paginación
  const pagination = ref({
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0, // Total de filas (se actualiza dinámicamente)
    sortBy: '',
    descending: ''
  })

  // Estado para filtrar
  const filter = ref('')

  const filtrosPorCampos = ref([{}])

  // Función para manejar los cambios de página
  async function onRequest (props) {
    Object.assign(pagination.value, props.pagination) // Actualiza la paginación
    await loadPaginate() // Obtiene los datos para la página actual
  }

  // Funcion que carga los datos paginados
  const loadPaginate = async () => {
    const cadenaFiltros = filtrosPorCampos.value.reduce((acumulador, f) => {
      return `${acumulador}&${f.filtroNombre}=${f.filtroValue}`
    }, '')

    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const direccion = descending ? 'desc' : 'asc'
    const secuencia = !sortBy ? '' : `${sortBy}%3A${direccion}`
    const {
      elementos,
      cantidad
    } = await loadSelectList(`/api/${entidad}/ObtenerListadoPaginado?SecuenciaOrdenamiento=${secuencia}&CantidadIgnorar=${(page - 1) * rowsPerPage}&CantidadMostrar=${rowsPerPage}&TextoBuscar=${filter.value}${cadenaFiltros}`)
    items.value = elementos // Actualiza los datos de la tabla
    pagination.value.rowsNumber = cantidad // Actualiza el total de filas
  }

  return {
    items,
    pagination,
    filtrosPorCampos,
    filter,
    onRequest,
    loadPaginate
  }
}
