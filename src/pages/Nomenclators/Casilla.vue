<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')" />
      <q-breadcrumbs-el
        label="Nomencladores"
        icon="dashboard"
        @click="$router.push('/NomenclatorsCard')"
      />
      <q-breadcrumbs-el label="Casilla" />
    </q-breadcrumbs>
    <q-table
      class="q-pa-md"
      :filter="filter"
      title="Útiles"
      :rows="items"
      :columns="columns"
      row-key="id"
      no-data-label="No hay elementos disponibles"
      no-results-label="No hay elementos disponibles"
      loading-label="Cargando..."
      rows-per-page-label="Filas por página"
    >
      <template v-slot:top>
        <div class="col-4 q-table__title">
          <span>Casilla</span>
          <q-input
            outline
            color="primary"
            flat
            v-model="filter"
            debounce="1000"
            label="Buscar"
          />
        </div>
        <q-space />

        <q-btn
          class="bg-primary"
          style="width: 20px"
          color="primary"
          icon="add"
          @click="dialog = true"
        >
          <q-tooltip
            class="bg-primary"
            transition-show="flip-right"
            transition-hide="flip-left"
            :offset="[10, 10]"
            >Adicionar</q-tooltip
          >
        </q-btn>
        <q-btn
          outline
          class="bg-white q-ml-sm"
          style="width: 20px"
          color="primary"
          icon="print"
          @click="imprimir()"
        >
          <q-tooltip class="bg-primary" :offset="[10, 10]">
            Imprimir
          </q-tooltip>
        </q-btn>
        <q-dialog v-model="dialog" persistent>
          <q-card style="width: 700px; max-width: 80vw; height: auto">
            <header class="q-pa-sm bg-primary">
              <q-toolbar>
                <q-toolbar-title class="text-subtitle6 text-white">
                  {{
                    objeto.id ? "Editar Casilla" : "Adicionar Casilla"
                  }}</q-toolbar-title
                >
              </q-toolbar>
            </header>
            <q-form @submit.prevent="Guardar()" @reset="close" ref="myForm">
              <div class="h row q-ma-md">
                <q-select
                  transition-show="flip-up"
                  transition-hide="flip-down"
                  class="col-xs-12 col-sm-6"
                  v-model="objeto.pisoId"
                  label="Piso*"
                  emit-value
                  map-options
                  :use-input="objeto.pisoId === null || objeto.pisoId === ''"
                  option-label="text"
                  option-value="value"
                  :options="filtradoPiso"
                  @filter="
                    (val, update) => {
                      filtradoPiso = filterOptions(
                        val,
                        update,
                        filtradoPiso,
                        'text',
                        arrayPisos
                      );
                    }
                  "
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val !== null && val !== '') || 'Debe insertar un Piso',
                  ]"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-italic text-grey">
                        No hay elementos disponibles
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-input
                  class="col-xs-12 col-md-5"
                  :disable="!!objeto.id"
                  label="Código*"
                  v-model="objeto.codigo"
                  color="primary"
                  counter
                  maxlength="4"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.length > 0) || 'Debe insertar un Código',
                    (val) =>
                      (items.length > 0
                        ? !isValorRepetido(val, 'codigo', objeto, items)
                        : true) || 'Ya existe un código con ese valor',
                  ]"
                />

                <q-input
                  class="col-xs-12"
                  label="Descripción *"
                  v-model="objeto.descripcion"
                  color="primary"
                  counter
                  autogrow
                  maxlength="200"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.length > 0) || 'Debe insertar un Descripción',
                    (val) =>
                      (items.length > 0
                        ? !isValorRepetido(val, 'descripcion', objeto, items)
                        : true) || 'Ya existe una descripción con ese valor',
                  ]"
                />
                <q-checkbox
                  :disable="objeto.id === null"
                  class="q-mr-md"
                  right-label
                  v-model="objeto.activo"
                  label="Activo"
                  color="primary"
                />
                <q-card-actions class="col-12 q-mt-none justify-end">
                  <q-btn
                    class="text-white"
                    color="primary"
                    aling="right"
                    type="submit"
                    label="Guardar"
                  />
                  <q-btn
                    outline
                    color="primary"
                    type="reset"
                    label="Cancelar"
                  />
                </q-card-actions>
              </div>
            </q-form>
          </q-card>
        </q-dialog>
        <DialogEliminar
          v-if="isDialogoEliminarAbierto"
          :isOpen="isDialogoEliminarAbierto"
          :idElemento="idElementoSeleccionado"
          @eliminar="eliminar"
          @closeDialog="handleCloseDialog"
        />
        <DialogLoad :dialogLoad="dialogLoad" />
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn
              flat
              dense
              size="sm"
              @click="obtenerElementoPorId(props.row.id)"
              text-color="primary"
              icon="edit"
            >
              <q-tooltip>Editar datos</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              size="sm"
              @click="abrirDialogoEliminar(props.row.id)"
              text-color="negative"
              icon="delete"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-icon
            flat
            :name="props.value === 0 ? 'highlight_off' : 'check_circle'"
            :class="props.value === 0 ? 'text-grey' : 'text-primary'"
            size="20px"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import DialogEliminar from 'components/DialogBoxes/DialogEliminar.vue'
