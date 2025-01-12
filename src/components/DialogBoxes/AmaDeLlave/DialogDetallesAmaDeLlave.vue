<template>
  <q-dialog v-model="abrirDialog">
    <q-card class="my-card" style="width: 600px; max-width: 80vw;">
      <!-- Encabezado de la tarjeta -->
      <header class="q-pa-sm bg-primary">
        <q-toolbar>
          <q-toolbar-title class="text-subtitle6 text-white">
            <q-avatar icon="details" color="white" text-color="primary"/>
            Detalles de {{ nombre }} {{ apellido }}
          </q-toolbar-title>
        </q-toolbar>
      </header>

      <!-- Cuerpo de la tarjeta -->
      <q-card-section class="row q-pa-md">
        <!-- Información básica -->
        <q-input
          readonly
          label="CI"
          :model-value="ci"
          class="q-mb-sm col-6"
        />
        <q-input
          readonly
          label="Teléfono"
          :model-value="telefono"
          class="q-mb-sm col-6"
        />

        <!-- Lista de habitaciones como badges -->
        <div class="col-12 q-mt-md">
          <p>Lista de habitaciones que atiende:</p>
          <div class="q-gutter-sm q-mt-sm">
            <template v-if="loading">
              <q-spinner color="primary" size="2em"/>
            </template>
            <template v-else>
              <q-badge
                v-for="habitacion in habitaciones"
                :key="habitacion.id"
                :color="habitacion.estado === 'Disponible' ? 'primary' : 'red'"
                text-color="white"
                class="q-pa-sm"
              >
                {{ habitacion.numero }} {{ habitacion.estado }}
              </q-badge>
              <q-badge
                v-if="habitaciones.length === 0"
                color="grey"
                text-color="white"
                class="q-pa-sm"
              >
                No hay habitaciones asignadas
              </q-badge>
            </template>
          </div>
        </div>

        <!-- Lista de habitaciones en scroll -->
        <div class="col-12 q-mt-md">
          <template v-if="loading">
            <div class="text-center">
              <q-spinner color="primary" size="2em"/>
              <p class="text-grey-8">Cargando habitaciones...</p>
            </div>
          </template>
          <template v-else>
            <q-scroll-area
              v-if="habitaciones.length > 0"
              style="height: 120px; max-width: 100%;"
              :thumb-style="{ width: '6px', borderRadius: '3px', backgroundColor: '#027be3' }"
            >
              <q-list bordered separator>
                <q-item v-for="habitacion in habitaciones" :key="habitacion.id">
                  <q-item-section>
                    {{ habitacion.numero }} ({{ habitacion.estado }})
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
            <p v-else class="text-grey-8">No hay habitaciones asignadas.</p>
          </template>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, toRefs } from 'vue'
import { loadSelectList } from 'src/GenericFunctions/funciones'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  Elemento: {
    type: Object,
    required: true
  }
})

const {
  nombre,
  apellido,
  ci,
  telefono
} = toRefs(props.Elemento)

const habitaciones = ref([])

const emit = defineEmits(['closeDialog'])

const abrirDialog = computed({
  get: () => props.isOpen,
  set: (value) => {
    if (!value) {
      emit('closeDialog')
    }
  }
})

const loading = ref(true) // Estado de carga

onMounted(async () => {
  await obtenerHabitaciones()
})

async function obtenerHabitaciones () {
  try {
    loading.value = true // Activar spinner
    habitaciones.value = await loadSelectList(`/api/Habitacion/ObtenerHabitacionesPorAmaDeLlaves?AmaDeLlavesId=${props.Elemento.id}`)
  } catch (error) {
    console.error('Error al cargar las habitaciones:', error)
  } finally {
    loading.value = false // Desactivar spinner
  }
}
</script>

<style scoped>
.my-card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
