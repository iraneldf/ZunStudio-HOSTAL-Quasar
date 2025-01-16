<template>

  <div class="q-pa-xl">
    <!-- Breadcrumbs -->
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')"/>
      <q-breadcrumbs-el label="Reservas"/>
    </q-breadcrumbs>
    <!-- Tabla de Reservas -->
    <q-table class="q-pa-md" :filter="filter" title="Reservas" :rows="items" :columns="columns" row-key="id"
             no-data-label="No hay elementos disponibles" no-results-label="No hay elementos disponibles"
             v-model:pagination="pagination"
             @request="onRequest"
             :rows-per-page-options=[5,7,10,20,50]
             rows-per-page-label="Filas por página"
             loading-label="Cargando...">

      <!-- Slot superior: Título, filtros y botones -->
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
      </template>

      <!-- Slot de acciones en la tabla -->
      <template v-slot:body-cell-action="props">
        <q-td :props="props" :class="{'bg-red-2': props.row.estaCancelada}">
          <div class="q-gutter-sm">
            <q-btn flat dense size="sm"
                   @click="abrirDialogoConfirmarLlegada(props.row)"
                   :text-color="props.row.llegadaCliente ? 'negative' : 'primary'"
                   :disable="esFechaFutura(props.row.fechaEntrada) ||
                    (esFechaPasada(props.row.fechaEntrada) && !props.row.llegadaCliente ) ||
                    props.row.estaCancelada"
                   :icon="props.row.llegadaCliente ? 'close' : 'check'">
              <q-tooltip>
                {{
                  props.row.llegadaCliente ? 'Cancelar confirmación de llegada del cliente' : 'Confirmar llegada del cliente'
                }}
              </q-tooltip>
            </q-btn>
            <q-btn flat dense size="sm"
                   @click="obtenerElementoPorId(props.row.id)"
                   :disable="props.row.llegadaCliente || esFechaPasada(props.row.fechaEntrada) || props.row.estaCancelada"
                   text-color="primary"
                   icon="edit">
              <q-tooltip>Editar datos</q-tooltip>
            </q-btn>
            <q-btn flat dense size="sm"
                   @click="abrirDialogoCambiarHabitacion(props.row)"
                   text-color="primary"
                   :disable="!props.row.llegadaCliente ||props.row.estaCancelada"
                   icon="sync">
              <q-tooltip>Cambiar de habitación</q-tooltip>
            </q-btn>
            <q-btn flat dense size="sm"
                   :disable="!props.row.llegadaCliente"
                   @click="abrirDialogoCancelar(props.row)"
                   :text-color="props.row.estaCancelada ? 'primary' : 'negative'"
                   :icon="props.row.estaCancelada ? 'refresh' : 'cancel'">
              <q-tooltip>{{ props.row.estaCancelada ? 'Reactivar reserva' : 'Canlecar reserva' }}</q-tooltip>
            </q-btn>
            <!--            <q-btn flat dense size="sm" @click="abrirDialogoEliminar(props.row.id)" text-color="negative"-->
            <!--                   icon="delete">-->
            <!--              <q-tooltip>Eliminar</q-tooltip>-->
            <!--            </q-btn>-->
          </div>
        </q-td>
      </template>

      <!-- Slot para la columna FechaEntrada -->
      <template v-slot:body-cell-fechaEntrada="props">
        <q-td
          :props="props"
          :class="{
          'text-red': esFechaPasada(props.value) && !props.row.llegadaCliente && !props.row.estaCancelada,
          'bg-red-2': props.row.estaCancelada
            }">
          {{ date.formatDate(props.value, 'DD/MM/YYYY') }}
        </q-td>
      </template>

      <!-- Slot para la columna FechaSalida -->
      <template v-slot:body-cell-fechaSalida="props">
        <q-td :props="props" :class="{'bg-red-2': props.row.estaCancelada}">
          {{ date.formatDate(props.value, 'DD/MM/YYYY') }}
        </q-td>
      </template>

      <!-- Slot para la columna LlegadaClientes -->
      <template v-slot:body-cell-llegadaCliente="props">
        <q-td :props="props" :class="{'bg-red-2': props.row.estaCancelada}">
          <q-icon :name="props.value ? 'check_circle' : 'highlight_off'"
                  :class="props.value ? 'text-primary' : 'text-grey'" size="20px"/>
        </q-td>
      </template>

      <!-- Slot para personalizar demas colunmas -->
      <template v-slot:body-cell="props">
        <q-td :props="props" :class="{'bg-red-2': props.row.estaCancelada}">
          {{ props.value }}
        </q-td>
      </template>

    </q-table>
  </div>

  <!-- Diálogo para agregar/editar reserva -->
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
              :error-message="errorCLiente"
              :error="!!errorCLiente"
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

  <!-- Diálogo de eliminación -->
  <CambiarHabitacion v-if="dialogCambiarHabitacion" :isOpen="dialogCambiarHabitacion"
                     :reservaSeleccionada="reservaSeleccionada" @load="loadPaginate"
                     @closeDialog="handleCloseDialogCambiarHabitacion"/>

  <!-- Diálogo de eliminación -->
  <ConfirmarLlegada v-if="dialogConfirmarLlegada" :isOpen="dialogConfirmarLlegada"
                    :reservaSeleccionada="reservaSeleccionada" @load="loadPaginate"
                    @closeDialog="handleCloseDialogConfirmar"/>

  <!-- Diálogo para cancelar reserva  -->
  <DIalogCancelar v-if="isDialogoCancelarAbierto" :isOpen="isDialogoCancelarAbierto"
                  :reservaSeleccionada="reservaSeleccionada" @load="loadPaginate"
                  @closeDialog="handleCloseDialogCancelar"/>

  <!-- Diálogo de eliminación -->
  <!--  <DialogEliminar v-if="isDialogoEliminarAbierto" :isOpen="isDialogoEliminarAbierto"-->
  <!--                  :idElemento="Number(idElementoSeleccionado)" @eliminar="eliminar"-->
  <!--                  @closeDialog="handleCloseDialog"/>-->

  <!-- Diálogo de carga -->
  <DialogLoad :dialogLoad="dialogLoad"/>
