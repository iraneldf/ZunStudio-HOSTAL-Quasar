<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Búsquedas" icon="dashboard"/>
      <q-breadcrumbs-el label="Habitacion"/>
    </q-breadcrumbs>

    <q-table class="q-pa-md" :filter="filter" title="Habitaciones" :rows="items" :columns="columns" row-key="id"
             no-data-label="No hay habitaciones asigandas a este ama de llaves"
             no-results-label="No hay habitaciones disponibles"
             loading-label="Cargando..." rows-per-page-label="Filas por página">
      <template v-slot:top>

        <div class="col-4 q-table__title"><span>Buscar Habitación por Ama de llave</span>
          <q-select
            transition-show="flip-up"
            transition-hide="flip-down"
            class="col-xs-12 col-sm-12"
            v-model="selectedAmaDeLlave"
            @update:model-value="actualizarHabitaciones"
            label="Amas de llaves"
            emit-value
            map-options
            use-input
            :option-label="val=>`${val.nombre} (CI: ${val.ci})`"
            :options="filtradoAmaDeLlave"
            @filter="
                    (val, update) => {
                      filtradoAmaDeLlave = filterOptionsMultipleFields(
                        val,
                        update,
                        filtradoAmaDeLlave,
                        ['nombre','apellido','ci'],
                        amasDeLlaves
                      );
                    }
                  "
          >
          </q-select>
        </div>
        <q-space/>

        <q-dialog v-model="dialog" persistent>
          <q-card style="width: 700px; max-width: 80vw; height: auto;">
            <header class="q-pa-sm bg-primary">
              <q-toolbar>
                <q-toolbar-title class="text-subtitle6 text-white">
                  Cambiar estado de la habitacion {{ objeto.numero }}
                </q-toolbar-title>
              </q-toolbar>
            </header>
            <div v-if="objeto.estado === 'Ocupado'" class="q-gutter-md q-ma-md">
              <div class="col-xs-12">
                <h6 class="text-negative q-mb-md" style="font-weight: bold;">
                  Esta habitación está siendo ocupada por un cliente. Asegúrese antes de cambiarlo de habitación.
                </h6>
              </div>
              <q-card-actions class="q-mt-none justify-end items-center">
                <p class="q-mr-md" style="font-size: 1.1em;">¿Desea cambiar al cliente de habitación?</p>
                <q-btn class="text-white q-mr-sm" color="primary" type="submit" label="Sí"/>
                <q-btn outline color="primary" @click="dialog=false" label="No"/>
              </q-card-actions>
            </div>
          </q-card>
        </q-dialog>
        <DialogLoad :dialogLoad="dialogLoad"/>

      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">

            <q-btn flat dense size="sm" @click="obtenerElementoPorId(props.row.id)" text-color="primary" icon="edit">
              <q-tooltip>Cambiar estado</q-tooltip>
            </q-btn>

          </div>
        </q-td>
      </template>

    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import {
  filterOptionsMultipleFields,
  loadGet,
  obtener
} from 'src/GenericFunctions/funciones.js'
import {
  objetoInicial
} from 'src/helpers/habitacion'
import { obtenerHabitacionesPorAmaDeLlave } from 'src/helpers/amaDellaves'
// Variables Booleanas
const dialog = ref(false)
const dialogLoad = ref(true)

// Variables Nulas
const selectedAmaDeLlave = ref(null)
// Variables vacias
const filter = ref('')

// Arreglos
const items = ref([])
const amasDeLlaves = ref([])
const filtradoAmaDeLlave = ref([])
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

const objeto = reactive({ ...objetoInicial })
// Funciones
const load = async (id) => {
  items.value = await obtenerHabitacionesPorAmaDeLlave(id)
}

const loadAmasDeLlaes = async () => {
  amasDeLlaves.value = await loadGet('/api/AmaDeLlave/ObtenerListadoPaginado')
}
const obtenerElementoPorId = async (id) => {
  await obtener('/api/Habitacion/ObtenerPorId', id, objeto, dialogLoad, dialog)
}

const actualizarHabitaciones = async (value) => {
  await load(value.id)
}
onMounted(async () => {
  dialogLoad.value = true
  await loadAmasDeLlaes()
  dialogLoad.value = false
})

</script>
