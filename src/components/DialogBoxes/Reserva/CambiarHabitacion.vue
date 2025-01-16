<template>
  <q-dialog v-model="abrirDialog" persistent>
    <q-card style="width: 700px; max-width: 80vw; height: auto;">
       <header class="q-pa-sm bg-primary">
            <q-toolbar>
              <q-toolbar-title class="text-subtitle6 text-white">
               Cambiar habitación
              </q-toolbar-title>
            </q-toolbar>
          </header>
      <q-form @submit.prevent="cambiar()" @reset="close" ref="myForm">
        <div class="q-gutter-md q-ma-md">
          <div>
            <q-select
              transition-show="flip-up"
              transition-hide="flip-down"
              class="col-xs-12 col-sm-12"
              v-model="habitacionSeleccionada"
              label="Seleccionar Habitación nueva*"
              emit-value
              map-options
              :loading="loadingHabitaciones"
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
                        dataHabitaciones
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
            <q-btn class="text-white" color="primary" type="submit" label="Cambiar"/>
            <q-btn outline color="primary" type="reset" label="Cancelar"/>
          </q-card-actions>
        </div>
      </q-form>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted, toRefs } from 'vue'
import { api } from 'boot/axios'
import { Error, Success } from 'boot/notify'
import { filterOptionsMultipleFields } from 'src/GenericFunctions/funciones'
import { useFetch } from 'src/hooks/useFetch'

const serverUrl = process.env.SERVER_URL
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  reservaSeleccionada: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['closeDialog', 'load'])

const habitacionSeleccionada = ref(null)

const {
  fechaEntrada,
  fechaSalida,
  id
} = toRefs(props.reservaSeleccionada)

const [dataHabitaciones, , loadingHabitaciones, fetchDataHabitaciones] = useFetch(
  `/api/Habitacion/ListaDeHabitacionesDisponiblesPorFechaService?fechaInicio=${fechaEntrada.value}&fechaFin=${fechaSalida.value}`
)

const filtradoHabitacion = ref([])

const abrirDialog = ref(props.isOpen)
watch(abrirDialog, (newVal) => {
  if (!newVal) {
    emit('closeDialog')
  }
})

// Funcion para cerrar el dialog principal de Adicionar y Editar y resetear los campos del formulario
const close = async () => {
  emit('closeDialog')
}

const cambiar = async () => {
  await api.get(`${serverUrl}/api/Reserva/cambiar-habitacion?reservaId=${id.value}&habitacionId=${habitacionSeleccionada.value}`)
    .then(() => {
      Success.call(this, 'Se ha cambiado de habitacion correctamente')

      emit('load')
      emit('closeDialog')
    }).catch((error) => {
      error.response === undefined ? Error.call(this, error.message) : Error.call(this, error.response.data.errorMessage)
    })
}

onMounted(async () => {
  await fetchDataHabitaciones()
})

</script>
