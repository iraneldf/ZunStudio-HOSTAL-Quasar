<template>
  <q-table
    class="q-pa-md"
    :filter="internalFilter"
    title="Reservas"
    :rows="items"
    :columns="columns"
    row-key="id"
    no-data-label="No hay elementos disponibles"
    no-results-label="No hay elementos disponibles"
    v-model:pagination="internalPagination"
    @request="onRequest"
    :rows-per-page-options="[5, 7, 10, 20, 50]"
    rows-per-page-label="Filas por página"
    loading-label="Cargando..."
  >
    <template v-slot:top>
      <div class="col-4 q-table__title">
        <span>Reservas</span>
        <q-input
          outline
          color="primary"
          flat
          @update:modelValue="onUpdateFilter"
          :model-value="internalFilter"
          debounce="1000"
          label="Buscar"
        />
      </div>
      <q-space/>
      <q-btn class="bg-primary" style="width: 20px" color="primary" icon="add" @click="$emit('add')">
        <q-tooltip class="bg-primary" transition-show="flip-right" transition-hide="flip-left" :offset="[10, 10]">
          Adicionar reserva
        </q-tooltip>
      </q-btn>
      <q-btn outline class="bg-white q-ml-sm" style="width: 20px" color="primary" icon="print">
        <q-tooltip class="bg-primary" :offset="[10, 10]">Imprimir</q-tooltip>
      </q-btn>
    </template>
    <template v-slot:body-cell-fechaEntrada="props">
      <q-td
        :props="props"
        :class="{'text-red': esFechaPasada(props.value) && !props.row.llegadaCliente}"
      >
        {{ date.formatDate(props.value, 'DD/MM/YYYY') }}
      </q-td>
    </template>
    <template v-slot:body-cell-fechaSalida="props">
      <q-td :props="props">
        {{ date.formatDate(props.value, 'DD/MM/YYYY') }}
      </q-td>
    </template>
    <template v-slot:body-cell-llegadaCliente="props">
      <q-td :props="props">
        <q-icon :name="props.value ? 'check_circle' : 'highlight_off'"
                :class="props.value ? 'text-primary' : 'text-grey'" size="20px"/>
      </q-td>
    </template>
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <div class="q-gutter-sm">
          <q-btn flat dense size="sm" @click="$emit('confirm-arrival', props.row)"
                 :text-color="props.row.llegadaCliente ? 'red' : 'primary'"
                 :disable="esFechaPasada(props.row.fechaEntrada)" icon="check">
            <q-tooltip>{{
                props.row.llegadaCliente ? 'Cancelar confirmación de llegada del cliente' : 'Confirmar llegada del cliente'
              }}
            </q-tooltip>
          </q-btn>
          <q-btn flat dense size="sm" @click="$emit('edit', props.row.id)"
                 :disable="props.row.llegadaCliente || esFechaPasada(props.row.fechaEntrada)" text-color="primary"
                 icon="edit">
            <q-tooltip>Editar datos</q-tooltip>
          </q-btn>
          <q-btn flat dense size="sm" @click="$emit('change-room', props.row)" text-color="primary"
                 :disable="props.row.llegadaCliente || esFechaPasada(props.row.fechaEntrada)" icon="sync">
            <q-tooltip>Cambiar de habitación</q-tooltip>
          </q-btn>
          <q-btn flat dense size="sm" @click="$emit('delete', props.row.id)" text-color="negative" icon="delete">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  items: Array,
  columns: Array,
  pagination: Object,
  filter: String
})

const emit = defineEmits(['request', 'add', 'edit', 'delete', 'confirm-arrival', 'change-room', 'update:filter', 'update:pagination'])

// Copia reactiva de la prop filter
const internalFilter = ref(props.filter)

// Emitir cambios en el filtro
const onUpdateFilter = (newFilter) => {
  internalFilter.value = newFilter
  emit('update:filter', newFilter)
}

// Copia reactiva de la prop pagination
const internalPagination = ref({ ...props.pagination })

// Función para manejar la solicitud de paginación
const onRequest = (requestProps) => {
  internalPagination.value = requestProps.pagination
  emit('request', requestProps)
}

// Función para verificar si una fecha es pasada
const esFechaPasada = (fecha) => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fechaComparar = new Date(fecha)
  fechaComparar.setHours(0, 0, 0, 0)
  return fechaComparar < hoy
}

// Emitir cambios en la paginación
// watch(
//   internalPagination,
//   (newPagination) => {
//     // Evitar emitir si no hay cambios reales
//     if (JSON.stringify(newPagination) !== JSON.stringify(props.pagination)) {
//       emit('update:pagination', newPagination)
//     }
//   },
//   { deep: true }
// )

</script>
