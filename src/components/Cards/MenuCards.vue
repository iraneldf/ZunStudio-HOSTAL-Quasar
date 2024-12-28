<template class="justify-center">
  <q-card class="card  text-primary justify-center   cursor-pointer" @click="$router.push(props.link)">
    <q-card-section class="pp q-mt-sm justify-center">
      <div class="q-gutter-md ">
        <div class="icon-container ">
          <q-icon class="ico q-pa-sm" size="2.5rem" :name="props.icon" />
        </div>
        <div class="text-container q-mt-md q-pl-xs">
          <q-card-section class="li justify-center  q-pl-none card-title" style="height: 70px;">
            {{ props.title}}
          </q-card-section>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { defineProps, onMounted } from 'vue'
import { emp } from 'src/boot/axios'
import {
  recibirStorage
} from 'src/GenericFunctions/funciones'
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
})
onMounted(async () => {
  emp.empresa = recibirStorage()
})
</script>
