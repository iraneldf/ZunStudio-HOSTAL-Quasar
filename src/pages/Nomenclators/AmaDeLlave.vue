<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')"/>
      <q-breadcrumbs-el label="AmaDeLlave"/>
    </q-breadcrumbs>
    <q-table class="q-pa-md" :filter="filter" title="AmaDeLlave" :rows="items" :columns="columns" row-key="id"
             no-data-label="No hay elementos disponibles" no-results-label="No hay elementos disponibles"
             v-model:pagination="pagination"
             @request="onRequest"
             :rows-per-page-options=[5,7,10,20,50]
             loading-label="Cargando..." rows-per-page-label="Filas por página">
      <template v-slot:top>
        <div class="col-4 q-table__title"><span>Amas de llave</span>
          <q-input outline color="primary" flat v-model="filter" debounce="1000" label="Buscar"/>
        </div>
        <q-space/>

        <q-btn class="bg-primary" style="width: 20px" color="primary" icon="add" @click="dialog = true">
          <q-tooltip class="bg-primary" transition-show="flip-right" transition-hide="flip-left"
                     :offset="[10, 10]">Adicionar
          </q-tooltip>
        </q-btn>
        <q-btn outline class="bg-white q-ml-sm" style="width: 20px" color="primary" icon="print"
               @click="imprimir()">
          <q-tooltip class="bg-primary" :offset="[10, 10]">
            Imprimir
          </q-tooltip>
        </q-btn>

        <q-dialog v-model="dialog" persistent>
          <q-card style="width: 700px; max-width: 80vw; height: auto;">
            <header class="q-pa-sm bg-primary">
              <q-toolbar>
                <q-toolbar-title class="text-subtitle6 text-white">
                  {{ objeto.id ? 'Editar Ama de llave' : 'Adicionar Ama de llave' }}
                </q-toolbar-title>
              </q-toolbar>
            </header>
            <q-form @submit.prevent="Guardar()" @reset="close" ref="myForm">
              <div class="h row q-ma-md">
                <div class="col-xs-12">
                  <q-input label="CI*" v-model="objeto.ci" color="primary" counter
                           maxlength="11" lazy-rules :rules="[
                     (val) => (val && val.length > 0) || 'Debe insertar un CI',
                     validateCI,
                     (val) => (val.length >= 11) || 'El CI debe tener 11 caracteres',
                     (val) => (items.length > 0 ? !isValorRepetido(val, 'ci', objeto, items) : true) || 'Ya existe un CI con ese valor',
                     (val) => (items.length > 0 ? !validarCarnet(val): true) || 'Eso no es un CI válido',
                    ]"/>
                </div>
                <div class="col-xs-12">
                  <q-input label="Nombre*" v-model="objeto.nombre" color="primary" counter autogrow
                           maxlength="100" lazy-rules :rules="[
                      (val) =>
                        (val && val.length > 0) || 'Debe insertar el Nombre',]"/>
                </div>
                <div class="col-xs-12">
                  <q-input label="Apellidos*" v-model="objeto.apellido" color="primary" counter autogrow
                           maxlength="100" lazy-rules :rules="[
                      (val) =>
                        (val && val.length > 0) || 'Debe insertar los Apellidos',]"/>
                </div>
                <div class="col-xs-12">
                  <q-input label="Teléfono*" v-model="objeto.telefono" color="primary" counter
                           maxlength="11" lazy-rules :rules="[
                      (val) => (val && val.length > 0) || 'Debe insertar un Teléfono',
                         validateTelefono

                    ]"/>
                </div>

                <q-select
                  transition-show="flip-up"
                  transition-hide="flip-down"
                  class="col-xs-12 col-sm-12"
                  v-model="objeto.habitacionIds"
                  label="Seleccionar Habitaciones"
                  multiple
                  emit-value
                  map-options
                  use-input
                  :options="filtradoHabitacion"
                  option-value="id"
                  :option-label="getCustomLabel"
                  @filter="
                    (val, update) => {
                      filtradoHabitacion = filterOptionsMultipleFields(
                        val,
                        update,
                        filtradoHabitacion,
                        ['numero','estado'],
                        arrayHabitaciones
                      );
                    }
                  "
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-italic text-grey">
                        No hay elementos disponibles
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <q-card-actions class="col-12 q-mt-none justify-end">
                  <q-btn class="text-white " color="primary" aling="right" type="submit" label="Guardar"/>
                  <q-btn outline color="primary" type="reset" label="Cancelar"/>
                </q-card-actions>
              </div>
            </q-form>
          </q-card>
        </q-dialog>

        <DialogDetalles v-if="dialogDetalles" :isOpen="dialogDetalles"
                        :Elemento="ElementoSeleccionado"
                        @closeDialog="handleCloseDialogDetalles"/>
        <DialogEliminar v-if="isDialogoEliminarAbierto" :isOpen="isDialogoEliminarAbierto"
                        :idElemento="Number(idElementoSeleccionado)" @eliminar="eliminar"
                        @closeDialog="handleCloseDialog"/>

        <DialogLoad :dialogLoad="dialogLoad"/>

      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn flat dense size="sm" @click="abrirDialogoDetalles(props.row)" text-color="warning" icon="visibility">
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn flat dense size="sm" @click="obtenerElementoPorId(props.row.id)" text-color="primary" icon="edit">
              <q-tooltip>Editar datos</q-tooltip>
            </q-btn>
            <q-btn flat dense size="sm" @click="abrirDialogoEliminar(props.row.id)" text-color="negative" icon="delete">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import DialogEliminar from 'components/DialogBoxes/DialogEliminar.vue'
