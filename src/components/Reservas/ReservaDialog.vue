<template>
  <q-dialog v-model="isDialogOpen" persistent>
    <q-card style="width: 700px; max-width: 80vw; height: auto;">
      <header class="q-pa-sm bg-primary">
        <q-toolbar>
          <q-toolbar-title class="text-subtitle6 text-white">
            {{ isEditMode ? 'Editar Reserva' : 'Adicionar Reserva' }}
          </q-toolbar-title>
        </q-toolbar>
      </header>

      <q-form @submit.prevent="onSave" @reset="onClose" ref="myForm">
        <div class="q-gutter-md q-ma-md">
          <!-- Selector de rango de fechas -->
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
                      <span class="text-negative">{{ errorMessage }} <q-icon name="error" /></span>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Selector de Cliente -->
          <q-select
            v-if="condicionMostrarSelects"
            transition-show="flip-up"
            transition-hide="flip-down"
            class="col-xs-12 col-sm-12"
            v-model="formData.clienteId"
            label="Seleccionar Cliente*"
            :loading="cargandoClientes"
            emit-value
            map-options
            use-input
            :options="filtradoCliente"
            option-value="id"
            :option-label="getCustomLabelCliente"
            :rules="[(val) => !!val || 'Debe seleccionar un Cliente']"
            @filter="onFilterCliente"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-italic text-grey">
                  No hay elementos disponibles
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Selector de Habitación -->
          <q-select
            v-if="condicionMostrarSelects"
            transition-show="flip-up"
            transition-hide="flip-down"
            class="col-xs-12 col-sm-12"
            v-model="formData.habitacionId"
            label="Seleccionar Habitación*"
            emit-value
            map-options
            :loading="cargandoHabitaciones"
            use-input
            :options="filtradoHabitacion"
            option-value="id"
            option-label="numero"
            :rules="[(val) => !!val || 'Debe seleccionar una Habitación']"
            @filter="onFilterHabitacion"
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
          <q-btn class="text-white" color="primary" type="submit" label="Guardar" />
          <q-btn outline color="primary" type="reset" label="Cancelar" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { date } from 'quasar'
import { getClientes, getHabitaciones } from 'src/helpers/reserva'
import { filterOptionsMultipleFields } from 'src/GenericFunctions/funciones.js'

// Props
const props = defineProps({
  dialog: Boolean, // Prop para controlar la visibilidad del diálogo
  objeto: Object // Prop para los datos del formulario
})

// Emits
const emit = defineEmits(['save', 'close'])

// Estados reactivos
const isDialogOpen = ref(props.dialog) // Copia reactiva de la prop dialog
const formData = ref({ ...props.objeto }) // Copia reactiva de la prop objeto
const fechasSeleccionadas = ref({})
const formattedDateRange = ref('')
const errorMessage = ref(null)
const cargandoClientes = ref(false)
const cargandoHabitaciones = ref(false)
const filtradoCliente = ref([])
const filtradoHabitacion = ref([])
const condicionMostrarSelects = ref(true)

// Computed para determinar si está en modo edición
const isEditMode = computed(() => !!formData.value.id)

// Watcher para sincronizar la prop dialog con el estado interno
watch(
  () => props.dialog,
  (newValue) => {
    isDialogOpen.value = newValue
  }
)

// Watcher para sincronizar la prop objeto con el estado interno
watch(
  () => props.objeto,
  (newValue) => {
    formData.value = { ...newValue }
  },
  { deep: true }
)

// Obtener clientes y habitaciones
const onFilterCliente = async (val, update) => {
  const clientes = await getClientes() // Obtener clientes
  filtradoCliente.value = filterOptionsMultipleFields(val, update, filtradoCliente.value, ['nombre', 'apellidos', 'ci'], clientes)
}

const onFilterHabitacion = async (val, update) => {
  const habitaciones = await getHabitaciones() // Obtener habitaciones
  filtradoHabitacion.value = filterOptionsMultipleFields(val, update, filtradoHabitacion.value, ['numero', 'estado'], habitaciones)
}

// Validar fechas
const validarFechas = async (value) => {
  if (value?.from && value?.to) {
    const hoy = date.formatDate(new Date(), 'YYYY-MM-DD')
    const entrada = new Date(value.from)
    const salida = new Date(value.to)
    const diffDays = (salida - entrada) / (1000 * 60 * 60 * 24)

    if (value.from < hoy) {
      errorMessage.value = 'La fecha de entrada debe ser posterior a la actual.'
    } else if (diffDays < 2) {
      errorMessage.value = 'Las reservas deben ser de 3 días como mínimo.'
    } else {
      errorMessage.value = null
      await getHabitaciones(value.from, value.to)
    }
  } else {
    errorMessage.value = 'Las fechas son obligatorias.'
  }
}

// Guardar reserva
const onSave = () => {
  if (!errorMessage.value) {
    emit('save', formData.value) // Emitir el evento save con los datos del formulario
  }
}

// Cerrar diálogo
const onClose = () => {
  emit('close') // Emitir el evento close
}
</script>
