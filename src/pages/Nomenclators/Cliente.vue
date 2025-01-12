<template>
  <div class="q-pa-xl">
    <!-- Breadcrumbs -->
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')" />
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')" />
      <q-breadcrumbs-el label="Clientes" />
    </q-breadcrumbs>

    <!-- Tabla de Clientes -->
    <q-table
      v-model:pagination="pagination"
      :columns="columns"
      :filter="filter"
      :rows="items"
      :rows-per-page-options="[5, 7, 10, 20, 50]"
      class="q-pa-md"
      loading-label="Cargando..."
      no-data-label="No hay elementos disponibles"
      no-results-label="No hay elementos disponibles"
      row-key="id"
      rows-per-page-label="Filas por página"
      title="Clientes"
      @request="onRequest"
    >
      <!-- Slot superior: Título, filtros y botones -->
      <template v-slot:top>
        <div class="col-4 q-table__title">
          <span>Clientes</span>
          <!-- Filtro de búsqueda -->
          <q-input
            outline
            color="primary"
            flat
            v-model="filter"
            debounce="1000"
            label="Buscar"
          />
          <!-- Filtro por CI -->
          <q-select
            transition-show="flip-up"
            transition-hide="flip-down"
            v-model="ciSeleccionado"
            label="Filtrar por CI"
            emit-value
            map-options
            use-input
            input-debounce="1000"
            max-values="11"
            @update:modelValue="onSelect"
            :options="listaCiFiltrada"
            @filter="filtrarListaCi"
          />
        </div>

        <q-space />

        <!-- Botones de acción -->
        <q-btn class="bg-primary" color="primary" icon="add" @click="dialog = true">
          <q-tooltip class="bg-primary" transition-show="flip-right" transition-hide="flip-left" :offset="[10, 10]">
            Adicionar
          </q-tooltip>
        </q-btn>
        <q-btn outline class="bg-white q-ml-sm" color="primary" icon="print">
          <q-tooltip class="bg-primary" :offset="[10, 10]">Imprimir</q-tooltip>
        </q-btn>
      </template>

      <!-- Slot de acciones en la tabla -->
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn flat dense size="sm" @click="obtenerElementoPorId(props.row.id)" text-color="primary" icon="edit">
              <q-tooltip>Editar datos</q-tooltip>
            </q-btn>
            <q-btn flat dense size="sm" @click="abrirDialogoEliminar(props.row.id)" text-color="negative" icon="delete">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Slot para la columna VIP -->
      <template v-slot:body-cell-vip="props">
        <q-td :props="props">
          <q-icon :name="props.value ? 'check_circle' : 'highlight_off'" :class="props.value ? 'text-primary' : 'text-grey'" size="20px" />
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo para agregar/editar cliente -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 700px; max-width: 80vw; height: auto;">
        <header class="q-pa-sm bg-primary">
          <q-toolbar>
            <q-toolbar-title class="text-subtitle6 text-white">
              {{ objeto.id ? 'Editar Cliente' : 'Adicionar Cliente' }}
            </q-toolbar-title>
          </q-toolbar>
        </header>
        <q-form @submit.prevent="guardar" @reset="close" ref="myForm">
          <div class="h row q-ma-md">
            <q-input label="CI*" v-model="objeto.ci" color="primary" counter maxlength="11" lazy-rules :rules="reglasCI" />
            <q-input label="Nombre*" v-model="objeto.nombre" color="primary" counter autogrow maxlength="100" lazy-rules :rules="reglasNombre" />
            <q-input label="Apellidos*" v-model="objeto.apellidos" color="primary" counter autogrow maxlength="100" lazy-rules :rules="reglasApellidos" />
            <q-input label="Teléfono*" v-model="objeto.telefono" color="primary" counter maxlength="11" lazy-rules :rules="reglasTelefono" />
            <q-checkbox :disable="objeto.id === null" class="q-mr-md" right-label v-model="objeto.vip" label="VIP" color="primary" />
            <q-card-actions class="col-12 q-mt-none justify-end">
              <q-btn class="text-white" color="primary" type="submit" label="Guardar" />
              <q-btn outline color="primary" type="reset" label="Cancelar" />
            </q-card-actions>
          </div>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo de eliminación -->
    <DialogEliminar
      v-if="isDialogoEliminarAbierto"
      :isOpen="isDialogoEliminarAbierto"
      :idElemento="Number(idElementoSeleccionado)"
      @eliminar="eliminar"
      @closeDialog="handleCloseDialog"
    />

    <!-- Diálogo de carga -->
    <DialogLoad :dialogLoad="dialogLoad" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import DialogEliminar from 'components/DialogBoxes/DialogEliminar.vue'
