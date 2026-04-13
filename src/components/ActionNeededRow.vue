<template>
  <v-row class="mb-6">
    <!-- Not Contacted 30+ Days -->
    <v-col cols="12" md="4">
      <ActionTile
        title="Not Contacted 30+ Days"
        :count="notContacted.length"
        color="error"
        icon="mdi-phone-off"
        aria-label="Clients not contacted in 30 or more days"
        @toggle="togglePanel('notContacted')"
        :expanded="openPanel === 'notContacted'"
      />
      <v-expand-transition>
        <v-card v-if="openPanel === 'notContacted'" class="mt-1 overflow-auto" max-height="400">
          <v-table density="compact" aria-label="Clients not contacted in 30 or more days list">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Caseworker</th>
                <th>Last Contact</th>
                <th>Neighborhood</th>
                <th>Days Since Contact</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in notContacted" :key="c.clientId" :class="i % 2 === 1 ? 'bg-surface-variant' : ''">
                <td>{{ c.clientName }}</td>
                <td>{{ c.assignedCaseworker }}</td>
                <td>{{ c.lastContactDate }}</td>
                <td>{{ c.neighborhood }}</td>
                <td>{{ daysSince(c.lastContactDate) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-expand-transition>
    </v-col>

    <!-- Medicaid Expiring in 30 Days -->
    <v-col cols="12" md="4">
      <ActionTile
        title="Medicaid Expiring in 30 Days"
        :count="medicaidExpiring.length"
        color="error"
        icon="mdi-card-account-details-outline"
        aria-label="Clients with Medicaid expiring in the next 30 days"
        @toggle="togglePanel('medicaid')"
        :expanded="openPanel === 'medicaid'"
      />
      <v-expand-transition>
        <v-card v-if="openPanel === 'medicaid'" class="mt-1 overflow-auto" max-height="400">
          <v-table density="compact" aria-label="Clients with Medicaid expiring soon list">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Caseworker</th>
                <th>Expiration Date</th>
                <th>Days Until Expiration</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in medicaidExpiring" :key="c.clientId" :class="i % 2 === 1 ? 'bg-surface-variant' : ''">
                <td>{{ c.clientName }}</td>
                <td>{{ c.assignedCaseworker }}</td>
                <td>{{ c.medicaidExpirationDate }}</td>
                <td>{{ daysUntil(c.medicaidExpirationDate) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-expand-transition>
    </v-col>

    <!-- Waitlist -->
    <v-col cols="12" md="4">
      <ActionTile
        title="Waitlisted Clients"
        :count="waitlisted.length"
        :trend-count="waitlisted.length - priorWaitlistCount"
        color="error"
        icon="mdi-clock-outline"
        aria-label="Current waitlist count"
        @toggle="togglePanel('waitlist')"
        :expanded="openPanel === 'waitlist'"
      />
      <v-expand-transition>
        <v-card v-if="openPanel === 'waitlist'" class="mt-1 overflow-auto" max-height="400">
          <div class="px-4 pt-3 text-body-2 text-medium-emphasis">
            Total on waitlist: <strong>{{ waitlisted.length }}</strong>
          </div>
          <v-table density="compact" aria-label="Waitlisted clients list">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Referral Date</th>
                <th>Days Waiting</th>
                <th>Neighborhood</th>
                <th>Care Type Needed</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in waitlisted" :key="c.clientId" :class="i % 2 === 1 ? 'bg-surface-variant' : ''">
                <td>{{ c.clientName }}</td>
                <td>{{ c.referralDate }}</td>
                <td>{{ daysSince(c.referralDate) }}</td>
                <td>{{ c.neighborhood }}</td>
                <td>{{ c.careTypeNeeded }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Client } from '@/types'
import ActionTile from '@/components/ActionTile.vue'

defineProps<{
  notContacted: Client[]
  medicaidExpiring: Client[]
  waitlisted: Client[]
  priorWaitlistCount: number
}>()

const TODAY = new Date('2026-04-13')

function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  return Math.floor((TODAY.getTime() - d.getTime()) / (24 * 60 * 60 * 1000))
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr)
  return Math.floor((d.getTime() - TODAY.getTime()) / (24 * 60 * 60 * 1000))
}

type PanelKey = 'notContacted' | 'medicaid' | 'waitlist' | null
const openPanel = ref<PanelKey>(null)

function togglePanel(key: PanelKey) {
  openPanel.value = openPanel.value === key ? null : key
}
</script>
