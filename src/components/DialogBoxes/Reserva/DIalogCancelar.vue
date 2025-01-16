<template>
  <q-dialog v-model="abrirDialog">
    <q-card style="width: 600px; max-width: 80vw;">

      <header class="row q-pa-sm">
        <div class="col-1">
          <q-avatar icon="warning" color="primary" text-color="white"/>
        </div>
        <div class="col-10 q-ml-md q-mt-md text-weight-bold">
          {{
            !props.reservaSeleccionada.estaCancelada ?
              'Si desea cancelar esta reserva escriba el motivo a continuacion'
              :
              '¿Reactivar esta reserva?'
          }}
        </div>
      </header>
      <q-form @submit.prevent="cancelarReserva()" @reset="close" ref="myForm">
        <q-card-section class="row">
          <q-input
            v-model="motivoCancelacion"
            filled
            v-if="!props.reservaSeleccionada.estaCancelada"
            style="width: 100%"
            type="textarea"
            label="Motivo de cancelación"
            hint="Escriba el motivo de la cancelación"
            :rules="[
        (val) => (val && val.length > 0) || 'El motivo de cancelación es obligatorio',
        (val) => (val && val.length <= 500) || 'El motivo no puede exceder los 500 caracteres',
      ]"
          />
        </q-card-section>
        <q-card-actions class="q-pb-md" align="right">
          <q-btn flat
                 class="bg-primary"
                 outline
                 size="12px"
                 label="Aceptar"
                 color="white"
                 type="submit"
          />
          <q-btn
            class="q-mr-md"
            outline
            color="primary"
            label="Cancelar"
            size="12px"
            type="reset"
            v-close-popup
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { api } from 'boot/axios'
import { Error, Success } from 'boot/notify'
import dialogLoad from 'components/DialogBoxes/DialogLoad.vue'

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
const abrirDialog = ref(props.isOpen)

// watch(abrirDialog, (newVal) => {
//   if (!newVal) {
//     emit('closeDialog')
//   }
// })

const emit = defineEmits(['closeDialog', 'load'])
const motivoCancelacion = ref(null)
const close = async () => {
  emit('closeDialog')
}

const cancelarReserva = async () => {
  dialogLoad.value = true
  await api.get(`${serverUrl}/api/Reserva/cancelar-reserva?reservaId=${props.reservaSeleccionada.id}&motivo=${motivoCancelacion.value}`)
    .then((res) => {
      if (res.data.result.estaCancelada) {
        Success.call(this, 'Se ha cancelado correctamente la reserva')
      } else {
        Success.call(this, 'Se ha reactivado correctamente la reserva')
      }
      emit('load')
      emit('closeDialog')
    }).catch((error) => {
      error.response === undefined ? Error.call(this, error.message) : Error.call(this, error.response.data.errorMessage)
    })
  dialogLoad.value = false
}
</script>