import { saveData, eliminarElemento, obtener, closeDialog, isValorRepetido, validarCarnet, validarSoloNumeros, loadGet } from 'src/GenericFunctions/funciones.js'
import { usePagination } from 'src/hooks/usePagination'
import { validateCI } from 'src/helpers/amaDellaves'

// Columnas de la tabla
const columns = [
  { name: 'ci', align: 'center', label: 'CI', field: 'ci', sortable: true },
  { name: 'nombre', align: 'center', label: 'Nombre', field: 'nombre', sortable: true },
  { name: 'apellidos', align: 'center', label: 'Apellidos', field: 'apellidos', sortable: true },
  { name: 'telefono', align: 'center', label: 'Teléfono', field: 'telefono', sortable: true },
  { name: 'vip', align: 'center', label: 'VIP', field: 'vip', sortable: true },
  { name: 'action', align: 'center', label: 'Acciones', field: 'action', sortable: true }
]

// Variables reactivas
const ciSeleccionado = ref('')
const listaCi = ref([])
const listaCiFiltrada = ref([])
const dialog = ref(false)
const dialogLoad = ref(true)
const isDialogoEliminarAbierto = ref(false)
const idElementoSeleccionado = ref(null)
const myForm = ref(null)

// Objeto inicial para el formulario
const objetoInicial = reactive({
  ci: null,
  nombre: null,
  apellidos: null,
  telefono: null,
  vip: false
})

// Copia del objeto inicial
const objeto = reactive({ ...objetoInicial })

// Custom hook de paginación
const { items, pagination, filter, filtrosPorCampos, onRequest, loadPaginate } = usePagination('Cliente')

// Reglas de validación
const reglasCI = [
  (val) => (val && val.length > 0) || 'Debe insertar un CI',
  validateCI,
  (val) => (val.length >= 11) || 'El CI debe tener 11 caracteres',
  (val) => (items.length > 0 ? !isValorRepetido(val, 'ci', objeto, items) : true) || 'Ya existe un CI con ese valor',
  (val) => (items.length > 0 ? !validarCarnet(val) : true) || 'Eso no es un CI válido'
]

const reglasNombre = [
  (val) => (val && val.length > 0) || 'Debe insertar el Nombre'
]

const reglasApellidos = [
  (val) => (val && val.length > 0) || 'Debe insertar los Apellidos'
]

const reglasTelefono = [
  (val) => (val && val.length > 0) || 'Debe insertar un Teléfono',
  (val) => validarSoloNumeros(val) || 'El teléfono solo debe contener números'
]

// Funciones principales
const guardar = () => {
  const url = objeto.id ? '/api/Cliente/Actualizar' : '/api/Cliente/Crear'
  saveData(url, objeto, loadPaginate, close, dialogLoad)
}

const obtenerElementoPorId = async (id) => {
  await obtener('/api/Cliente/ObtenerPorId', id, objeto, dialogLoad, dialog)
}

const eliminar = async () => {
  await eliminarElemento('/api/Cliente/Eliminar', idElementoSeleccionado.value, loadPaginate, dialogLoad)
}

const abrirDialogoEliminar = (id) => {
  idElementoSeleccionado.value = id
  isDialogoEliminarAbierto.value = true
}

const handleCloseDialog = () => {
  isDialogoEliminarAbierto.value = false
}

const close = async () => {
  closeDialog(objeto, objetoInicial, myForm, dialog)
}

const filtrarListaCi = (val, update) => {
  update(() => {
    listaCiFiltrada.value = listaCi.value.filter(ci => ci.toLowerCase().includes(val.toLowerCase()))
  })
}

const onSelect = (val) => {
  if (val) {
    filtrosPorCampos.value = [{ filtroNombre: 'CI', filtroValue: val }]
  } else {
    filtrosPorCampos.value.splice(0)
  }
  loadPaginate()
}

// Cargar datos al montar el componente
onMounted(async () => {
  dialogLoad.value = true
  await loadPaginate()
  const clientes = await loadGet('/api/Cliente/ObtenerListadoPaginado') || []
  listaCi.value = clientes.map(c => c.ci)
  dialogLoad.value = false
})
</script>
