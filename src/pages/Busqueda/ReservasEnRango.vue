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

const formattedDateRange = ref(null)
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
const obtenerHabitaciones = async (val) => {
  if (val) {
    items.value = await loadSelectList(`/api/Habitacion/ListaDeHabitacionesDisponiblesPorFechaService?fechaInicio=${val.from}&fechaFin=${val.to}`)
  } else {
    items.value = []
  }
}

</script>
