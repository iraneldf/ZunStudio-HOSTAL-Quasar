<template>
  <q-dialog persistent>
    <q-card style="width: 700px; max-width: 80vw; height: auto;">
      <!-- Encabezado del diálogo -->
      <header class="q-pa-sm bg-primary">
        <q-toolbar>
          <q-toolbar-title class="text-subtitle6 text-white">
            {{ objetoLocal.id ? 'Editar Reserva' : 'Adicionar Reserva' }}
          </q-toolbar-title>
        </q-toolbar>
      </header>

      <!-- Formulario -->
      <q-form @submit.prevent="guardar" @reset="cerrar" ref="myForm">
        <div class="q-gutter-md q-ma-md">
          <!-- Selección de rango de fechas -->
          <q-input
            v-model="formattedDateRange"
            label="Seleccionar rango de fechas*"
            readonly
            outlined
            :error="!!errorMessage"
            :error-message="errorMessage"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date
                    v-model="fechasSeleccionadas"
                    emit-immediately
                    range
                    @update:model-value="validarFechas"
                    format="YYYY-MM-DD"
                    mask="YYYY-MM-DD"
                  >
                    <div v-if="errorMessage">
                      <span class="text-negative">{{ errorMessage }} <q-icon name="error"/></span>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Selección de cliente -->
          <q-select
            v-if="condicionMostrarSelects"
            transition-show="flip-up"
            transition-hide="flip-down"
            class="col-xs-12 col-sm-12"
            v-model="objetoLocal.clienteId"
            label="Seleccionar Cliente*"
            :loading="cargandoClientes"
            emit-value
            map-options
            use-input
            :options="filtradoCliente"
            option-value="id"
            :option-label="getCustomLabelCliente"
            :rules="[(val) => !!val || 'Debe seleccionar un Cliente']"
            @filter="filtrarClientes"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-italic text-grey">
                  No hay elementos disponibles
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Selección de habitación -->
          <q-select
            v-if="condicionMostrarSelects"
            transition-show="flip-up"
            transition-hide="flip-down"
            class="col-xs-12 col-sm-12"
            v-model="objetoLocal.habitacionId"
            label="Seleccionar Habitación*"
            emit-value
            map-options
            :loading="cargandoHabitaciones"
            use-input
            :options="filtradoHabitacion"
            option-value="id"
            option-label="numero"
            :rules="[(val) => !!val || 'Debe seleccionar una Habitación']"
            @filter="filtrarHabitaciones"
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

        <!-- Acciones del diálogo -->
        <q-card-actions class="q-mt-none justify-end">
          <q-btn class="text-white" color="primary" type="submit" label="Guardar"/>
          <q-btn outline color="primary" type="reset" label="Cancelar"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import {
  arrayClientes,
  arrayHabitaciones,
  cargandoClientes,
  cargandoHabitaciones,
  condicionMostrarSelects,
  errorMessage,
  fechasSeleccionadas,
  formattedDateRange,
  getClientes,
  getCustomLabelCliente,
  getHabitaciones,
  validarFechas
} from 'src/helpers/reserva'
import { filterOptionsMultipleFields } from 'src/GenericFunctions/funciones.js'

// Props y Emits
const props = defineProps({
  dialog: Boolean,
  objeto: Object,
  fechasSeleccionadas: Object
})

const emit = defineEmits(['guardar', 'cerrar'])

// Copia local del objeto
const objetoLocal = reactive({ ...props.objeto })

// Variables reactivas
const filtradoCliente = ref([])
const filtradoHabitacion = ref([])

// Watchers
watch(
  () => props.dialog,
  async (newVal) => {
    if (newVal) {
      await getClientes()
      await getHabitaciones(
        props.fechasSeleccionadas.from,
        props.fechasSeleccionadas.to,
        objetoLocal.habitacionId
      )
      filtradoCliente.value = arrayClientes.value
      filtradoHabitacion.value = arrayHabitaciones.value
    }
  }
)

// Sincronizar objetoLocal con la prop objeto
watch(
  () => props.objeto,
  (newVal) => {
    Object.assign(objetoLocal, newVal)
    console.log(objetoLocal)
  },
  { deep: true, immediate: true }
)

// Funciones
const filtrarClientes = (val, update) => {
  filtradoCliente.value = filterOptionsMultipleFields(
    val,
    update,
    filtradoCliente.value,
    ['nombre', 'apellidos', 'ci'],
    arrayClientes.value
  )
}

const filtrarHabitaciones = (val, update) => {
  filtradoHabitacion.value = filterOptionsMultipleFields(
    val,
    update,
    filtradoHabitacion.value,
    ['numero', 'estado'],
    arrayHabitaciones.value
  )
}

const guardar = () => {
  if (!errorMessage.value) {
    // Asignar fechas seleccionadas
    objetoLocal.fechaEntrada = fechasSeleccionadas.value.from
    objetoLocal.fechaSalida = fechasSeleccionadas.value.to
    emit('guardar', objetoLocal) // Emitir el objeto modificado
  }
}

const cerrar = () => {
  emit('cerrar', objetoLocal)
}
</script>
