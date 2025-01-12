<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')"/>
      <q-breadcrumbs-el label="Reservas"/>
    </q-breadcrumbs>
    <q-table class="q-pa-md" :filter="filter" title="Reservas" :rows="items" :columns="columns" row-key="id"
             no-data-label="No hay elementos disponibles" no-results-label="No hay elementos disponibles"
             v-model:pagination="pagination"
             @request="onRequest"
             :rows-per-page-options=[5,7,10,20,50]
             rows-per-page-label="Filas por página"
             loading-label="Cargando...">

      <template v-slot:top>
        <div class="col-4 q-table__title"><span>Reservas</span>
          <q-input outline color="primary" flat v-model="filter" debounce="1000" label="Buscar"/>
        </div>
        <q-space/>

        <q-btn class="bg-primary" style="width: 20px" color="primary" icon="add" @click="abrirDialogoCrear">
          <q-tooltip class="bg-primary" transition-show="flip-right" transition-hide="flip-left"
                     :offset="[10, 10]">Adicionar reserva
          </q-tooltip>
        </q-btn>
        <q-btn outline class="bg-white q-ml-sm" style="width: 20px" color="primary" icon="print">
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

                  <div>
                    <q-input
                      v-model="formattedDateRange"
                      label="Seleccionar rango de fechas*"
                      readonly
                      outlined
                      :error="!!errorMessage"
                      :error-message="errorMessage"
                    >
                      <!-- Icono para abrir el calendario -->
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy>
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
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>

                  <q-select
                    v-if="condicionMostrarSelects"
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    class="col-xs-12 col-sm-12"
                    v-model="objeto.clienteId"
                    label="Seleccionar Cliente*"
                    :loading="cargandoClientes"
                    emit-value
                    map-options
                    use-input
                    :options="filtradoCliente"
                    option-value="id"
                    :option-label="getCustomLabelCliente"
                    :rules="[(val) => !!val || 'Debe seleccinar un Cliente',]"
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
                    v-if="condicionMostrarSelects"
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    class="col-xs-12 col-sm-12"
                    v-model="objeto.habitacionId"
                    label="Seleccionar Habitación*"
                    emit-value
                    map-options
                    :loading="cargandoHabitaciones"
                    use-input
                    :options="filtradoHabitacion"
                    option-value="id"
                    option-label="numero"
                    :rules="[(val) => !!val || 'Debe seleccinar una Habitación',]"
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
                <q-card-actions class="q-mt-none justify-end">
                  <q-btn class="text-white" color="primary" type="submit" label="Guardar"/>
                  <q-btn outline color="primary" type="reset" label="Cancelar"/>
                </q-card-actions>
              </div>
            </q-form>

          </q-card>
        </q-dialog>

        <ConfirmarLlegada v-if="dialogConfirmarLlegada" :isOpen="dialogConfirmarLlegada"
                          :reservaSeleccionada="reservaSeleccionada" @load="loadPaginate"
                          @closeDialog="handleCloseDialogConfirmar"/>

        <DialogEliminar v-if="isDialogoEliminarAbierto" :isOpen="isDialogoEliminarAbierto"
                        :idElemento="Number(idElementoSeleccionado)" @eliminar="eliminar"
                        @closeDialog="handleCloseDialog"/>

        <DialogLoad :dialogLoad="dialogLoad"/>

      </template>
      <template v-slot:body-cell-fechaEntrada="props">
        <q-td :props="props">
          {{ date.formatDate(props.value, 'YYYY-MM-DD') }}
        </q-td>
      </template>
      <template v-slot:body-cell-fechaSalida="props">
        <q-td :props="props">
          {{ date.formatDate(props.value, 'YYYY-MM-DD') }}
        </q-td>
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
            <q-btn flat dense size="sm"
                   @click="abrirDialogoConfirmarLlegada(props.row)"
                   :text-color="props.row.llegadaCliente ? 'red' : 'primary'"
                   icon="check">
              <q-tooltip>
                {{
                  props.row.llegadaCliente ? 'Cancelar confirmación de llegada del cliente' : 'Confirmar llegada del cliente'
                }}
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

import { onMounted, reactive, ref } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import DialogEliminar from 'components/DialogBoxes/DialogEliminar.vue'
import ConfirmarLlegada from 'components/DialogBoxes/Reserva/ConfirmarLlegada.vue'
import {
  closeDialog,
  eliminarElemento,
  filterOptionsMultipleFields,
  obtener,
  saveData
} from 'src/GenericFunctions/funciones.js'

