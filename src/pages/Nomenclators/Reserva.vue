<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')"/>
      <q-breadcrumbs-el label="Reservas"/>
    </q-breadcrumbs>
    <q-table class="q-pa-md" :filter="filter" title="Reservas" :rows="items" :columns="columns" row-key="id"
             no-data-label="No hay elementos disponibles" no-results-label="No hay elementos disponibles"
             loading-label="Cargando..." rows-per-page-label="Filas por página">
      <template v-slot:top>
        <div class="col-4 q-table__title"><span>Reservas</span>
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
                  {{ objeto.id ? 'Editar Reserva' : 'Adicionar Reserva' }}
                </q-toolbar-title>
              </q-toolbar>
            </header>

            <q-form @submit.prevent="Guardar()" @reset="close" ref="myForm">
              <div class="q-gutter-md q-ma-md">

                <div class="flex">
                  <div class="">
                    <q-date
                      v-model="fechasSeleccionadas"
                      emit-immediately
                      range
                      @update:modelValue="validarFechas"
                      format="YYYY-MM-DD"
                      mask="YYYY-MM-DD"
                    >

                      <div v-if="errorMessage">
                        <span class="text-negative">{{ errorMessage }} <q-icon name="error"/> </span>
                      </div>
                    </q-date>
                  </div>
                  <div class="flex-1">
                    <q-select
                      transition-show="flip-up"
                      transition-hide="flip-down"
                      class="col-xs-12 col-sm-12"
                      v-model="objeto.clienteId"
                      label="Seleccionar Cliente*"
                      emit-value
                      map-options
                      use-input
                      :options="filtradoCliente"
                      option-value="id"
                      :option-label="getCustomLabelCliente"
                      :rules="[(val) => (val && val.length > 0) || 'Debe seleccinar un Cliente',]"
                      @filter="
                    (val, update) => {
                      filtradoCliente = filterOptionsMultipleFields(
                        val,
                        update,
                        filtradoCliente,
                        ['nombre','apellidos','ci'],
                        arrayClientes
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
                    <q-select
                      transition-show="flip-up"
                      transition-hide="flip-down"
                      class="col-xs-12 col-sm-12"
                      v-model="objeto.habitacionId"
                      label="Seleccionar Habitación*"
                      emit-value
                      map-options
                      use-input
                      :options="filtradoHabitacion"
                      option-value="id"
                      :option-label="getCustomLabelHabitacion"
                      :rules="[(val) => (val && val.length > 0) || 'Debe seleccinar una Habitación',]"
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
                  </div>
                </div>

                <q-card-actions class="q-mt-none justify-end">
                  <q-btn class="text-white" color="primary" type="submit" label="Guardar"/>
                  <q-btn outline color="primary" type="reset" label="Cancelar"/>
                </q-card-actions>
              </div>
            </q-form>

          </q-card>
        </q-dialog>

        <ConfirmarLlegada v-if="dialogConfirmarLlegada" :isOpen="dialogConfirmarLlegada"
                          :idElemento="idElementoSeleccionado" @load="load"
                          @closeDialog="handleCloseDialogConfirmar"/>

        <DialogEliminar v-if="isDialogoEliminarAbierto" :isOpen="isDialogoEliminarAbierto"
                        :idElemento="Number(idElementoSeleccionado)" @eliminar="eliminar"
                        @closeDialog="handleCloseDialog"/>

        <DialogLoad :dialogLoad="dialogLoad"/>

      </template>

      <template v-slot:body-cell-llegadaCliente="props">
        <q-td :props="props">
          <q-icon flat :name="!props.value ? 'highlight_off' : 'check_circle'"
                  :class="(props.value === 0) ? 'text-grey' : 'text-primary'" size="20px"/>
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn v-if="!props.row.llegadaCliente" flat dense size="sm"
                   @click="abrirDialogoConfirmarLlegada(props.row.id)"
                   text-color="primary"
                   icon="check">
              <q-tooltip>
                {{ props.row.llegadaCliente ? 'Confirmar llegada' : 'Cancelar llegada' }}
              </q-tooltip>
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
import ConfirmarLlegada from 'components/DialogBoxes/Reserva/ConfirmarLlegada.vue'
import {
  loadGet,
  // eslint-disable-next-line no-unused-vars
  saveData,
  eliminarElemento,
  obtener,
  closeDialog, filterOptionsMultipleFields
} from 'src/GenericFunctions/funciones.js'

import { date } from 'quasar'
import {
  getCustomLabelCliente,
  getCustomLabelHabitacion,
  fechasSeleccionadas,
  validarFechas,
  errorMessage
} from 'src/helpers/reserva'
// Columnas de la Tabla,
const columns = [
  {
    name: 'fechaEntrada',
    align: 'center',
    label: 'Fecha de entrada',
    field: 'fechaEntrada',
    sortable: true
  },
  {
    name: 'fechaSalida',
    align: 'center',
    label: 'Fecha de salida',
    field: 'fechaSalida',
    sortable: true
  },
  {
    name: 'importe',
    align: 'center',
    label: 'Importe',
    field: 'importe',
    sortable: true
  },
  // {
  //   name: 'cliente',
  //   align: 'center',
  //   label: 'Cliente',
  //   field: 'clienteId',
  //   sortable: true
  // },
  // {
  //   name: 'habitacion',
  //   align: 'center',
  //   label: 'Habitacion',
  //   field: 'habitacionId',
  //   sortable: true
  // },
  {
    name: 'llegadaCliente',
    align: 'center',
    label: 'Llegada del cliente',
    field: 'llegadaCliente',
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
const dialogConfirmarLlegada = ref(false)

// Variables Nulas
const myForm = ref(null)
const idElementoSeleccionado = ref(null)

// Variables vacias
const filter = ref('')

// Arreglos
const items = ref([])
const arrayClientes = ref([])
const arrayHabitaciones = ref([])
const filtradoHabitacion = ref([])
const filtradoCliente = ref([])

const objetoInicial = reactive({
  fechaEntrada: null,
  fechaSalida: null,
  clienteId: null,
  habitacionId: null
})

// Crear una copia del objeto inicial
const objeto = reactive({ ...objetoInicial })
// Funciones
// 1- Funcion para pasar parametros en el Adicionar SaveData
const Guardar = () => {
  if (!errorMessage.value) {
    objeto.fechaEntrada = fechasSeleccionadas.value.from
    objeto.fechaSalida = fechasSeleccionadas.value.to
    console.log(objeto)
    const url = (objeto.id) ? '/api/Reserva/Actualizar' : '/api/Reserva/Crear'
    saveData(url, objeto, load, close, dialogLoad)
  }
}
// Funcion para Obtener los datos para editar
const obtenerElementoPorId = async (id) => {
  await obtener('/api/Reserva/ObtenerPorId', id, objeto, dialogLoad, dialog)
  // poner fechas en el formulario
  fechasSeleccionadas.value = {
    to: date.formatDate(objeto.fechaEntrada, 'YYYY-MM-DD'),
    from: date.formatDate(objeto.fechaSalida, 'YYYY-MM-DD')
  }
  console.log(objeto)
}

// Funcion para eliminar elemento
const eliminar = async () => {
  await eliminarElemento('/api/Reserva/Eliminar', idElementoSeleccionado.value, load, dialogLoad)
}

// Funcion para abrir el dialog de eliminar y pasar el id del elemento
const abrirDialogoEliminar = (id) => {
  idElementoSeleccionado.value = id
  isDialogoEliminarAbierto.value = true
}

const abrirDialogoConfirmarLlegada = (id) => {
  idElementoSeleccionado.value = id
  dialogConfirmarLlegada.value = true
}

// 2- Funcion para pasar por parametro el arreglo de los elmentos de la tabla
const load = async () => {
  items.value = await loadGet('/api/Reserva/ObtenerListadoPaginado')
}

// Funcion para cerrar el dialog
const handleCloseDialog = () => {
  isDialogoEliminarAbierto.value = false
}
const handleCloseDialogConfirmar = () => {
  dialogConfirmarLlegada.value = false
}
// Funcion para cerrar el dialog principal de Adicionar y Editar y resetear los campos del formulario
const close = async () => {
  fechasSeleccionadas.value = {} // reiniciar fechas
  closeDialog(objeto, objetoInicial, myForm, dialog)
}
// Funcion para cargar los datos al cargar la pagina
onMounted(async () => {
  // console.log(process.env.NODE_ENV)
  dialogLoad.value = true
  items.value = await loadGet('/api/Reserva/ObtenerListadoPaginado')
  arrayClientes.value = await loadGet('/api/Cliente/ObtenerListadoPaginado')
  arrayHabitaciones.value = await loadGet('/api/Habitacion/ObtenerListadoPaginado?Estado=Disponible')
  dialogLoad.value = false
})

</script>

<style>
.flex-1 {
  flex: 1;
  justify-content: center;
  gap: 50px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
</style>