</template>

<script setup>

import { onMounted, reactive, ref } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import ConfirmarLlegada from 'components/DialogBoxes/Reserva/ConfirmarLlegada.vue'
import {
  closeDialog,
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
  errorMessage, esFechaFutura, esFechaPasada,
  fechasSeleccionadas, formattedDateRange,
  getClientes,
  getCustomLabelCliente,
  getHabitaciones
} from 'src/helpers/reservaHelpers'
import { usePagination } from 'src/hooks/usePagination'
import CambiarHabitacion from 'components/DialogBoxes/Reserva/CambiarHabitacion.vue'
import DIalogCancelar from 'components/DialogBoxes/Reserva/DIalogCancelar.vue'

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
  // {
  //   name: 'estaCancelada',
  //   align: 'center',
  //   label: 'esta cancelada',
  //   field: 'estaCancelada',
  //   sortable: false
  // },
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
// const isDialogoEliminarAbierto = ref(false)
const isDialogoCancelarAbierto = ref(false)
const dialogConfirmarLlegada = ref(false)
const dialogCambiarHabitacion = ref(false)

// Variables Nulas
const myForm = ref(null)
// const idElementoSeleccionado = ref(null)
const reservaSeleccionada = ref(null)
const errorCLiente = ref(null)

// Arreglos
const filtradoHabitacion = ref([])
const filtradoCliente = ref([])

