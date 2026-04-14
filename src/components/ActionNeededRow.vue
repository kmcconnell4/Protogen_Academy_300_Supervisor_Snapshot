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
  <DetailDrawer
    v-model="drawerOpen"
    :title="drawerTitle"
    :icon="drawerIcon"
    :clients="drawerClients"
    :columns="drawerColumns"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Client, DrawerColumn } from '@/types'
import ActionTile from '@/components/ActionTile.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'

const props = defineProps<{
  notContacted: Client[]
  medicaidExpiring: Client[]
  waitlisted: Client[]
  priorWaitlistCount: number
}>()

const TODAY = new Date('2026-04-14')

function daysSince(dateStr: string): number {
  return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86_400_000)
}

function daysUntil(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - TODAY.getTime()) / 86_400_000)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
}

const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerIcon = ref('')
const drawerClients = ref<Client[]>([])
const drawerColumns = ref<DrawerColumn[]>([])

const columnConfigs: Record<string, { title: string; icon: string; getClients: () => Client[]; columns: DrawerColumn[] }> = {
  notContacted: {
    title: 'Not Contacted 30+ Days',
    icon: 'mdi-phone-missed',
    getClients: () => props.notContacted,
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'neighborhood', label: 'Neighborhood' },
      {
        key: 'lastContactDate',
        label: 'Last Contact',
        align: 'right',
        badge: (c) => {
          const d = daysSince(c.lastContactDate)
          const variant = d < 20 ? 'success' : d < 30 ? 'warning' : 'error'
          return { text: `${d}d`, variant }
        },
      },
    ],
  },
  medicaid: {
    title: 'Medicaid Expiring in 30 Days',
    icon: 'mdi-card-account-details-outline',
    getClients: () => props.medicaidExpiring,
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'medicaidExpirationDate', label: 'Expires', format: (c) => formatDate(c.medicaidExpirationDate) },
      {
        key: 'medicaidExpirationDate',
        label: 'Days Left',
        align: 'right',
        badge: (c) => {
          const d = daysUntil(c.medicaidExpirationDate)
          return { text: `${d}d`, variant: d <= 7 ? 'error' : 'warning' }
        },
      },
    ],
  },
  waitlist: {
    title: 'Waitlisted Clients',
    icon: 'mdi-clock-alert-outline',
    getClients: () => props.waitlisted,
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'neighborhood', label: 'Neighborhood' },
      { key: 'careTypeNeeded', label: 'Care Needed' },
      {
        key: 'referralDate',
        label: 'Waiting',
        align: 'right',
        badge: (c) => ({ text: `${daysSince(c.referralDate)}d`, variant: 'warning' }),
      },
    ],
  },
}

function openDrawer(panel: keyof typeof columnConfigs) {
  const config = columnConfigs[panel]
  drawerTitle.value = config.title
  drawerIcon.value = config.icon
  drawerClients.value = config.getClients()
  drawerColumns.value = config.columns
  drawerOpen.value = true
}
</script>

<style scoped>
/* All table styles now live in ActionDetailDrawer.vue */
</style>
