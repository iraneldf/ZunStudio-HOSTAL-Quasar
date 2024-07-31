<template>
  <router-view />
</template>
<script>
import { watchEffect } from 'vue'
import { emp, sistemStatus } from 'src/boot/axios'
import {
  enviarStorage,
  recibirStorage
} from 'src/GenericFunctions/funciones'

export default {
  name: 'App',
  setup () {
    watchEffect(() => {
      if (emp.empresa?.id !== null && emp.empresa?.id !== undefined) {
        enviarStorage(emp.empresa)
      }
      if (emp.empresa?.id !== null && emp.empresa?.id !== undefined) {
        emp.empresa = recibirStorage()
      }
    })
    return {
      emp,
      sistemStatus
    }
  }
}
</script>
