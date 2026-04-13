<template>
  <div class="filter-bar mb-6" role="search" aria-label="Dashboard filters">

    <!-- ── Date Range pill ──────────────────────────────────────────── -->
    <v-menu v-model="dateMenuOpen" :close-on-content-click="false" offset="8">
      <template #activator="{ props: menuProps }">
        <button
          class="filter-pill"
          :class="{ 'filter-pill--active': isDateFiltered }"
          v-bind="menuProps"
          aria-label="Filter by date range"
          :aria-expanded="dateMenuOpen"
        >
          <v-icon size="13" class="pill-icon" aria-hidden="true">mdi-calendar-range</v-icon>
          <span class="pill-label">{{ dateRangeLabel }}</span>
          <v-icon size="13" class="pill-caret" aria-hidden="true">mdi-chevron-down</v-icon>
        </button>
      </template>
      <v-card class="filter-dropdown" min-width="260">
        <div class="dropdown-header">Date Range</div>
        <div class="dropdown-body">
          <label class="dropdown-field-label" for="df-start">From (YYYY-MM)</label>
          <input
            id="df-start"
            :value="filters.dateRange.start"
            class="dropdown-input"
            placeholder="2026-03"
            aria-label="Start month filter"
            @input="updateDateStart(($event.target as HTMLInputElement).value)"
          />
          <label class="dropdown-field-label mt-2" for="df-end">To (YYYY-MM)</label>
          <input
            id="df-end"
            :value="filters.dateRange.end"
            class="dropdown-input"
            placeholder="2026-04"
            aria-label="End month filter"
            @input="updateDateEnd(($event.target as HTMLInputElement).value)"
          />
        </div>
      </v-card>
    </v-menu>

    <!-- ── Neighborhood pill ────────────────────────────────────────── -->
    <v-menu v-model="neighborhoodMenuOpen" :close-on-content-click="false" offset="8">
      <template #activator="{ props: menuProps }">
        <button
          class="filter-pill"
          :class="{ 'filter-pill--active': isNeighborhoodFiltered }"
          v-bind="menuProps"
          aria-label="`Filter by neighborhood. Currently: ${neighborhoodLabel}`"
          :aria-expanded="neighborhoodMenuOpen"
        >
          <v-icon size="13" class="pill-icon" aria-hidden="true">mdi-map-marker-outline</v-icon>
          <span class="pill-label">{{ neighborhoodLabel }}</span>
          <v-chip
            v-if="isNeighborhoodFiltered"
            size="x-small"
            color="primary"
            variant="flat"
            class="pill-count"
            aria-hidden="true"
          >{{ filters.neighborhoods.length }}</v-chip>
          <v-icon size="13" class="pill-caret" aria-hidden="true">mdi-chevron-down</v-icon>
        </button>
      </template>
      <v-card class="filter-dropdown" min-width="240">
        <div class="dropdown-header">
          Neighborhood
          <button class="dropdown-select-all" @click="toggleAllNeighborhoods" aria-label="Toggle all neighborhoods">
            {{ allNeighborhoodsSelected ? 'Deselect all' : 'Select all' }}
          </button>
        </div>
        <div class="dropdown-body dropdown-body--list">
          <label
            v-for="n in metadata.neighborhoods"
            :key="n"
            class="dropdown-check-row"
            :for="`dn-${n}`"
          >
            <input
              :id="`dn-${n}`"
              type="checkbox"
              class="dropdown-checkbox"
              :checked="filters.neighborhoods.includes(n as never)"
              @change="toggleNeighborhood(n)"
            />
            <span>{{ n }}</span>
          </label>
        </div>
      </v-card>
    </v-menu>

    <!-- ── Caseworker pill ──────────────────────────────────────────── -->
    <v-menu v-model="caseworkerMenuOpen" :close-on-content-click="false" offset="8">
      <template #activator="{ props: menuProps }">
        <button
          class="filter-pill"
          :class="{ 'filter-pill--active': isCaseworkerFiltered }"
          v-bind="menuProps"
          aria-label="`Filter by caseworker. Currently: ${caseworkerLabel}`"
          :aria-expanded="caseworkerMenuOpen"
        >
          <v-icon size="13" class="pill-icon" aria-hidden="true">mdi-account-outline</v-icon>
          <span class="pill-label">{{ caseworkerLabel }}</span>
          <v-chip
            v-if="isCaseworkerFiltered"
            size="x-small"
            color="secondary"
            variant="flat"
            class="pill-count"
            aria-hidden="true"
          >{{ filters.caseworkers.length }}</v-chip>
          <v-icon size="13" class="pill-caret" aria-hidden="true">mdi-chevron-down</v-icon>
        </button>
      </template>
      <v-card class="filter-dropdown" min-width="200">
        <div class="dropdown-header">
          Caseworker
          <button class="dropdown-select-all" @click="toggleAllCaseworkers" aria-label="Toggle all caseworkers">
            {{ allCaseworkersSelected ? 'Deselect all' : 'Select all' }}
          </button>
        </div>
        <div class="dropdown-body dropdown-body--list">
          <label
            v-for="cw in metadata.caseworkers"
            :key="cw"
            class="dropdown-check-row"
            :for="`dcw-${cw}`"
          >
            <input
              :id="`dcw-${cw}`"
              type="checkbox"
              class="dropdown-checkbox"
              :checked="filters.caseworkers.includes(cw as never)"
              @change="toggleCaseworker(cw)"
            />
            <span>{{ cw }}</span>
          </label>
        </div>
      </v-card>
    </v-menu>

    <!-- ── Reset ─────────────────────────────────────────────────────── -->
    <button
      class="filter-reset"
      @click="$emit('reset')"
      aria-label="Reset all filters to defaults"
    >
      <v-icon size="14" class="mr-1" aria-hidden="true">mdi-refresh</v-icon>
      Reset
    </button>

    <!-- ── Active badge ─────────────────────────────────────────────── -->
    <div v-if="activeFilterCount > 0" class="filter-active-badge" aria-live="polite">
      <v-icon size="12" class="mr-1" aria-hidden="true">mdi-filter-check</v-icon>
      {{ activeFilterCount }} active
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DashboardFilters, Neighborhood, Caseworker } from '@/types'