// Funciones
// 1- Funcion para pasar parametros en el Adicionar SaveData
const Guardar = async () => {
  if (!errorMessage.value) {
    objeto.fechaEntrada = fechasSeleccionadas.value.from
    objeto.fechaSalida = fechasSeleccionadas.value.to
    const url = (objeto.id) ? '/api/Reserva/Actualizar' : '/api/Reserva/Crear'
    const res = await saveData(url, objeto, loadPaginate, close, dialogLoad)
    filtradoHabitacion.value = arrayHabitaciones.value
    filtradoCliente.value = arrayClientes.value
    if (res.status === 422) {
      errorCLiente.value = res.mensajeError
    }
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
// const eliminar = async () => {
//   await eliminarElemento('/api/Reserva/Eliminar', idElementoSeleccionado.value, loadPaginate, dialogLoad)
// }

// solo se ejecuta cuando es crear el de editar los abre obtenerPorID
const abrirDialogoCrear = async () => {
  await getClientes()
  dialog.value = true
}

// Funcion para abrir el dialog de eliminar y pasar el ID del elemento
// const abrirDialogoEliminar = (id) => {
//   idElementoSeleccionado.value = id
//   isDialogoEliminarAbierto.value = true
// }

const abrirDialogoCancelar = (elemento) => {
  reservaSeleccionada.value = elemento
  isDialogoCancelarAbierto.value = true
}

const abrirDialogoConfirmarLlegada = (elemento) => {
  reservaSeleccionada.value = elemento
  dialogConfirmarLlegada.value = true
}

const abrirDialogoCambiarHabitacion = (elemento) => {
  reservaSeleccionada.value = elemento
  dialogCambiarHabitacion.value = true
}

// Funcion para cerrar el dialog eliminar
// const handleCloseDialog = () => {
//   isDialogoEliminarAbierto.value = false
// }
// Funcion para cerrar el dialog cancelar
const handleCloseDialogCancelar = () => {
  isDialogoCancelarAbierto.value = false
}
// Funcion para cerrar el dialog confirmar llegada
const handleCloseDialogConfirmar = () => {
  dialogConfirmarLlegada.value = false
}
// Funcion para cerrar el dialog confirmar llegada
const handleCloseDialogCambiarHabitacion = () => {
  dialogCambiarHabitacion.value = false
}
// Funcion para cerrar el dialog principal de Adicionar y Editar y resetear los campos del formulario
const close = async () => {
  fechasSeleccionadas.value = {} // reiniciar fechas
  arrayHabitaciones.value = []
  arrayClientes.value = []
  errorMessage.value = null
  formattedDateRange.value = null
  errorCLiente.value = null
  closeDialog(objeto, objetoInicial, myForm, dialog)
}

// Manejo de las fechas del fomulario
const validarFechas = async (value) => {
  arrayHabitaciones.value = []
  if (value) {
    const {
      from,
      to
    } = value
    const hoy = date.formatDate(new Date(), 'YYYY-MM-DD')

    if (from && to) {
      // Convierte las fechas a objetos Date y añade la hora local
      const fromDate = new Date(from + 'T00:00:00')
      const toDate = new Date(to + 'T00:00:00')

      // Formatea las fechas en tu zona horaria local
      const fe = fromDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      const fs = toDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      formattedDateRange.value = `Fecha inicial: ${fe}, Fecha final: ${fs}`
      const entrada = new Date(from)
      const salida = new Date(to)
      const diffTime = salida - entrada
      const diffDays = diffTime / (1000 * 60 * 60 * 24) // Convertir milisegundos a días
      if (from < hoy) {
        errorMessage.value = 'La fecha de entrada debe ser posterior a la actual.'
      } else if (diffDays < 2) {
        errorMessage.value = 'La reservas deben ser de 3 días como mínimo.'
      } else {
        errorMessage.value = null
      }

      if (!errorMessage.value) {
        await getHabitaciones(from, to)
        // const habitacionExiste = arrayHabitaciones.value.some(
        //   (habitacion) => habitacion.id === objeto.habitacionId
        // )
        // // quitar la habitacion del select si no esta en la lista de habitaciones disponibles
        // if (!habitacionExiste) objeto.habitacionId = null
      }
    }
  } else {
    formattedDateRange.value = ''
    errorMessage.value = 'Las fechas son obligatorias.'
  }
}

// Funcion para cargar los datos al cargar la pagina
onMounted(async () => {
  dialogLoad.value = true
  await loadPaginate()
  dialogLoad.value = false
})
</script>
