<template>
  <div
    class="action-tile"
    :class="{ 'action-tile--expanded': expanded }"
    role="button"
    tabindex="0"
    :aria-expanded="expanded"
    :aria-label="`${title}: ${count} clients. ${expanded ? 'Collapse' : 'Expand'} list.`"
    @click="$emit('toggle')"
    @keydown.enter.prevent="$emit('toggle')"
    @keydown.space.prevent="$emit('toggle')"
  >
    <!-- Accent bar -->
    <div class="action-tile__accent" :style="{ background: accentColor }" />

    <div class="action-tile__body">
      <!-- Icon circle -->
      <div class="action-tile__icon-wrap" :style="{ background: iconBg }">
        <v-icon :color="accentColor" size="22" aria-hidden="true">{{ icon }}</v-icon>
      </div>

      <div class="action-tile__content">
        <div class="action-tile__label">{{ title }}</div>
        <div class="action-tile__count" :style="{ color: accentColor }">{{ count }}</div>

        <div v-if="trendCount !== undefined" class="action-tile__trend">
          <span :class="trendCount <= 0 ? 'trend--positive' : 'trend--negative'">
            {{ trendCount > 0 ? '↑' : '↓' }}
            {{ Math.abs(trendCount) }} vs last month
          </span>
        </div>
      </div>

      <div class="action-tile__chevron">
        <v-icon size="20" :color="accentColor" aria-hidden="true">
          {{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  count: number
  color: string
  icon: string
  expanded: boolean
  trendCount?: number
}>()

defineEmits<{ toggle: [] }>()

// Map Vuetify color tokens to actual hex for inline styles
const COLOR_MAP: Record<string, string> = {
  error: '#e53935',
  warning: '#f9a825',
  success: '#285707',
  primary: '#6b297d',
}

const accentColor = computed(() => COLOR_MAP[props.color] ?? props.color)
const iconBg = computed(() => `${accentColor.value}18`) // 10% opacity
</script>

<style scoped>
.action-tile {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.15s ease;
  position: relative;
  outline: none;
  user-select: none;
}

.action-tile:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.11);
  transform: translateY(-1px);
}

.action-tile:focus-visible {
  box-shadow: 0 0 0 3px rgba(107, 41, 125, 0.4);
}

.action-tile--expanded {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-tile__accent {
  height: 4px;
  width: 100%;
}

.action-tile__body {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 20px 20px 20px;
}

.action-tile__icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-tile__content {
  flex: 1;
  min-width: 0;
}

.action-tile__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #212121;
  opacity: 0.65;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-tile__count {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.action-tile__trend {
  font-size: 0.75rem;
  margin-top: 2px;
}

.action-tile__chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.trend--positive {
  color: #285707;
  font-weight: 600;
}

.trend--negative {
  color: #e53935;
  font-weight: 600;
}
</style>