const props = defineProps<{
  filters: DashboardFilters
  metadata: {
    neighborhoods: string[]
    caseworkers: string[]
  }
}>()

const emit = defineEmits<{
  'update:filters': [value: DashboardFilters]
  reset: []
}>()

// ── Menu open state ──────────────────────────────────────────────────────────
const dateMenuOpen = ref(false)
const neighborhoodMenuOpen = ref(false)
const caseworkerMenuOpen = ref(false)

// ── Helpers to emit partial updates ─────────────────────────────────────────
function patch(partial: Partial<DashboardFilters>) {
  emit('update:filters', { ...props.filters, ...partial })
}

function updateDateStart(val: string) {
  patch({ dateRange: { ...props.filters.dateRange, start: val } })
}
function updateDateEnd(val: string) {
  patch({ dateRange: { ...props.filters.dateRange, end: val } })
}

// ── Neighborhood toggle ──────────────────────────────────────────────────────
function toggleNeighborhood(n: string) {
  const current = props.filters.neighborhoods as string[]
  const next = current.includes(n)
    ? current.filter((x) => x !== n)
    : [...current, n]
  patch({ neighborhoods: next as Neighborhood[] })
}
const allNeighborhoodsSelected = computed(
  () => props.filters.neighborhoods.length === props.metadata.neighborhoods.length,
)
function toggleAllNeighborhoods() {
  patch({
    neighborhoods: allNeighborhoodsSelected.value
      ? []
      : ([...props.metadata.neighborhoods] as Neighborhood[]),
  })
}

// ── Caseworker toggle ────────────────────────────────────────────────────────
function toggleCaseworker(cw: string) {
  const current = props.filters.caseworkers as string[]
  const next = current.includes(cw)
    ? current.filter((x) => x !== cw)
    : [...current, cw]
  patch({ caseworkers: next as Caseworker[] })
}
const allCaseworkersSelected = computed(
  () => props.filters.caseworkers.length === props.metadata.caseworkers.length,
)
function toggleAllCaseworkers() {
  patch({
    caseworkers: allCaseworkersSelected.value
      ? []
      : ([...props.metadata.caseworkers] as Caseworker[]),
  })
}

// ── Label helpers ────────────────────────────────────────────────────────────
const isDateFiltered = computed(() => {
  // Always show as informational — never visually "active" by default
  return false
})

