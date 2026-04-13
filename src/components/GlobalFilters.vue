<template>
  <v-card class="mb-6 pa-4" aria-label="Global dashboard filters">
    <v-row dense align="center">
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="localFilters.neighborhoods"
          :items="metadata.neighborhoods"
          label="Neighborhood"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          aria-label="Filter by neighborhood"
        />
      </v-col>

      <v-col cols="12" sm="6" md="2">
        <v-text-field
          v-model="localFilters.dateRange.start"
          label="From (YYYY-MM)"
          variant="outlined"
          density="compact"
          hide-details
          aria-label="Filter start month"
        />
      </v-col>

      <v-col cols="12" sm="6" md="2">
        <v-text-field
          v-model="localFilters.dateRange.end"
          label="To (YYYY-MM)"
          variant="outlined"
          density="compact"
          hide-details
          aria-label="Filter end month"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="localFilters.caseworkers"
          :items="metadata.caseworkers"
          label="Caseworker"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          aria-label="Filter by caseworker"
        />
      </v-col>

      <v-col cols="12" md="2" class="d-flex justify-end">
        <v-btn
          color="primary"
          variant="tonal"
          @click="$emit('reset')"
          aria-label="Reset all filters to defaults"
        >
          Reset Filters
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const localFilters = computed({
  get: () => props.filters,
  set: (val) => emit('update:filters', val),
})
</script>
