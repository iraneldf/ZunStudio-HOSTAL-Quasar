<template>
  <div class="q-pa-xl">
    <q-breadcrumbs class="qb cursor-pointer q-pb-md">
      <q-breadcrumbs-el label="Inicio" icon="home" @click="$router.push('/')"/>
      <q-breadcrumbs-el label="Nomencladores" icon="dashboard" @click="$router.push('/NomenclatorsCard')"/>
      <q-breadcrumbs-el label="Habitacion"/>
    </q-breadcrumbs>

    <q-table class="q-pa-md" :filter="filter" title="Habitaciones" :rows="items" :columns="columns" row-key="id"
             no-data-label="No hay elementos disponibles" no-results-label="No hay habitaciones disponibles"
             loading-label="Cargando..." rows-per-page-label="Filas por página">
      <template v-slot:top>
        <div class="col-4 q-table__title"><span>Habitacion</span>
          <q-input outline color="primary" flat v-model="filter" debounce="1000" label="Buscar"/>
        </div>

        <q-space/>

        <q-btn outline class="bg-white q-ml-sm" style="width: 20px" color="primary" icon="print"
               @click="imprimir()">
          <q-tooltip class="bg-primary" :offset="[10, 10]">
            Imprimir
          </q-tooltip>
        </q-btn>

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
                <q-btn class="text-white q-mr-sm" color="primary" type="submit" label="Sí" />
                <q-btn outline color="primary" @click="dialog=false" label="No"/>
              </q-card-actions>
            </div>

            <q-form v-else @submit.prevent="CambiarEstado()" @reset="close" ref="myForm">
              <div class="q-gutter-md q-ma-md">
                <div class="col-xs-12 q-pt-lg">
                  <q-select
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    class="col-xs-12 col-sm-12"
                    v-model="objeto.estado"
                    label="Estado"
                    emit-value
                    map-options
                    :options="estados"
                  >
                  </q-select>
                </div>
                <q-card-actions class="col-12 q-mt-none justify-end">
                  <q-btn class="text-white" color="primary" type="submit" label="Guardar"/>
                  <q-btn outline color="primary" type="reset" label="Cancelar"/>
                </q-card-actions>
              </div>
            </q-form>

          </q-card>
        </q-dialog>
        <DialogLoad :dialogLoad="dialogLoad"/>

      </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-tooltip>
              <span v-bind="$attrs">{{ getTooltipText(props.row.estado) }}</span>
            </q-tooltip>
            <q-icon
              :name="getIconName(props.row.estado)"
              :color="getIconColor(props.row.estado)"
              size="sm"
              v-bind="$attrs"
            />
          </div>
        </q-td>
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
  closeDialog,
  loadGet,
  obtener
} from 'src/GenericFunctions/funciones.js'
import {
  cambiarEstado,
  columns,
  objetoInicial,
  estados,
  getIconName,
  getIconColor,
  getTooltipText
} from 'src/helpers/habitacion'
// Variables Booleanas
const dialog = ref(false)
const dialogLoad = ref(true)

// Variables Nulas
const myForm = ref(null)
// Variables vacias
const filter = ref('')

// Arreglos
const items = ref([])

const objeto = reactive({ ...objetoInicial })
// Funciones
const CambiarEstado = () => {
  const url = `/api/Habitacion/CambiarEstado?habitacionId=${objeto.id}&nevoEstado=${objeto.estado}`
  cambiarEstado(url, objeto, load, close, dialogLoad)
}
const load = async () => {
  items.value = await loadGet('/api/Habitacion/ObtenerListadoPaginado')
}
const obtenerElementoPorId = async (id) => {
  await obtener('/api/Habitacion/ObtenerPorId', id, objeto, dialogLoad, dialog)
}
const close = async () => {
  closeDialog(objeto, objetoInicial, myForm, dialog)
}

onMounted(async () => {
  dialogLoad.value = true
  items.value = await loadGet('/api/Habitacion/ObtenerListadoPaginado')
  dialogLoad.value = false
})

</script>