const isNeighborhoodFiltered = computed(
  () => props.filters.neighborhoods.length < props.metadata.neighborhoods.length,
)
const isCaseworkerFiltered = computed(
  () => props.filters.caseworkers.length < props.metadata.caseworkers.length,
)

const dateRangeLabel = computed(() => {
  const { start, end } = props.filters.dateRange
  if (!start && !end) return 'Date range'
  if (start === end || !end) return formatYYYYMM(start)
  return `${formatYYYYMM(start)} – ${formatYYYYMM(end)}`
})

function formatYYYYMM(s: string): string {
  if (!s) return ''
  const [year, month] = s.split('-')
  if (!month) return s
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(month) - 1]} ${year}`
}

const neighborhoodLabel = computed(() => {
  const { neighborhoods } = props.filters
  const total = props.metadata.neighborhoods.length
  if (neighborhoods.length === 0) return 'No neighborhoods'
  if (neighborhoods.length === total) return 'All Neighborhoods'
  if (neighborhoods.length === 1) return neighborhoods[0]
  return `${neighborhoods[0]} +${neighborhoods.length - 1}`
})

const caseworkerLabel = computed(() => {
  const { caseworkers } = props.filters
  const total = props.metadata.caseworkers.length
  if (caseworkers.length === 0) return 'No caseworkers'
  if (caseworkers.length === total) return 'All Caseworkers'
  if (caseworkers.length === 1) return caseworkers[0]
  return caseworkers.slice(0, 2).join(', ') + (caseworkers.length > 2 ? ` +${caseworkers.length - 2}` : '')
})

const activeFilterCount = computed(() => {
  let count = 0
  if (isNeighborhoodFiltered.value) count++
  if (isCaseworkerFiltered.value) count++
  return count
})
</script>

<style scoped>
/* ── Filter bar ─────────────────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* ── Pills ──────────────────────────────────────────────────────────────── */
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #212121;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.filter-pill:hover {
  border-color: #6b297d;
  box-shadow: 0 2px 8px rgba(107, 41, 125, 0.12);
}

.filter-pill:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 41, 125, 0.3);
  border-color: #6b297d;
}

.filter-pill--active {
  background: #f8f0fb;
  border-color: #6b297d;
  color: #6b297d;
}

.pill-icon {
  opacity: 0.55;
  flex-shrink: 0;
}

.pill-label {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pill-count {
  margin-left: 2px;
  font-size: 0.65rem !important;
  height: 16px !important;
  min-width: 16px !important;
}

.pill-caret {
  opacity: 0.45;
  flex-shrink: 0;
}

/* ── Reset button ───────────────────────────────────────────────────────── */
.filter-reset {
  display: inline-flex;
  align-items: center;
  padding: 7px 13px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #6b297d;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
}

.filter-reset:hover {
  background: #f8f0fb;
  border-color: #e0e0e0;
}

.filter-reset:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 41, 125, 0.3);
}

/* ── Active badge ───────────────────────────────────────────────────────── */
.filter-active-badge {
  display: inline-flex;
  align-items: center;
  background: #e7ffde;
  color: #285707;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 600;
}

/* ── Dropdown card ──────────────────────────────────────────────────────── */
.filter-dropdown {
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #212121;
  opacity: 0.55;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-select-all {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b297d;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  text-transform: none;
  letter-spacing: normal;
  opacity: 1;
}

.dropdown-body {
  padding: 12px 16px 14px;
}

.dropdown-body--list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0 8px;
  max-height: 280px;
  overflow-y: auto;
}

.dropdown-field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #757575;
  margin-bottom: 4px;
}

.dropdown-field-label.mt-2 {
  margin-top: 12px;
}

.dropdown-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.82rem;
  font-family: inherit;
  color: #212121;
  outline: none;
  transition: border-color 0.15s ease;
}

.dropdown-input:focus {
  border-color: #6b297d;
  box-shadow: 0 0 0 3px rgba(107, 41, 125, 0.15);
}

.dropdown-check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 0.83rem;
  color: #212121;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.12s ease;
}

.dropdown-check-row:hover {
  background: #f8f0fb;
}

.dropdown-checkbox {
  width: 15px;
  height: 15px;
  accent-color: #6b297d;
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Mobile stack ───────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-pill,
  .filter-reset {
    justify-content: space-between;
    width: 100%;
  }
}
</style>

