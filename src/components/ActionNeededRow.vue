<template>
  <!-- Fragment: 3 compact cols + drawer -->
  <v-col cols="12" sm="6" md="2">
    <ActionTile
      title="Not Contacted 30+ Days"
      :count="notContacted.length"
      color="error"
      icon="mdi-phone-missed"
      :compact="true"
      :expanded="false"
      @toggle="openDrawer('notContacted')"
    />
  </v-col>

  <v-col cols="12" sm="6" md="2">
    <ActionTile
      title="Medicaid Expiring in 30 Days"
      :count="medicaidExpiring.length"
      color="error"
      icon="mdi-card-account-details-outline"
      :compact="true"
      :expanded="false"
      @toggle="openDrawer('medicaid')"
    />
  </v-col>

  <v-col cols="12" sm="6" md="2">
    <ActionTile
      title="Waitlisted Clients"
      :count="waitlisted.length"
      :trend-count="waitlisted.length - priorWaitlistCount"
      color="error"
      icon="mdi-clock-alert-outline"
      :compact="true"
      :expanded="false"
      @toggle="openDrawer('waitlist')"
    />
  </v-col>

  <!-- Side drawer (Vuetify teleports it to app root) -->
  <ActionDetailDrawer
    v-model="drawerOpen"
    :type="activePanel"
    :not-contacted="notContacted"
    :medicaid-expiring="medicaidExpiring"
    :waitlisted="waitlisted"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Client } from '@/types'
import ActionTile from '@/components/ActionTile.vue'
import ActionDetailDrawer from '@/components/ActionDetailDrawer.vue'

defineProps<{
  notContacted: Client[]
  medicaidExpiring: Client[]
  waitlisted: Client[]
  priorWaitlistCount: number
}>()

type Panel = 'notContacted' | 'medicaid' | 'waitlist' | null
const drawerOpen = ref(false)
const activePanel = ref<Panel>(null)

function openDrawer(panel: Panel) {
  activePanel.value = panel
  drawerOpen.value = true
}
</script>

<style scoped>
/* All table styles now live in ActionDetailDrawer.vue */
</style>
