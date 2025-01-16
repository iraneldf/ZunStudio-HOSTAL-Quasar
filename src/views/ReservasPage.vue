<template>
  <div class="q-pa-xl">
    <!-- Breadcrumbs -->
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')"/>
      <q-breadcrumbs-el label="Reservas"/>
    </q-breadcrumbs>

    <!-- Tabla de Reservas -->
    <ReservasTable
      :items="items"
      :columns="columns"
      :pagination="pagination"
      :filter="filter"
      @add="dialog = true"
      @edit="onEdit"
      @delete="onOpenDialogoEliminar"
      @request="onRequest"
      @update:pagination="onUpdatePagination"
      @update:filter="onUpdateFilter"
    />

    <!-- Diálogos -->
    <ReservaDialog
      v-model="dialog"
      :objeto="objeto"
      @save="onSave"
      @confirm-arrival="onConfirmArrival"
      @change-room="onChangeRoom"
      @delete="onDelete"
      @close="onCloseDialog"
    />

    <CambiarHabitacion
      v-if="dialogCambiarHabitacion"
      :isOpen="dialogCambiarHabitacion"
      :reservaSeleccionada="reservaSeleccionada"
      @load="loadPaginate"
      @close="onCloseCambiarHabitacion"
    />

    <ConfirmarLlegada
      v-if="dialogConfirmarLlegada"
      :isOpen="dialogConfirmarLlegada"
      :reservaSeleccionada="reservaSeleccionada"
      @load="loadPaginate"
      @close="onCloseConfirmarLlegada"
    />

    <DialogEliminar
      v-if="isDialogoEliminarAbierto"
      :isOpen="isDialogoEliminarAbierto"
      :idElemento="idElementoSeleccionado"
      @eliminar="onEliminar"
      @close="onCloseEliminar"
    />

    <DialogLoad :dialogLoad="dialogLoad"/>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import ReservasTable from 'components/Reservas/ReservasTable.vue'
import ReservaDialog from 'components/Reservas/CrearReservaDialog.vue'
import CambiarHabitacion from 'components/DialogBoxes/Reserva/CambiarHabitacion.vue'
import ConfirmarLlegada from 'components/DialogBoxes/Reserva/ConfirmarLlegada.vue'
import DialogEliminar from 'components/DialogBoxes/DialogEliminar.vue'
import DialogLoad from 'components/DialogBoxes/DialogLoad.vue'
import { usePagination } from 'src/hooks/usePagination'
import { useReserva } from 'src/hooks/useReserva'

// Columnas de la tabla
const columns = [
  {
    name: 'fechaEntrada',
    align: 'center',
    label: 'Fecha de entrada',
    field: 'fechaEntrada',
    sortable: true
  },
  {
    name: 'fechaSalida',
    align: 'center',
    label: 'Fecha de salida',
    field: 'fechaSalida',
    sortable: true
  },
  {
    name: 'importe',
    align: 'center',
    label: 'Importe',
    field: 'importe',
    sortable: true
  },
  {
    name: 'Cliente.Ci',
    align: 'center',
    label: 'Ci del cliente',
    field: 'ciCliente',
    sortable: true
  },
  {
    name: 'Cliente.Nombre',
    align: 'center',
    label: 'Nombre del cliente',
    field: 'nombreCliente',
    sortable: true
  },
  {
    name: 'Habitacion.Numero',
    align: 'center',
    label: 'Habitación',
    field: 'numeroHabitacion',
    sortable: true
  },
  {
    name: 'llegadaCliente',
    align: 'center',
    label: 'Llegada del cliente',
    field: 'llegadaCliente',
    sortable: false
  },
  {
    name: 'action',
    align: 'center',
    label: 'Acciones',
    field: 'action',
    sortable: false
  }
]

// Hook de paginación
const {
  items,
  pagination,
  filter,
  onRequest,
  loadPaginate
} = usePagination('Reserva')

// Hook de reserva
const {
  objeto,
  dialog,
  dialogLoad,
  isDialogoEliminarAbierto,
  dialogConfirmarLlegada,
  dialogCambiarHabitacion,
  idElementoSeleccionado,
  reservaSeleccionada,
  onSave,
  onEdit,
  onDelete,
  onConfirmArrival,
  onChangeRoom,
  onOpenDialogoEliminar,
  onCloseDialog,
  onCloseEliminar,
  onCloseConfirmarLlegada,
  onCloseCambiarHabitacion
} = useReserva(loadPaginate)

// Funciones para manejar cambios en las props
const onUpdatePagination = (newPagination) => {
  pagination.value = newPagination
}
const onUpdateFilter = (newFilter) => {
  filter.value = newFilter
}
// Función para eliminar una reserva
const onEliminar = async () => {
  await onDelete() // Usa la función onDelete del hook useReserva
}

// Cargar datos al montar el componente
onMounted(async () => {
  dialogLoad.value = true
  await loadPaginate()
  dialogLoad.value = false
})
</script>
