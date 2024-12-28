<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')"/>
      <q-breadcrumbs-el label="Clientes"/>
    </q-breadcrumbs>
    <q-table class="q-pa-md" :filter="filter" title="Clientes" :rows="items" :columns="columns" row-key="id"
             no-data-label="No hay elementos disponibles" no-results-label="No hay elementos disponibles"
             loading-label="Cargando..." rows-per-page-label="Filas por página">
      <template v-slot:top>
        <div class="col-4 q-table__title"><span>Clientes</span>
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
                  {{ objeto.id ? 'Editar Cliente' : 'Adicionar Cliente' }}
                </q-toolbar-title>
              </q-toolbar>
            </header>
            <q-form @submit.prevent="Guardar()" @reset="close" ref="myForm">
              <div class="h row q-ma-md">
                <div class="col-xs-12">
                  <q-input label="CI*" v-model="objeto.ci" color="primary" counter
                           maxlength="11" lazy-rules :rules="[
                      (val) => (val && val.length > 0) || 'Debe insertar un CI',
                     (val) => (items.length > 0 ? !isValorRepetido(val, 'ci', objeto, items)
                        : true) || 'Ya existe un CI con ese valor',
                        (val) => (items.length > 0 ? !validarCarnet(val)
                        : true) || 'Eso no es un CI válido',
                    ]"/>
                </div>
                <div class="col-xs-12">
                  <q-input label="Nombre*" v-model="objeto.nombre" color="primary" counter autogrow
                           maxlength="100" lazy-rules :rules="[
                      (val) =>
                        (val && val.length > 0) || 'Debe insertar el Nombre',]"/>
                </div>
                <div class="col-xs-12">
                  <q-input label="Apellidos*" v-model="objeto.apellidos" color="primary" counter autogrow
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
                <q-checkbox :disable="objeto.id === null" class="q-mr-md" right-label v-model="objeto.vip"
                            label="VIP" color="primary"/>
                <q-card-actions class="col-12 q-mt-none justify-end">
                  <q-btn class="text-white " color="primary" aling="right" type="submit" label="Guardar"/>
                  <q-btn outline color="primary" type="reset" label="Cancelar"/>
                </q-card-actions>
              </div>
            </q-form>
          </q-card>
        </q-dialog>

        <DialogEliminar v-if="isDialogoEliminarAbierto" :isOpen="isDialogoEliminarAbierto"
                        :idElemento="Number(idElementoSeleccionado)" @eliminar="eliminar"
                        @closeDialog="handleCloseDialog"/>

        <DialogLoad :dialogLoad="dialogLoad"/>

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
      <template v-slot:body-cell-vip="props">
        <q-td :props="props">
          <q-icon flat :name="!props.value ? 'highlight_off' : 'check_circle'"
                  :class="(props.value === 0) ? 'text-grey' : 'text-primary'" size="20px"/>
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
  obtener,
  closeDialog,
  isValorRepetido, validarCarnet, validarSoloNumeros
} from 'src/GenericFunctions/funciones.js'
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
    name: 'apellidos',
    align: 'center',
    label: 'Apellidos',
    field: 'apellidos',
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
    name: 'vip',
    align: 'center',
    label: 'VIP',
    field: 'vip',
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
const dialogLoad = ref(true)
const isDialogoEliminarAbierto = ref(false)

// Variables Nulas
const myForm = ref(null)
const idElementoSeleccionado = ref(null)

// Variables vacias
const filter = ref('')

// Arreglos
const items = ref([])

const objetoInicial = reactive({
  // id: null,
  ci: null,
  nombre: null,
  apellidos: null,
  telefono: null,
  vip: false
})

// Crear una copia del objeto inicial
const objeto = reactive({ ...objetoInicial })
// Funciones
// 1- Funcion para pasar parametros en el Adicionar SaveData
const Guardar = () => {
  const url = (objeto.id) ? '/api/Cliente/Actualizar' : '/api/Cliente/Crear'
  saveData(url, objeto, load, close, dialogLoad)
}

// Funcion para Obtener los datos para editar
const obtenerElementoPorId = async (id) => {
  await obtener('/api/Cliente/ObtenerPorId', id, objeto, dialogLoad, dialog)
}

// Funcion para eliminar elemento
const eliminar = async () => {
  await eliminarElemento('/api/Cliente/Eliminar', idElementoSeleccionado.value, load, dialogLoad)
}

// Funcion para abrir el dialog de eliminar y pasar el id del elemento
const abrirDialogoEliminar = (id) => {
  idElementoSeleccionado.value = id
  isDialogoEliminarAbierto.value = true
}

// 2- Funcion para pasar por parametro el arreglo de los elmentos de la tabla
const load = async () => {
  items.value = await loadGet('/api/Cliente/ObtenerListadoPaginado')
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
  // console.log(process.env.NODE_ENV)
  dialogLoad.value = true
  items.value = await loadGet('/api/Cliente/ObtenerListadoPaginado')
  dialogLoad.value = false
})

const validateTelefono = (val) => {
  return validarSoloNumeros(val) ? true : 'El teléfono solo debe contener números'
}

</script>