import { date } from 'quasar'
import {
  arrayClientes,
  arrayHabitaciones,
  cargandoClientes,
  cargandoHabitaciones, condicionMostrarSelects,
  errorMessage,
  fechasSeleccionadas, formattedDateRange,
  getClientes,
  getCustomLabelCliente,
  getHabitaciones,
  validarFechas
} from 'src/helpers/reserva'
import { usePagination } from 'src/hooks/usePagination'

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
  {
    name: 'Cliente.Ci',
    align: 'center',
    label: 'Ci del cliente',
    field: 'ciCliente',
    sortable: true
  },
  {
    name: 'Cliente.Nombre',
    align: 'center',
    label: 'Nombre del cliente',
    field: 'nombreCliente',
    sortable: true
  },
  {
    name: 'Habitacion.Numero',
    align: 'center',
    label: 'Habitación',
    field: 'numeroHabitacion',
    sortable: true
  },
  {
    name: 'llegadaCliente',
    align: 'center',
    label: 'Llegada del cliente',
    field: 'llegadaCliente',
    sortable: false
  },
  {
    name: 'action',
    align: 'center',
    label: 'Acciones',
    field: 'action',
    sortable: false
  }

]

// el problema esta en que Object.assign(objeto, objetoInicial) mantiene el id y el reporte que dan error en el crear
const objetoInicial = reactive({
  fechaEntrada: null,
  fechaSalida: null,
  clienteId: null,
  habitacionId: null
})

// Crear una copia del objeto inicial
const objeto = reactive({ ...objetoInicial })

// Custom hook de paginación (llama los datos paginados + filter + order by)
const {
  items,
  pagination,
  filter,
  onRequest,
  loadPaginate
} = usePagination('Reserva') // poner aqui el nombre de la entidad

// Variables Booleanas
const dialog = ref(false)
const dialogLoad = ref(true)
const isDialogoEliminarAbierto = ref(false)
const dialogConfirmarLlegada = ref(false)

// Variables Nulas
const myForm = ref(null)
const idElementoSeleccionado = ref(null)
const reservaSeleccionada = ref(null)

// Arreglos
const filtradoHabitacion = ref([])
const filtradoCliente = ref([])

// Funciones
// 1- Funcion para pasar parametros en el Adicionar SaveData
const Guardar = () => {
  if (!errorMessage.value) {
    objeto.fechaEntrada = fechasSeleccionadas.value.from
    objeto.fechaSalida = fechasSeleccionadas.value.to
    const url = (objeto.id) ? '/api/Reserva/Actualizar' : '/api/Reserva/Crear'
    saveData(url, objeto, loadPaginate, close, dialogLoad)
    filtradoHabitacion.value = arrayHabitaciones.value
    filtradoCliente.value = arrayClientes.value
  }
}

// Funcion para Obtener los datos para editar
const obtenerElementoPorId = async (id) => {
  await obtener('/api/Reserva/ObtenerPorId', id, objeto, dialogLoad, dialog)
  const fe = date.formatDate(objeto.fechaEntrada, 'YYYY-MM-DD')
  const fs = date.formatDate(objeto.fechaSalida, 'YYYY-MM-DD')
  // poner fechas en el q-date
  fechasSeleccionadas.value = {
    from: fe,
    to: fs
  }
  formattedDateRange.value = `Fecha de entrada: ${fe} , Fecha de salida: ${fs}`
  await getClientes()
  await getHabitaciones(fe, fs, objeto.habitacionId)
  filtradoHabitacion.value = arrayHabitaciones.value
  filtradoCliente.value = arrayClientes.value
}

// Funcion para eliminar elemento
const eliminar = async () => {
  await eliminarElemento('/api/Reserva/Eliminar', idElementoSeleccionado.value, loadPaginate, dialogLoad)
}

// solo se ejecuta cuando es crear el de editar los abre obtenerPorID
const abrirDialogoCrear = async () => {
  await getClientes()
  dialog.value = true
}

// Funcion para abrir el dialog de eliminar y pasar el ID del elemento
const abrirDialogoEliminar = (id) => {
  idElementoSeleccionado.value = id
  isDialogoEliminarAbierto.value = true
}

const abrirDialogoConfirmarLlegada = (elemento) => {
  reservaSeleccionada.value = elemento
  dialogConfirmarLlegada.value = true
}

// Funcion para cerrar el dialog eliminar
const handleCloseDialog = () => {
  isDialogoEliminarAbierto.value = false
}
// Funcion para cerrar el dialog confirmar llegada
const handleCloseDialogConfirmar = () => {
  dialogConfirmarLlegada.value = false
}
// Funcion para cerrar el dialog principal de Adicionar y Editar y resetear los campos del formulario
const close = async () => {
  fechasSeleccionadas.value = {} // reiniciar fechas
  arrayHabitaciones.value = []
  arrayClientes.value = []
  errorMessage.value = null
  formattedDateRange.value = null
  closeDialog(objeto, objetoInicial, myForm, dialog)
}

// Funcion para cargar los datos al cargar la pagina
onMounted(async () => {
  dialogLoad.value = true
  await loadPaginate()
  dialogLoad.value = false
})
</script>