import DialogDetalles from 'components/DialogBoxes/AmaDeLlave/DialogDetallesAmaDeLlave.vue'
import {
  loadGet,
  saveData,
  eliminarElemento,
  obtener,
  closeDialog,
  isValorRepetido, validarCarnet, filterOptionsMultipleFields
} from 'src/GenericFunctions/funciones.js'
import { getCustomLabel, obtenerHabitacionesPorAmaDeLlave, validateCI, validateTelefono } from 'src/helpers/amaDellaves'
import { usePagination } from 'src/hooks/usePagination'
// Columnas de la Tabla,
const columns = [
  {
    name: 'ci',
    align: 'center',
    label: 'CI',
    field: 'ci',
    sortable: true
  },
  {
    name: 'nombre',
    align: 'center',
    label: 'Nombre',
    field: 'nombre',
    sortable: true
  },
  {
    name: 'apellido',
    align: 'center',
    label: 'Apellidos',
    field: 'apellido',
    sortable: true
  },
  {
    name: 'telefono',
    align: 'center',
    label: 'Teléfono',
    field: 'telefono',
    sortable: true
  },
  {
    name: 'action',
    align: 'center',
    label: 'Acciones',
    field: 'action',
    sortable: true
  }
]

// Custom hook de paginación (llama los datos paginados + filter + order by)
const {
  items,
  pagination,
  filter,
  onRequest,
  loadPaginate
} = usePagination('AmaDeLlave') // poner aqui el nombre de la entidad

const objetoInicial = reactive({
  ci: null,
  nombre: null,
  apellido: null,
  telefono: null,
  habitacionIds: []
})

// Variables Booleanas
const dialog = ref(false)
const dialogDetalles = ref(false)
const dialogLoad = ref(true)
const isDialogoEliminarAbierto = ref(false)

// Variables Nulas
const myForm = ref(null)
const idElementoSeleccionado = ref(null)
const ElementoSeleccionado = ref(null)

// Arreglos
const arrayHabitaciones = ref([])
const filtradoHabitacion = ref([])

// Crear una copia del objeto inicial
const objeto = reactive({ ...objetoInicial })
// Funciones
// 1- Funcion para pasar parametros en el Adicionar SaveData
const Guardar = () => {
  const url = (objeto.id) ? '/api/AmaDeLlave/Actualizar' : '/api/AmaDeLlave/Crear'
  saveData(url, objeto, loadPaginate, close, dialogLoad)
}

// Funcion para Obtener los datos para editar
const obtenerElementoPorId = async (id) => {
  // Llena el arreglo para filtrar con las habitaciones
  filtradoHabitacion.value = arrayHabitaciones.value
  await obtener('/api/AmaDeLlave/ObtenerPorId', id, objeto, dialogLoad, dialog)
  // pone en la prop habitacionIds del objeto las habitaciones para que aparezcan en el editar
  const habitaciones = await obtenerHabitacionesPorAmaDeLlave(id)
  objeto.habitacionIds = habitaciones.map(habitacion => habitacion.id)
}
// Funcion para eliminar elemento
const eliminar = async () => {
  await eliminarElemento('/api/AmaDeLlave/Eliminar', idElementoSeleccionado.value, loadPaginate, dialogLoad)
}

// Funcion para abrir el dialog de eliminar y pasar el ID del elemento
const abrirDialogoEliminar = (id) => {
  idElementoSeleccionado.value = id
  isDialogoEliminarAbierto.value = true
}

const abrirDialogoDetalles = (obj) => {
  ElementoSeleccionado.value = obj
  dialogDetalles.value = true
}

// Funcion para cerrar el dialog
const handleCloseDialog = () => {
  isDialogoEliminarAbierto.value = false
}
const handleCloseDialogDetalles = () => {
  dialogDetalles.value = false
}

// Funcion para cerrar el dialog principal de Adicionar y Editar y resetear los campos del formulario
const close = async () => {
  closeDialog(objeto, objetoInicial, myForm, dialog)
}
// const todos = ref([])
// Funcion para cargar los datos al cargar la pagina
onMounted(async () => {
  dialogLoad.value = true
  // todos.value = await loadGet('/api/AmaDeLlave/ObtenerListadoPaginado')
  await loadPaginate()
  dialogLoad.value = false
  arrayHabitaciones.value = await loadGet('/api/Habitacion/ObtenerListadoPaginado')
})

</script>
