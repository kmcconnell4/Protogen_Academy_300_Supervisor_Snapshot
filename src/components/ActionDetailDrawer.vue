<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="end"
    temporary
    :width="520"
    aria-label="Action detail panel"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- ── Header ── -->
    <div class="drawer-header">
      <div class="drawer-title-group">
        <div class="drawer-accent" :style="{ background: '#e53935' }" />
        <v-icon color="#e53935" size="20" class="mr-2" aria-hidden="true">{{ drawerIcon }}</v-icon>
        <span class="drawer-title">{{ drawerTitle }}</span>
        <v-chip
          class="ms-2"
          color="error"
          size="x-small"
          variant="tonal"
          aria-label="Count"
        >{{ currentCount }}</v-chip>
      </div>
      <v-btn
        icon
        variant="text"
        size="small"
        aria-label="Close panel"
        @click="$emit('update:modelValue', false)"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-divider />

    <!-- ── Body ── -->
    <div class="drawer-body">

      <!-- Not Contacted 30+ -->
      <template v-if="type === 'notContacted'">
        <div class="panel-table-wrap">
          <table class="panel-table" aria-label="Not contacted client list">
            <thead>
              <tr>
                <th scope="col">Client</th>
                <th scope="col">Caseworker</th>
                <th scope="col">Neighborhood</th>
                <th scope="col" class="text-right">Days Since</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(c, i) in notContacted"
                :key="c.clientId"
                :class="{ 'row-alt': i % 2 === 1 }"
              >
                <td class="fw-medium">{{ c.clientName }}</td>
                <td>{{ c.assignedCaseworker }}</td>
                <td>{{ c.neighborhood }}</td>
                <td class="text-right">
                  <span class="days-badge days-badge--error">{{ daysSince(c.lastContactDate) }}d</span>
                </td>
              </tr>
              <tr v-if="notContacted.length === 0">
                <td colspan="4" class="no-data">No clients match this filter.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Medicaid Expiring -->
      <template v-else-if="type === 'medicaid'">
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
              <tr
                v-for="(c, i) in medicaidExpiring"
                :key="c.clientId"
                :class="{ 'row-alt': i % 2 === 1 }"
              >
                <td class="fw-medium">{{ c.clientName }}</td>
                <td>{{ c.assignedCaseworker }}</td>
                <td>{{ formatDate(c.medicaidExpirationDate) }}</td>
                <td class="text-right">
                  <span
                    class="days-badge"
                    :class="daysUntil(c.medicaidExpirationDate) <= 7 ? 'days-badge--error' : 'days-badge--warning'"
                  >{{ daysUntil(c.medicaidExpirationDate) }}d</span>
                </td>
              </tr>
              <tr v-if="medicaidExpiring.length === 0">
                <td colspan="4" class="no-data">No clients match this filter.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Waitlisted -->
      <template v-else-if="type === 'waitlist'">
        <div class="panel-table-wrap">
          <table class="panel-table" aria-label="Waitlisted clients list">
            <thead>
              <tr>
                <th scope="col">Client</th>
                <th scope="col">Neighborhood</th>
                <th scope="col">Care Needed</th>
                <th scope="col" class="text-right">Waiting</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(c, i) in waitlisted"
                :key="c.clientId"
                :class="{ 'row-alt': i % 2 === 1 }"
              >
                <td class="fw-medium">{{ c.clientName }}</td>
                <td>{{ c.neighborhood }}</td>
                <td>{{ c.careTypeNeeded }}</td>
                <td class="text-right">
                  <span class="days-badge days-badge--warning">{{ daysSince(c.referralDate) }}d</span>
                </td>
              </tr>
              <tr v-if="waitlisted.length === 0">
                <td colspan="4" class="no-data">No clients match this filter.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Client } from '@/types'

const props = defineProps<{
  modelValue: boolean
  type: 'notContacted' | 'medicaid' | 'waitlist' | null
  notContacted: Client[]
  medicaidExpiring: Client[]
  waitlisted: Client[]
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()

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

const drawerTitle = computed(() => {
  if (props.type === 'notContacted') return 'Not Contacted 30+ Days'
  if (props.type === 'medicaid') return 'Medicaid Expiring in 30 Days'
  if (props.type === 'waitlist') return 'Waitlisted Clients'
  return ''
})

const drawerIcon = computed(() => {
  if (props.type === 'notContacted') return 'mdi-phone-missed'
  if (props.type === 'medicaid') return 'mdi-card-account-details-outline'
  if (props.type === 'waitlist') return 'mdi-clock-alert-outline'
  return 'mdi-alert-circle'
})

const currentCount = computed(() => {
  if (props.type === 'notContacted') return props.notContacted.length
  if (props.type === 'medicaid') return props.medicaidExpiring.length
  if (props.type === 'waitlist') return props.waitlisted.length
  return 0
})
</script>

<style scoped>
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 14px;
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 1;
}

.drawer-title-group {
  display: flex;
  align-items: center;
  gap: 0;
  min-width: 0;
}

.drawer-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-body {
  padding: 16px 20px 24px;
}

.drawer-desc {
  font-size: 0.8rem;
  color: #212121;
  opacity: 0.6;
  margin-bottom: 12px;
  line-height: 1.4;
}

.panel-table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.panel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.panel-table thead tr {
  background: #f5f5f5;
}

.panel-table th {
  padding: 9px 12px;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #212121;
  opacity: 0.55;
  white-space: nowrap;
}

.panel-table td {
  padding: 9px 12px;
  color: #212121;
  border-bottom: 1px solid #f5f5f5;
  white-space: normal;
  word-break: break-word;
  vertical-align: top;
  line-height: 1.35;
}

.panel-table tbody tr:last-child td {
  border-bottom: none;
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

.no-data {
  text-align: center;
  padding: 20px !important;
  color: #212121;
  opacity: 0.45;
  font-style: italic;
}
</style>
