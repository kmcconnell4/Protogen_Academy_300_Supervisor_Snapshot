<template>
  <v-card class="filters-card mb-6 pa-5" :elevation="0" role="search" aria-label="Dashboard filters">
    <div class="filters-header mb-4">
      <v-icon color="primary" size="18" class="mr-2" aria-hidden="true">mdi-filter-variant</v-icon>
      <span class="filters-label">Filters</span>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        size="small"
        prepend-icon="mdi-refresh"
        @click="$emit('reset')"
        aria-label="Reset all filters to defaults"
        class="reset-btn"
      >
        Reset
      </v-btn>
    </div>

    <v-row dense align="end" :class="{ 'flex-column': mobile }">
      <!-- Neighborhood -->
      <v-col cols="12" sm="6" lg="3">
        <label class="filter-field-label" for="filter-neighborhood">Neighborhood</label>
        <v-select
          id="filter-neighborhood"
          v-model="localFilters.neighborhoods"
          :items="metadata.neighborhoods"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          placeholder="All neighborhoods"
          aria-label="Filter by neighborhood, multiple selection allowed"
          class="filter-select mt-1"
        >
          <template #chip="{ item, props: chipProps }">
            <v-chip v-bind="chipProps" size="small" color="primary" variant="tonal">
              {{ item.title }}
            </v-chip>
          </template>
        </v-select>
      </v-col>

      <!-- Date From -->
      <v-col cols="12" sm="6" lg="2">
        <label class="filter-field-label" for="filter-date-from">From (YYYY-MM)</label>
        <v-text-field
          id="filter-date-from"
          v-model="localFilters.dateRange.start"
          variant="outlined"
          density="compact"
          hide-details
          placeholder="2026-03"
          aria-label="Filter start month in YYYY-MM format"
          class="mt-1"
        />
      </v-col>

      <!-- Date To -->
      <v-col cols="12" sm="6" lg="2">
        <label class="filter-field-label" for="filter-date-to">To (YYYY-MM)</label>
        <v-text-field
          id="filter-date-to"
          v-model="localFilters.dateRange.end"
          variant="outlined"
          density="compact"
          hide-details
          placeholder="2026-04"
          aria-label="Filter end month in YYYY-MM format"
          class="mt-1"
        />
      </v-col>

      <!-- Caseworker -->
      <v-col cols="12" sm="6" lg="3">
        <label class="filter-field-label" for="filter-caseworker">Caseworker</label>
        <v-select
          id="filter-caseworker"
          v-model="localFilters.caseworkers"
          :items="metadata.caseworkers"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          placeholder="All caseworkers"
          aria-label="Filter by caseworker, multiple selection allowed"
          class="filter-select mt-1"
        >
          <template #chip="{ item, props: chipProps }">
            <v-chip v-bind="chipProps" size="small" color="secondary" variant="tonal">
              {{ item.title }}
            </v-chip>
          </template>
        </v-select>
      </v-col>

      <!-- Active filter count badge -->
      <v-col cols="12" lg="2" class="d-flex align-end">
        <div v-if="activeFilterCount > 0" class="filter-active-badge" aria-live="polite">
          <v-icon size="14" class="mr-1">mdi-filter-check</v-icon>
          {{ activeFilterCount }} filter{{ activeFilterCount !== 1 ? 's' : '' }} active
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { DashboardFilters } from '@/types'

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

const { mobile } = useDisplay()

const localFilters = computed({
  get: () => props.filters,
  set: (val: typeof props.filters) => emit('update:filters', val),
})

const activeFilterCount = computed(() => {
  let count = 0
  if (props.filters.neighborhoods.length < props.metadata.neighborhoods.length) count++
  if (props.filters.caseworkers.length < props.metadata.caseworkers.length) count++
  return count
})
</script>

<style scoped>
.filters-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
}

.filters-header {
  display: flex;
  align-items: center;
}

.filters-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #212121;
  opacity: 0.55;
}

.filter-field-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #212121;
  opacity: 0.6;
  display: block;
}

.reset-btn {
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-active-badge {
  display: inline-flex;
  align-items: center;
  background: #e7ffde;
  color: #285707;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