import {
  loadGet,
  saveData,
  eliminarElemento,
  isValorRepetido,
  obtener,
  closeDialog,
  filterOptions,
  loadSelectList
} from 'src/GenericFunctions/funciones.js'
// Columnas de la Tabla
const columns = [
  {
    name: 'codigo',
    align: 'center',
    label: 'Código',
    field: 'codigo',
    sortable: true
  },
  {
    name: 'descripcion',
    align: 'center',
    label: 'Descripción',
    field: 'descripcion',
    sortable: true
  },
  {
    name: 'activo',
    align: 'center',
    label: 'Activo',
    field: 'activo',
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
// Variables Booleanas
const dialog = ref(false)
const dialogLoad = ref(false)
const isDialogoEliminarAbierto = ref(false)

// Variables Nulas
const myForm = ref(null)
const idElementoSeleccionado = ref(null)

// Variables vacias
const filter = ref('')

// Arreglos
const items = ref([])
const arrayPisos = ref([])
const filtradoPiso = ref([])

const objetoInicial = {
  pisoId: null,
  codigo: null,
  descripcion: null,
  activo: true
}

// Crear una copia del objeto inicial
const objeto = reactive({ ...objetoInicial })
// Funciones// Función para cargar los datos al cargar la página
onMounted(async () => {
  dialogLoad.value = true
  // Se llena el listado de la pagina
  items.value = await loadGet('Casilla/ObtenerListadoPaginado')
  // Se llena el array de Pisos
  arrayPisos.value = await loadSelectList(
    'Piso/ObtenerSelectList?NombreCampoValor=id&NombreCampoTexto=descripcion'
  )
  dialogLoad.value = false
})
// Filtrado
// 1- Funcion para pasar parametros en el Adicionar SaveData
const Guardar = () => {
  const url = objeto.id ? 'Casilla/Actualizar' : 'Casilla/Crear'
  saveData(url, objeto, load, close, dialogLoad)
}

// Funcion para Obtener los datos para editar
const obtenerElementoPorId = async (id) => {
  filtradoPiso.value = arrayPisos.value
  await obtener('Casilla/ObtenerPorId', id, objeto, dialogLoad, dialog)
}

// Funcion para eliminar elemento
const eliminar = async () => {
  await eliminarElemento(
    'Casilla/Eliminar',
    idElementoSeleccionado.value,
    load,
    dialogLoad
  )
}

// Funcion para abrir el dialog de eliminar y pasar el id del elemento
const abrirDialogoEliminar = (id) => {
  idElementoSeleccionado.value = id
  isDialogoEliminarAbierto.value = true
}

// 2- Funcion para pasar por parametro el arreglo de los elmentos de la tabla
const load = async () => {
  items.value = await loadGet('Casilla/ObtenerListadoPaginado')
}

// Funcion para cerrar el dialog
const handleCloseDialog = () => {
  isDialogoEliminarAbierto.value = false
}
// Funcion para cerrar el dialog principal de Adicionar y Editar y resetear los campos del formulario
const close = async () => {
  closeDialog(objeto, objetoInicial, myForm, dialog)
}
</script>
