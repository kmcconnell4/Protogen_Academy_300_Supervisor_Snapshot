<template>
  <v-card class="pa-4">
    <div class="d-flex align-center gap-3 mb-3">
      <v-icon :color="color" size="28">{{ icon }}</v-icon>
      <div class="text-body-2 text-medium-emphasis">{{ label }}</div>
    </div>
    <div class="text-h3 font-weight-bold text-on-surface">
      {{ value }}<span v-if="suffix" class="text-h6 font-weight-regular ml-1">{{ suffix }}</span>
    </div>
    <div class="mt-2 text-caption">
      <span :class="trendClass">
        {{ trendArrow }} {{ Math.abs(change) }}{{ suffix ? ' ' + suffix : '' }}
        ({{ Math.abs(changePct).toFixed(1) }}%) vs last month
      </span>
    </div>
  </v-card>
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

const change = computed(() => props.value - props.priorValue)
const changePct = computed(() =>
  props.priorValue !== 0 ? (change.value / props.priorValue) * 100 : 0,
)

const isPositive = computed(() =>
  props.lowerIsBetter ? change.value <= 0 : change.value >= 0,
)

const trendArrow = computed(() => (change.value >= 0 ? '↑' : '↓'))

const trendClass = computed(() =>
  isPositive.value ? 'text-success font-weight-medium' : 'text-error font-weight-medium',
)
</script>
