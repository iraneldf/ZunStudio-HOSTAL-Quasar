<template>
  <div class="q-pa-md" style="max-width: 350px; font-weight: 700; color: #205072">
    <q-list padding class="rounded-borders">
      <div v-for="link in this.linksList" :key="link.tittle">
        <q-item class="navbar-late q-pl-none" v-if="!link.children" clickable :key="'link.title'"
          :to="{ name: link.link }" expand-separator>
          <q-item-section class="q-ml-md" avatar>
            {{ link.title }}
          </q-item-section>
        </q-item>
        <q-expansion-item group="man" v-if="link.children" :content-inset-level="0.5" expand-separator :icon="link.icon"
          :label="link.title">
          <div v-for="son in link.children" :key="son.title">
            <q-item v-if="!son.children" :to="{ name: son.link }" v-ripple clickable :icon="son.icon">
              <q-item-section avatar>
                <q-icon size="sm" :name="son.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ son.title }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-expansion-item group="manp" class="q-px-none" v-if="son.children" :content-inset-level="0.5"
              expand-separator :icon="son.icon" :label="son.title">
              <div v-for="son1 in son.children" :key="son1.title">
                <q-item v-if="!son1.children" :to="{ name: son1.link }" v-ripple clickable :icon="son1.icon">
                  <q-item-section avatar>
                    <q-icon size="sm" :name="son1.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ son1.title }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </q-expansion-item>
          </div>
          <q-separator />

        </q-expansion-item>
      </div>
    </q-list>
  </div>
</template>

<script>
import { ref, defineComponent, getCurrentInstance } from 'vue'
import { linksList } from '../router/link-list'
import { api, emp } from 'src/boot/axios'
import {
  recibirStorage
} from 'src/GenericFunctions/funciones'

// import {
//   recibirStorage
// } from 'boot/funciones'

export default defineComponent({
  name: 'EssentialLink',
  props: {},
  created () {
  },
  setup () {
    const instance = getCurrentInstance()
    const active = ref(false)
    const existeEM = ref(false)
    const empresas = ref([])
    const loadEmpresas = async () => {
      await api.get('Empresas')
        .then(r => {
          emp.empresaList = r.data
          emp.empresa = recibirStorage()
          // if (emp.empresaList.length > 0) {
          //   emp.empresa = emp.empresaList[0]
          // } else {
          //   emp.empresa = null
          // }
        }).catch((error) => {
          error.response === undefined ? Error.call(this, error.message) : Error.call(this, error.response.data.mensajeError)
        })
    }

    return {
      emp,
      linksList,
      active,
      loadEmpresas,
      instance,
      existeEM,
      empresas
    }
  }
})
</script>
<style></style>
