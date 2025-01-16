<template>
  <q-dialog v-model="abrirDialog">
    <q-card style="width: 600px; max-width: 80vw;">
      <q-card-section class="row">
        <div class="col-1">
          <q-avatar icon="warning" color="primary" text-color="white"/>
        </div>
        <div class="col-10 q-ml-md q-mt-md text-weight-bold">
          {{
            props.reservaSeleccionada.llegadaCliente ?
              '¿Cancelar confirmación llegada del cliente?'
              :
              '¿Confirmar llegada del cliente?'
          }}
        </div>
      </q-card-section>
      <q-card-actions class="q-pb-md" align="right">
        <q-btn flat
               class="bg-primary"
               outline
               size="12px"
               label="Aceptar"
               color="white"
               @click=confirmarLlegada()
        />
        <q-btn
          class="q-mr-md"
          outline
          color="primary"
          label="Cancelar"
          size="12px"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
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
watch(abrirDialog, (newVal) => {
  if (!newVal) {
    emit('closeDialog')
  }
})

const emit = defineEmits(['closeDialog', 'load'])

const confirmarLlegada = async () => {
  dialogLoad.value = true
  await api.get(`${serverUrl}/api/Reserva/registrar-llegada?ReservaId=${props.reservaSeleccionada.id}`)
    .then((res) => {
      if (res.data.result.llegadaCliente) {
        Success.call(this, 'Se ha confirmado la llegada del cliente correctamente')
      } else {
        Success.call(this, 'Se ha canelado la confirmación de llegada del cliente correctamente')
      }
      emit('load')
      emit('closeDialog')
    }).catch((error) => {
      error.response === undefined ? Error.call(this, error.message) : Error.call(this, error.response.data.errorMessage)
    })
  dialogLoad.value = false
}
</script>
