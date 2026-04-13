<template>
  <div class="mb-6">
    <v-row>
      <!-- ── Not Contacted 30+ ───────────────────────────────────────── -->
      <v-col cols="12" md="4">
        <ActionTile
          title="Not Contacted 30+ Days"
          :count="notContacted.length"
          color="error"
          icon="mdi-phone-missed"
          :expanded="openPanel === 'notContacted'"
          @toggle="togglePanel('notContacted')"
        />
        <v-expand-transition>
          <div v-if="openPanel === 'notContacted'" class="expandable-panel" role="region" aria-label="Clients not contacted in 30+ days">
            <div class="panel-header">
              <v-icon size="14" color="error" class="mr-1" aria-hidden="true">mdi-information-outline</v-icon>
              {{ notContacted.length }} client{{ notContacted.length !== 1 ? 's' : '' }} requiring follow-up
            </div>
            <div class="panel-table-wrap">
              <table class="panel-table" aria-label="Not contacted client list">
                <thead>
                  <tr>
                    <th scope="col">Client</th>
                    <th scope="col">Caseworker</th>
                    <th scope="col">Last Contact</th>
                    <th scope="col">Neighborhood</th>
                    <th scope="col" class="text-right">Days Since</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(c, i) in notContacted" :key="c.clientId" :class="{ 'row-alt': i % 2 === 1 }">
                    <td class="fw-medium">{{ c.clientName }}</td>
                    <td>{{ c.assignedCaseworker }}</td>
                    <td>{{ formatDate(c.lastContactDate) }}</td>
                    <td>{{ c.neighborhood }}</td>
                    <td class="text-right">
                      <span class="days-badge days-badge--error">{{ daysSince(c.lastContactDate) }}d</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </v-expand-transition>
      </v-col>

      <!-- ── Medicaid Expiring ───────────────────────────────────────── -->
      <v-col cols="12" md="4">
        <ActionTile
          title="Medicaid Expiring in 30 Days"
          :count="medicaidExpiring.length"
          color="error"
          icon="mdi-card-account-details-outline"
          :expanded="openPanel === 'medicaid'"
          @toggle="togglePanel('medicaid')"
        />
        <v-expand-transition>
          <div v-if="openPanel === 'medicaid'" class="expandable-panel" role="region" aria-label="Clients with Medicaid expiring soon">
            <div class="panel-header">
              <v-icon size="14" color="error" class="mr-1" aria-hidden="true">mdi-information-outline</v-icon>
              {{ medicaidExpiring.length }} client{{ medicaidExpiring.length !== 1 ? 's' : '' }} need renewal action
            </div>
            <div class="panel-table-wrap">
              <table class="panel-table" aria-label="Medicaid expiring client list">
                <thead>
                  <tr>
                    <th scope="col">Client</th>
                    <th scope="col">Caseworker</th>
                    <th scope="col">Expires</th>
                    <th scope="col" class="text-right">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(c, i) in medicaidExpiring" :key="c.clientId" :class="{ 'row-alt': i % 2 === 1 }">
                    <td class="fw-medium">{{ c.clientName }}</td>
                    <td>{{ c.assignedCaseworker }}</td>
                    <td>{{ formatDate(c.medicaidExpirationDate) }}</td>
                    <td class="text-right">
                      <span
                        class="days-badge"
                        :class="daysUntil(c.medicaidExpirationDate) <= 7 ? 'days-badge--error' : 'days-badge--warning'"
                      >
                        {{ daysUntil(c.medicaidExpirationDate) }}d
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </v-expand-transition>
      </v-col>

      <!-- ── Waitlist ───────────────────────────────────────────────── -->
      <v-col cols="12" md="4">
        <ActionTile
          title="Waitlisted Clients"
          :count="waitlisted.length"
          :trend-count="waitlisted.length - priorWaitlistCount"
          color="error"
          icon="mdi-clock-alert-outline"
          :expanded="openPanel === 'waitlist'"
          @toggle="togglePanel('waitlist')"
        />
        <v-expand-transition>
          <div v-if="openPanel === 'waitlist'" class="expandable-panel" role="region" aria-label="Waitlisted clients">
            <div class="panel-header">
              <v-icon size="14" color="error" class="mr-1" aria-hidden="true">mdi-information-outline</v-icon>
              <strong>{{ waitlisted.length }}</strong>&nbsp;total on waitlist
            </div>
            <div class="panel-table-wrap">
              <table class="panel-table" aria-label="Waitlisted clients list">
                <thead>
                  <tr>
                    <th scope="col">Client</th>
                    <th scope="col">Referred</th>
                    <th scope="col">Neighborhood</th>
                    <th scope="col">Care Needed</th>
                    <th scope="col" class="text-right">Waiting</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(c, i) in waitlisted" :key="c.clientId" :class="{ 'row-alt': i % 2 === 1 }">
                    <td class="fw-medium">{{ c.clientName }}</td>
                    <td>{{ formatDate(c.referralDate) }}</td>
                    <td>{{ c.neighborhood }}</td>
                    <td>{{ c.careTypeNeeded }}</td>
                    <td class="text-right">
                      <span class="days-badge days-badge--warning">{{ daysSince(c.referralDate) }}d</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </v-expand-transition>
      </v-col>
    </v-row>
  </div>
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
  return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86_400_000)
}

function daysUntil(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - TODAY.getTime()) / 86_400_000)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
}

type Panel = 'notContacted' | 'medicaid' | 'waitlist' | null
const openPanel = ref<Panel>(null)

function togglePanel(key: Panel) {
  openPanel.value = openPanel.value === key ? null : key
}
</script>

<style scoped>
.expandable-panel {
  background: #ffffff;
  border-radius: 0 0 12px 12px;
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-top: -4px;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: #fff5f5;
  font-size: 0.75rem;
  color: #c62828;
  font-weight: 500;
  border-bottom: 1px solid #ffcdd2;
}

.panel-table-wrap {
  overflow-x: auto;
  max-height: 380px;
  overflow-y: auto;
}

.panel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.panel-table thead tr {
  background: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
}

.panel-table th {
  padding: 9px 14px;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #212121;
  opacity: 0.55;
  white-space: nowrap;
}

.panel-table td {
  padding: 9px 14px;
  color: #212121;
  border-bottom: 1px solid #f5f5f5;
  white-space: nowrap;
}

.row-alt {
  background: #fafafa;
}

.fw-medium {
  font-weight: 600;
}

.text-right {
  text-align: right !important;
}

.days-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
}

.days-badge--error {
  background: #ffebee;
  color: #c62828;
}

.days-badge--warning {
  background: #fff8e1;
  color: #f57f17;
}
</style>
