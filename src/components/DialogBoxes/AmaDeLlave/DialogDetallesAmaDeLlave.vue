<template>
  <q-dialog v-model="abrirDialog">
    <q-card style="width: 600px; max-width: 80vw;">
      <header class="q-pa-sm bg-primary">
        <q-toolbar>
          <q-toolbar-title class="text-subtitle6 text-white">
            <q-avatar icon="details" color="primary" text-color="white"/>
            Detalles de {{ amaDeLlave.nombre }} {{ amaDeLlave.apellido }}
          </q-toolbar-title>
        </q-toolbar>
      </header>
      <q-card-section class="row">
        <div class="col-5 q-ml-md q-mt-md">
          <span class="text-weight-bold">CI :</span> {{ amaDeLlave.ci }}
        </div>
        <div class="col-5 q-ml-md q-mt-md">
          <span class="text-weight-bold">Teléfono :</span> {{ amaDeLlave.telefono }}
        </div>
        <div class="col-12 q-ml-md q-mt-md">
          <p class="text-weight-bold">Lista de habitaciones que atiende :</p>
          <ul>
            <li v-if="amaDeLlave.habitaciones.length === 0">
              No hay habitaciones asignadas.
            </li>
            <li v-else v-for="habitacion in amaDeLlave.habitaciones" :key="habitacion.id">
              {{ habitacion.numero }}
            </li>
          </ul>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, reactive, onMounted } from 'vue'
import { loadSelectList } from 'src/GenericFunctions/funciones'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  Elemento: {
    type: Object,
    required: true
  },
  dialogLoad: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['closeDialog', 'update:dialogLoad'])

const abrirDialog = ref(props.isOpen)

// Emitir evento cuando el diálogo se cierra
watch(abrirDialog, (newVal) => {
  if (!newVal) {
    emit('closeDialog') // Emitir el evento aquí
  }
})

// Crear objeto reactivo para AmaDeLlave
const amaDeLlave = reactive({
  nombre: props.Elemento.nombre,
  apellido: props.Elemento.apellido,
  ci: props.Elemento.ci,
  telefono: props.Elemento.telefono,
  habitaciones: []
})

// Obtener habitaciones cuando el componente se monta
onMounted(async () => {
  await obtenerHabitaciones()
})

// Función para actualizar dialogLoad
const updateDialogLoad = (value) => {
  emit('update:dialogLoad', value)
}

async function obtenerHabitaciones () {
  updateDialogLoad(true) // Abre el diálogo de carga
  amaDeLlave.habitaciones = await loadSelectList(`/api/Habitacion/ObtenerHabitacionesPorAmaDeLlaves?AmaDeLlavesId=${props.Elemento.id}`)
  updateDialogLoad(false) // Cierra el diálogo de carga
}
</script>
