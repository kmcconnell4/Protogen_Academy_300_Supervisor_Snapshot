<template>
  <v-card
    class="action-tile pa-4 cursor-pointer"
    :style="{ borderLeft: `4px solid rgb(var(--v-theme-${color}))` }"
    role="button"
    tabindex="0"
    :aria-expanded="expanded"
    :aria-label="`${title}: ${count} clients. Click to ${expanded ? 'collapse' : 'expand'} list.`"
    @click="$emit('toggle')"
    @keydown.enter="$emit('toggle')"
    @keydown.space.prevent="$emit('toggle')"
  >
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-3">
        <v-icon :color="color" size="28">{{ icon }}</v-icon>
        <div>
          <div class="text-body-2 text-medium-emphasis">{{ title }}</div>
          <div class="text-h3 font-weight-bold" :style="{ color: `rgb(var(--v-theme-${color}))` }">
            {{ count }}
          </div>
          <div v-if="trendCount !== undefined" class="text-caption mt-1">
            <span :class="trendCount <= 0 ? 'text-success' : 'text-error'">
              {{ trendCount > 0 ? '↑' : '↓' }} {{ Math.abs(trendCount) }} vs last month
            </span>
          </div>
        </div>
      </div>
      <v-icon :color="color">{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  count: number
  color: string
  icon: string
  expanded: boolean
  trendCount?: number
}>()

defineEmits<{ toggle: [] }>()
</script>

<style scoped>
.action-tile {
  transition: box-shadow 0.2s ease;
}
.action-tile:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
}
</style>
