<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="end"
    temporary
    :width="520"
    aria-label="Detail panel"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- ── Header ── -->
    <div class="drawer-header">
      <div class="drawer-title-group">
        <div class="drawer-accent" :style="{ background: accentColor }" />
        <v-icon :color="accentColor" size="20" class="mr-2" aria-hidden="true">{{ icon }}</v-icon>
        <span class="drawer-title">{{ title }}</span>
        <v-chip
          class="ms-2"
          size="x-small"
          variant="tonal"
          :color="chipColor"
          aria-label="Count"
        >{{ clients.length }}</v-chip>
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
      <div class="panel-table-wrap">
        <table class="panel-table" :aria-label="`${title} client list`">
          <thead>
            <tr>
              <th
                v-for="col in columns"
                :key="String(col.key)"
                scope="col"
                class="sortable-th"
                :class="{ 'text-right': col.align === 'right' }"
                @click="setSort(String(col.key))"
              >
                {{ col.label }} <span class="sort-icon">{{ sortIcon(String(col.key)) }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(c, i) in sortedClients"
              :key="c.clientId"
              :class="{ 'row-alt': i % 2 === 1 }"
            >
              <td
                v-for="col in columns"
                :key="String(col.key)"
                :class="[
                  col.align === 'right' ? 'text-right' : '',
                  col.key === 'clientName' ? 'fw-medium' : '',
                ]"
              >
                <template v-if="cellBadge(col, c) !== null && col.badge">
                  <span
                    class="days-badge"
                    :class="`days-badge--${cellBadge(col, c)!.variant}`"
                  >{{ cellBadge(col, c)!.text }}</span>
                </template>
                <template v-else>{{ c[col.key] ?? '—' }}</template>
              </td>
            </tr>
            <tr v-if="clients.length === 0">
              <td :colspan="columns.length" class="no-data">No clients match this filter.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Client, DrawerColumn } from '@/types'

const props = defineProps<{
  modelValue: boolean
  title: string
  icon: string
  clients: Client[]
  columns: DrawerColumn[]
  accentColor?: string
  chipColor?: string
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const accentColor = computed(() => props.accentColor ?? '#e53935')
const chipColor = computed(() => props.chipColor ?? 'error')

// ── Sorting ──────────────────────────────────────────────────────────────────
const sortKey = ref<string>('')
const sortDir = ref<'asc' | 'desc'>('asc')

watch(
  () => props.clients,
  () => {
    sortKey.value = ''
    sortDir.value = 'asc'
  },
)

function setSort(key: string): void {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function sortIcon(key: string): string {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const sortedClients = computed(() => {
  if (!sortKey.value) return props.clients
  const k = sortKey.value
  return [...props.clients].sort((a, b) => {
    const va = (a as Record<string, unknown>)[k]
    const vb = (b as Record<string, unknown>)[k]
    let cmp = 0
    if (typeof va === 'string' && typeof vb === 'string') {
      cmp = va < vb ? -1 : va > vb ? 1 : 0
    }
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

// ── Cell rendering ────────────────────────────────────────────────────────────
function cellBadge(col: DrawerColumn, c: Client) {
  return col.badge ? col.badge(c) : null
}
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

.days-badge--success {
  background: #e7ffde;
  color: #285707;
}

.sortable-th {
  cursor: pointer;
  user-select: none;
  transition: opacity 0.15s;
}

.sortable-th:hover {
  opacity: 1 !important;
}

.sort-icon {
  font-size: 0.6rem;
  margin-left: 3px;
  opacity: 0.6;
}

.no-data {
  text-align: center;
  padding: 20px !important;
  color: #212121;
  opacity: 0.45;
  font-style: italic;
}
</style>
