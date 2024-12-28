<template class="justify-center">
  <div class="jj q-pt-xs q-ma-xl row justify-center item-center">
    <div class="tamaño-card text-center col-xs-12 col-sm-4 col-md-2 col-xl-2 justify-center q-mx-sm"
         style="width: 200px;" v-for="card in cards"
         :key="card.id">
      <MenuCards :title="card.title" :icon="card.icon" :link="card.link"/>
    </div>
  </div>
</template>

<script setup>
import MenuCards from 'src/components/Cards/MenuCards.vue'

const cards = [
  {
    title: 'Reservas',
    icon: 'hotel',
    link: 'Reservas'
  },
  {
    title: 'Clientes',
    icon: 'person',
    link: 'CLientes'
  },
  {
    title: 'Ama De Llaves',
    icon: 'home_work',
    link: 'AmaDeLlaves'
  },
  {
    title: 'Habitaciones',
    icon: 'bed',
    link: 'Habitaciones'
  }

]
</script>
