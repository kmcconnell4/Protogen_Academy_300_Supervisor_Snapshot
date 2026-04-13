<template>
  <div class="metric-tile" :class="`metric-tile--${color}`">
    <!-- Top accent gradient -->
    <div class="metric-tile__accent" :style="{ background: gradient }" />

    <div class="metric-tile__body">
      <div class="metric-tile__icon-wrap" :style="{ background: iconBg }" aria-hidden="true">
        <v-icon :color="hexColor" size="22">{{ icon }}</v-icon>
      </div>

      <div class="metric-tile__label">{{ label }}</div>

      <div class="metric-tile__value" :style="{ color: hexColor }">
        {{ value }}<span v-if="suffix" class="metric-tile__suffix">{{ suffix }}</span>
      </div>

      <div class="metric-tile__trend" :class="trendClass" :aria-label="`${trendLabel} compared to last month`">
        <span class="trend-arrow">{{ trendArrow }}</span>
        <span class="trend-text">
          {{ Math.abs(change).toFixed(typeof value === 'number' && !Number.isInteger(value) ? 1 : 0) }}
          <span v-if="suffix"> {{ suffix }}</span>
          ({{ Math.abs(changePct).toFixed(1) }}%) vs last month
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number
  priorValue: number
  color: string
  icon: string
  suffix?: string
  lowerIsBetter?: boolean
}>()

const COLOR_MAP: Record<string, { hex: string; gradient: string }> = {
  success: { hex: '#285707', gradient: 'linear-gradient(90deg, #285707 0%, #4caf50 100%)' },
  secondary: { hex: '#285707', gradient: 'linear-gradient(90deg, #5c8ed4 0%, #6b297d 100%)' },
  warning: { hex: '#f57f17', gradient: 'linear-gradient(90deg, #f9a825 0%, #f4a261 100%)' },
  primary: { hex: '#6b297d', gradient: 'linear-gradient(90deg, #6b297d 0%, #c977b1 100%)' },
}

const colorDef = computed(() => COLOR_MAP[props.color] ?? { hex: '#6b297d', gradient: 'linear-gradient(90deg, #6b297d, #c977b1)' })
const hexColor = computed(() => colorDef.value.hex)
const gradient = computed(() => colorDef.value.gradient)
const iconBg = computed(() => `${hexColor.value}14`)

const change = computed(() => props.value - props.priorValue)
const changePct = computed(() => (props.priorValue !== 0 ? (change.value / props.priorValue) * 100 : 0))

const isPositive = computed(() => (props.lowerIsBetter ? change.value <= 0 : change.value >= 0))

const trendArrow = computed(() => (change.value >= 0 ? '↑' : '↓'))
const trendLabel = computed(() => `${trendArrow.value} ${Math.abs(change.value)} ${props.suffix ?? ''}`)
const trendClass = computed(() => (isPositive.value ? 'trend--positive' : 'trend--negative'))
</script>

<style scoped>
.metric-tile {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  height: 100%;
}

.metric-tile__accent {
  height: 4px;
}

.metric-tile__body {
  padding: 20px 22px 22px;
}

.metric-tile__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.metric-tile__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #212121;
  opacity: 0.6;
  line-height: 1.3;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-tile__value {
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.metric-tile__suffix {
  font-size: 1rem;
  font-weight: 500;
  margin-left: 4px;
  opacity: 0.7;
}

.metric-tile__trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}

.trend--positive {
  background: #e7ffde;
  color: #285707;
}

.trend--negative {
  background: #ffebee;
  color: #c62828;
}

.trend-arrow {
  font-size: 0.85rem;
}
</style>
