<template>
  <v-col cols="12">
    <div class="status-strip">
      <!-- Header -->
      <div class="strip-header">
        <span class="strip-header__label">At a Glance</span>
      </div>

      <!-- Total Active -->
      <div
        class="stat-row stat-row--clickable"
        role="button"
        tabindex="0"
        :aria-label="`Active clients: ${totalActive}. ${activeTrendLabel}. Click to view list.`"
        @click="$emit('total-active-click')"
        @keydown.enter.prevent="$emit('total-active-click')"
        @keydown.space.prevent="$emit('total-active-click')"
      >
        <span class="stat-value" aria-hidden="true">{{ totalActive }}</span>
        <div class="stat-body">
          <span class="stat-label">Active clients</span>
          <span
            class="stat-trend"
            :class="activeTrendPositive ? 'trend--up' : 'trend--down'"
          >{{ activeTrendArrow }}{{ Math.abs(totalActive - priorActive) }} vs {{ priorMonthLabel }}</span>
        </div>
        <v-icon class="stat-arrow" size="14" aria-hidden="true">mdi-arrow-right</v-icon>
      </div>

      <div class="stat-divider" role="separator" />

      <!-- Avg Days to Appt -->
      <div
        class="stat-row stat-row--clickable"
        role="button"
        tabindex="0"
        :aria-label="`Average days to first appointment: ${avgDaysToAppt} days. Click to view breakdown by site.`"
        @click="$emit('avg-days-click')"
        @keydown.enter.prevent="$emit('avg-days-click')"
        @keydown.space.prevent="$emit('avg-days-click')"
      >
        <span class="stat-value" aria-hidden="true">
          {{ avgDaysToAppt }}
        </span>
        <div class="stat-body">
          <span class="stat-label">Avg days to first appointment</span>
          <span v-if="longestWaitNeighborhood" class="stat-geo">
            Longest: {{ longestWaitNeighborhood.name }} ({{ longestWaitNeighborhood.days }}d)
          </span>
        </div>
        <v-icon class="stat-arrow" size="14" aria-hidden="true">mdi-arrow-right</v-icon>
      </div>

      <div class="stat-divider" role="separator" />

      <!-- New Referrals -->
      <div
        class="stat-row stat-row--clickable"
        role="button"
        tabindex="0"
        :aria-label="`New referrals this month: ${newReferrals}. ${referralTrendLabel}. Click to view list.`"
        @click="$emit('new-referrals-click')"
        @keydown.enter.prevent="$emit('new-referrals-click')"
        @keydown.space.prevent="$emit('new-referrals-click')"
      >
        <span class="stat-value" aria-hidden="true">{{ newReferrals }}</span>
        <div class="stat-body">
          <span class="stat-label">New referrals this month</span>
          <span
            class="stat-trend"
            :class="referralTrendPositive ? 'trend--up' : 'trend--down'"
          >{{ referralTrendArrow }}{{ Math.abs(newReferrals - priorReferrals) }} vs {{ priorMonthLabel }}</span>
        </div>
        <v-icon class="stat-arrow" size="14" aria-hidden="true">mdi-arrow-right</v-icon>
      </div>
    </div>
  </v-col>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalActive: number
  avgDaysToAppt: number
  newReferrals: number
  priorActive: number
  priorAvgDays: number
  priorReferrals: number
  priorMonthLabel: string
  longestWaitNeighborhood: { name: string; days: number } | null
}>()

defineEmits<{
  'total-active-click': []
  'avg-days-click': []
  'new-referrals-click': []
}>()

const activeTrendPositive = computed(() => props.totalActive >= props.priorActive)
const activeTrendArrow = computed(() => (props.totalActive >= props.priorActive ? '↑' : '↓'))
const activeTrendLabel = computed(
  () => `${activeTrendArrow.value}${Math.abs(props.totalActive - props.priorActive)} vs ${props.priorMonthLabel}`,
)

const referralTrendPositive = computed(() => props.newReferrals >= props.priorReferrals)
const referralTrendArrow = computed(() => (props.newReferrals >= props.priorReferrals ? '↑' : '↓'))
const referralTrendLabel = computed(
  () => `${referralTrendArrow.value}${Math.abs(props.newReferrals - props.priorReferrals)} vs ${props.priorMonthLabel}`,
)

const longestWaitLabel = computed(() =>
  props.longestWaitNeighborhood
    ? `Longest wait: ${props.longestWaitNeighborhood.name} at ${props.longestWaitNeighborhood.days} days`
    : '',
)
</script>

<style scoped>
.status-strip {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  height: 100%;
}

.strip-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.strip-header__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #9e9e9e;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
}

.stat-row--clickable {
  cursor: pointer;
  transition: background 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.stat-row--clickable:hover {
  background: oklch(98% 0.01 305);
}

.stat-row--clickable:focus-visible {
  outline: 2px solid oklch(42% 0.15 305);
  outline-offset: -2px;
}

.stat-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 20px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #212121;
  min-width: 2.5rem;
  text-align: right;
  flex-shrink: 0;
}

.stat-unit {
  font-size: 0.9rem;
  font-weight: 500;
  color: #9e9e9e;
  letter-spacing: 0;
}

.stat-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #212121;
  line-height: 1.3;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-geo {
  font-size: 0.75rem;
  color: #9e9e9e;
}

.trend--up {
  color: oklch(38% 0.1 145);
}

.trend--down {
  color: oklch(48% 0.18 20);
}

.stat-arrow {
  color: #bdbdbd !important;
  flex-shrink: 0;
  transition: transform 0.12s ease;
}

.stat-row--clickable:hover .stat-arrow {
  transform: translateX(2px);
  color: #9e9e9e !important;
}
</style>
