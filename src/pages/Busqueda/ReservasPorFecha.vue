<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Búsquedas" icon="dashboard"/>
      <q-breadcrumbs-el label="Reservas"/>
    </q-breadcrumbs>
    <q-table class="q-pa-md" :filter="filter" title="Reservas" :rows="items" :columns="columns" row-key="id"
             no-data-label="No hay reservas para esta fecha"
             loading-label="Cargando..." rows-per-page-label="Filas por página">
      <template v-slot:top>
        <div class="flex column items-center q-table__title col-12">
          <span>Reservas disponibles en una fecha</span>
          <q-input
            v-model="fechaSeleccionada"
            label="Seleccionar fechas"
            readonly
            outlined
          >
            <!-- Icono para abrir el calendario -->
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date
                    v-model="fechaSeleccionada"
                    emit-immediately
                    format="YYYY-MM-DD"
                    mask="YYYY-MM-DD"
                    @update:modelValue="llamarReservas"
                  >
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <DialogLoad :dialogLoad="dialogLoad"/>

      </template>

      <template v-slot:body-cell-fechaEntrada="props">
        <q-td :props="props">
          {{ date.formatDate(props.value, 'YYYY-MM-DD') }}
        </q-td>
      </template>
      <template v-slot:body-cell-fechaSalida="props">
        <q-td :props="props">
          {{ date.formatDate(props.value, 'YYYY-MM-DD') }}
        </q-td>
      </template>
      <template v-slot:body-cell-llegadaCliente="props">
        <q-td :props="props">
          <q-icon flat :name="!props.value ? 'highlight_off' : 'check_circle'"
                  :class="(props.value === 0) ? 'text-grey' : 'text-primary'" size="20px"/>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>

import { ref } from 'vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import {
  load
} from 'src/GenericFunctions/funciones.js'

import { date } from 'quasar'

// Columnas de la Tabla,
const columns = [
  {
    name: 'Cliente.CI',
    align: 'center',
    label: 'Ci del cliente',
    field: 'ciCliente',
    sortable: false
  },
  {
    name: 'Cliente.nombre',
    align: 'center',
    label: 'Nombre del cliente',
    field: 'nombreCliente',
    sortable: true
  },
  {
    name: 'habitacion',
    align: 'center',
    label: 'Habitacion',
    field: 'numeroHabitacion',
    sortable: true
  }
]
// Variables Booleanas
const dialogLoad = ref(false)
// Variables Nulas
const fechaSeleccionada = ref(null)

// Variables vacias
const filter = ref('')
// Arreglos
const items = ref([])

const llamarReservas = async (val) => {
  if (val) {
    dialogLoad.value = true
    await load(`/api/Reserva/reservas-activas?fecha=${val}`, items)
      .then(dialogLoad.value = false)
  } else {
    items.value = []
  }
}

</script>
