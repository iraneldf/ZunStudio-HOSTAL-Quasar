<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')" />
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')" />
      <q-breadcrumbs-el label="Piso" />
    </q-breadcrumbs>
    <q-table class="q-pa-md" :filter="filter" title="Útiles" :rows="items" :columns="columns" row-key="id"
      no-data-label="No hay elementos disponibles" no-results-label="No hay elementos disponibles"
      loading-label="Cargando..." rows-per-page-label="Filas por página">
      <template v-slot:top>
        <div class="col-4 q-table__title"><span>Piso</span>
          <q-input outline color="primary" flat v-model="filter" debounce="1000" label="Buscar"
             />
        </div>
        <q-space />

        <q-btn class="bg-primary" style="width: 20px" color="primary" icon="add" @click="dialog = true">
          <q-tooltip class="bg-primary" transition-show="flip-right" transition-hide="flip-left"
            :offset="[10, 10]">Adicionar</q-tooltip>
        </q-btn>
        <q-btn outline class="bg-white q-ml-sm" style="width: 20px" color="primary" icon="print"
           @click="imprimir()">
          <q-tooltip class="bg-primary" :offset="[10, 10]">
            Imprimir
          </q-tooltip>
        </q-btn>
        <q-dialog v-model="dialog" persistent>
          <q-card style="width: 700px; max-width: 80vw; height: auto;">
            <header class="q-pa-sm bg-primary"> <q-toolbar>
                <q-toolbar-title class="text-subtitle6 text-white">
                  {{ objeto.id ? 'Editar Piso' : 'Adicionar Piso' }}</q-toolbar-title>
              </q-toolbar></header>
            <q-form @submit.prevent="Guardar()" @reset="close" ref="myForm">
              <div class="h row q-ma-md">
                <div class="col-xs-12">
                  <q-input :disable="!!objeto.id" label="Código*" v-model="objeto.codigo" color="primary" counter
                    maxlength="50" lazy-rules :rules="[
                      (val) => (val && val.length > 0) || 'Debe insertar un Código',
                      (val) => (items.length > 0 ? !isCodigoRepetido(val, objeto, items) : true) || 'Ya existe un codigo con ese valor',
                    ]" />

                </div>
                <div class="col-xs-12">
                  <q-input label="Descripción *" v-model="objeto.descripcion" color="primary" counter autogrow
                    maxlength="200" lazy-rules :rules="[
                      (val) =>
                        (val && val.length > 0) || 'Debe insertar un Descripción',]" />
                </div>
                <q-checkbox :disable="objeto.id === null" class=" q-mr-md" right-label v-model="objeto.activo"
                  label="Activo" color="primary" />
                <q-card-actions class="col-12 q-mt-none justify-end">
                  <q-btn class="text-white " color="primary" aling="right" type="submit" label="Guardar" />
                  <q-btn outline color="primary" type="reset" label="Cancelar" />
                </q-card-actions>
              </div>
            </q-form>
          </q-card>
        </q-dialog>
        <DialogEliminar v-if="isDialogoEliminarAbierto" :isOpen="isDialogoEliminarAbierto"
          :idElemento="Number(idElementoSeleccionado)" @eliminar="eliminar" @closeDialog="handleCloseDialog" />

        <DialogLoad :dialogLoad="dialogLoad" />
      </template>
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
      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-icon flat :name="(props.value == 0) ? 'highlight_off' : 'check_circle'"
            :class="(props.value == 0) ? 'text-grey' : 'text-primary'" size="20px" />
        </q-td>
      </template>

    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import DialogEliminar from 'components/DialogBoxes/DialogEliminar.vue'
import { loadGet, saveData, eliminarElemento, obtener, closeDialog } from 'src/GenericFunctions/funciones.js'
// Columnas de la Tabla
const columns = [
  { name: 'codigo', align: 'center', label: 'Código', field: 'codigo', sortable: true },
  { name: 'descripcion', align: 'center', label: 'Descripción', field: 'descripcion', sortable: true },
  { name: 'activo', align: 'center', label: 'Activo', field: 'activo', sortable: true },
  { name: 'action', align: 'center', label: 'Acciones', field: 'action', sortable: true }
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

const objetoInicial = {
  // id: null,
  codigo: null,
  descripcion: null,
  activo: true
}

// Crear una copia del objeto inicial
const objeto = reactive({ ...objetoInicial })
// Funciones
// 1- Funcion para pasar parametros en el Adicionar SaveData
const Guardar = () => {
  const url = (objeto.id) ? 'Piso/Actualizar' : 'Piso/Crear'
  console.log(objeto)
  saveData(url, objeto, load, close, dialogLoad)
}

// Funcion para Obtener los datos para editar
const obtenerElementoPorId = async (id) => {
  await obtener('Piso/ObtenerPorId', id, objeto, dialogLoad, dialog)
}

// Funcion para eliminar elemento
const eliminar = async () => {
  await eliminarElemento('Piso/Eliminar', idElementoSeleccionado.value, load, dialogLoad)
}

// Funcion para abrir el dialog de eliminar y pasar el id del elemento
const abrirDialogoEliminar = (id) => {
  idElementoSeleccionado.value = id
  isDialogoEliminarAbierto.value = true
}

// 2- Funcion para pasar por parametro el arreglo de los elmentos de la tabla
const load = async () => {
  items.value = await loadGet('Piso/ObtenerListadoPaginado')
}

// Funcion para cerrar el dialog
const handleCloseDialog = () => {
  isDialogoEliminarAbierto.value = false
}
// Funcion para cerrar el dialog principal de Adicionar y Editar y resetear los campos del formulario
const close = async () => {
  closeDialog(objeto, objetoInicial, myForm, dialog)
}
// Funcion para cargar los datos al cargar la pagina
onMounted(async () => {
  dialogLoad.value = true
  items.value = await loadGet('Piso/ObtenerListadoPaginado')
  dialogLoad.value = false
})

</script>
