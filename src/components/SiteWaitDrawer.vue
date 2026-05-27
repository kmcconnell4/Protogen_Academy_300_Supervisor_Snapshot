<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="end"
    temporary
    :width="580"
    aria-label="Wait times by site panel"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- ── Header ── -->
    <div class="drawer-header">
      <div class="drawer-title-group">
        <v-icon color="#6b297d" size="20" class="mr-2" aria-hidden="true">mdi-clock-outline</v-icon>
        <span class="drawer-title">Wait Times by Site</span>
        <v-chip
          class="ms-2"
          size="x-small"
          variant="tonal"
          color="primary"
          aria-label="Site count"
        >{{ sites.length }}</v-chip>
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
        <table class="panel-table" aria-label="Average wait time by site, sorted by shortest wait">
          <thead>
            <tr>
              <th
                scope="col"
                class="sortable-th"
                @click="setSort('name')"
              >Site <span class="sort-icon" aria-hidden="true">{{ sortIcon('name') }}</span></th>
              <th
                scope="col"
                class="sortable-th col-address"
                @click="setSort('address')"
              >Address <span class="sort-icon" aria-hidden="true">{{ sortIcon('address') }}</span></th>
              <th
                scope="col"
                class="sortable-th"
                @click="setSort('neighborhood')"
              >Neighborhood <span class="sort-icon" aria-hidden="true">{{ sortIcon('neighborhood') }}</span></th>
              <th
                scope="col"
                class="sortable-th text-right"
                @click="setSort('avgDays')"
              >Avg Wait <span class="sort-icon" aria-hidden="true">{{ sortIcon('avgDays') }}</span></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(site, i) in pagedSites"
              :key="site.name"
              :class="{ 'row-alt': i % 2 === 1 }"
            >
              <td class="fw-medium">{{ site.name }}</td>
              <td class="text-muted">{{ site.address }}</td>
              <td>{{ site.neighborhood }}</td>
              <td class="text-right">
                <span
                  v-if="site.avgDays !== null"
                  class="days-badge"
                  :class="badgeClass(site.avgDays)"
                >{{ site.avgDays }}d</span>
                <span v-else class="no-appt">—</span>
              </td>
            </tr>
            <tr v-if="sites.length === 0">
              <td colspan="4" class="empty-state">No site data available for the current filter selection.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Pagination ── -->
    <div v-if="pageCount > 1" class="drawer-pagination">
      <v-pagination
        v-model="page"
        :length="pageCount"
        size="small"
        density="compact"
        aria-label="Site list pagination"
      />
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SiteWaitRow } from '@/types'

const props = defineProps<{
  modelValue: boolean
  sites: SiteWaitRow[]
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const PAGE_SIZE = 10

const sortKey = ref<keyof SiteWaitRow>('avgDays')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)

// Reset to default sort when drawer opens
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      sortKey.value = 'avgDays'
      sortDir.value = 'asc'
      page.value = 1
    }
  },
)

function setSort(key: keyof SiteWaitRow): void {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  page.value = 1
}

function sortIcon(key: string): string {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const sortedSites = computed(() =>
  [...props.sites].sort((a, b) => {
    const key = sortKey.value
    const aVal = a[key]
    const bVal = b[key]
    // Nulls always sort last regardless of direction
    if (aVal === null && bVal === null) return 0
    if (aVal === null) return 1
    if (bVal === null) return -1
    const dir = sortDir.value === 'asc' ? 1 : -1
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir
    return String(aVal).localeCompare(String(bVal)) * dir
  }),
)

const pageCount = computed(() => Math.ceil(props.sites.length / PAGE_SIZE))

const pagedSites = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return sortedSites.value.slice(start, start + PAGE_SIZE)
})

function badgeClass(days: number): string {
  if (days <= 7) return 'days-badge--success'
  if (days <= 14) return 'days-badge--warning'
  return 'days-badge--error'
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
  padding: 0 20px 20px;
  overflow-y: auto;
}

.panel-table-wrap {
  overflow-x: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-top: 16px;
}

.panel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.panel-table thead tr {
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

.sortable-th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  color: #757575;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.sortable-th:hover {
  background: #f5f5f5;
}

.col-address {
  width: 36%;
}

.panel-table tbody tr {
  border-bottom: 1px solid #f5f5f5;
}

.panel-table tbody tr:last-child {
  border-bottom: none;
}

.panel-table td {
  padding: 10px 12px;
  color: #424242;
  vertical-align: middle;
}

.row-alt {
  background: #fafafa;
}

.text-right {
  text-align: right;
}

.fw-medium {
  font-weight: 600;
  color: #212121;
}

.text-muted {
  color: #9e9e9e;
  font-size: 0.78rem;
}

.sort-icon {
  opacity: 0.5;
  font-size: 0.7rem;
}

.empty-state,
.no-appt {
  color: #bdbdbd;
}

.empty-state {
  text-align: center;
  padding: 24px;
  font-style: italic;
}

.days-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 600;
}

.days-badge--success {
  background: oklch(93% 0.05 145);
  color: oklch(35% 0.12 145);
}

.days-badge--warning {
  background: oklch(93% 0.06 85);
  color: oklch(40% 0.1 60);
}

.days-badge--error {
  background: oklch(93% 0.04 20);
  color: oklch(40% 0.12 20);
}

.drawer-pagination {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
</style>
