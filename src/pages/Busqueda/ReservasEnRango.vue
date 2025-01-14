<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Búsquedas" icon="dashboard"/>
      <q-breadcrumbs-el label="Habitacion"/>
    </q-breadcrumbs>

    <q-table class="q-pa-md" :filter="filter" title="Habitaciones" :rows="items" :columns="columns"
             row-key="id"
             no-data-label="No hay habitaciones asigandas a este ama de llaves"
             no-results-label="No hay habitaciones disponibles"
             loading-label="Cargando..." rows-per-page-label="Filas por página">
      <template v-slot:top>

        <div class="col-4 q-table__title"><span>Buscar Habitaciones disponibles en un rango de fechas</span>
          <q-input
            v-model="formattedDateRange"
            label="Seleccionar rango de fechas*"
            readonly
            outlined
          >
            <!-- Icono para abrir el calendario -->
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date
                    v-model="fechasSeleccionadas"
                    emit-immediately
                    range
                    @update:modelValue="obtenerHabitaciones"
                    format="YYYY-MM-DD"
                    mask="YYYY-MM-DD"
                  >
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <q-space/>
        <DialogLoad :dialogLoad="dialogLoad"/>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import { loadSelectList } from 'src/GenericFunctions/funciones'
// Variables Booleanas

const dialogLoad = ref(false)

const formattedDateRange = ref('')
const fechasSeleccionadas = ref(null)

// Variables vacias
const filter = ref('')

// Arreglos
const items = ref([])

// Columnas de la Tabla,
const columns = [
  {
    name: 'numero',
    align: 'center',
    label: 'Número',
    field: 'numero',
    sortable: true
  }
]

// Funciones
const obtenerHabitaciones = async (value) => {
  if (value) {
    const { from, to } = value
    items.value = await loadSelectList(`/api/Habitacion/ListaDeHabitacionesDisponiblesPorFechaService?fechaInicio=${from}&fechaFin=${to}`)
    const fromDate = new Date(from + 'T00:00:00')
    const toDate = new Date(to + 'T00:00:00')

    // Formatea las fechas en tu zona horaria local
    const fe = fromDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const fs = toDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    formattedDateRange.value = `Fecha inicial: ${fe}, Fecha final: ${fs}`
  } else {
    items.value = []
    formattedDateRange.value = ''
  }
}

</script>
