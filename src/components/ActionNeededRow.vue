<template>
  <v-col cols="12">
    <div
      class="watchlist-card"
      :class="{ 'watchlist-card--clear': totalCount === 0 }"
    >
      <!-- Header -->
      <div class="watchlist-header">
        <span class="watchlist-header__label">Needs Attention</span>
        <span
          v-if="totalCount > 0"
          class="watchlist-header__badge"
          :aria-label="`${totalCount} items need attention`"
        >{{ totalCount }}</span>
        <span v-else class="watchlist-header__clear">All clear this week</span>
      </div>

      <template v-if="totalCount > 0">
        <!-- Row: Not Contacted -->
        <button
          class="watchlist-row"
          @click="openDrawer('notContacted')"
          :aria-label="`Not contacted in 30+ days: ${notContacted.length} clients. View list.`"
        >
          <span
            class="watchlist-row__count"
            :class="notContacted.length > 0 ? 'count--alert' : 'count--zero'"
            aria-hidden="true"
          >{{ notContacted.length }}</span>
          <div class="watchlist-row__body">
            <span class="watchlist-row__label">Not contacted in 30+ days</span>
            <span v-if="notContacted.length > 0" class="watchlist-row__meta">
              {{ neighborhoodSpread(notContacted) }}
            </span>
          </div>
          <v-icon class="watchlist-row__arrow" size="14" aria-hidden="true">mdi-arrow-right</v-icon>
        </button>

        <div class="watchlist-divider" role="separator" />

        <!-- Row: Medicaid Expiring -->
        <button
          class="watchlist-row"
          @click="openDrawer('medicaid')"
          :aria-label="`Medicaid expiring in 30 days: ${medicaidExpiring.length} clients. View list.`"
        >
          <span
            class="watchlist-row__count"
            :class="medicaidExpiring.length > 0 ? 'count--alert' : 'count--zero'"
            aria-hidden="true"
          >{{ medicaidExpiring.length }}</span>
          <div class="watchlist-row__body">
            <span class="watchlist-row__label">Medicaid expiring in 30 days</span>
            <span v-if="medicaidExpiring.length > 0" class="watchlist-row__meta">
              {{ neighborhoodSpread(medicaidExpiring) }}
            </span>
          </div>
          <v-icon class="watchlist-row__arrow" size="14" aria-hidden="true">mdi-arrow-right</v-icon>
        </button>

        <div class="watchlist-divider" role="separator" />

        <!-- Row: Waitlist -->
        <button
          class="watchlist-row"
          @click="openDrawer('waitlist')"
          :aria-label="`On the waitlist: ${waitlisted.length} clients. ${waitlistTrendLabel}. View list.`"
        >
          <span
            class="watchlist-row__count"
            :class="waitlisted.length > 0 ? 'count--waitlist' : 'count--zero'"
            aria-hidden="true"
          >{{ waitlisted.length }}</span>
          <div class="watchlist-row__body">
            <span class="watchlist-row__label">On the waitlist</span>
            <span
              class="watchlist-row__meta"
              :class="waitlistTrend > 0 ? 'meta--alert' : 'meta--positive'"
            >{{ waitlistTrendLabel }}</span>
          </div>
          <v-icon class="watchlist-row__arrow" size="14" aria-hidden="true">mdi-arrow-right</v-icon>
        </button>
      </template>

      <!-- All-clear: good Monday state -->
      <template v-else>
        <div class="all-clear-body" aria-label="All watchlist categories are clear">
          <div class="all-clear-item">
            <span class="all-clear-check" aria-hidden="true">✓</span>
            <span class="all-clear-text">Contacts up to date</span>
          </div>
          <div class="all-clear-item">
            <span class="all-clear-check" aria-hidden="true">✓</span>
            <span class="all-clear-text">Medicaid coverage current</span>
          </div>
          <div class="all-clear-item">
            <span class="all-clear-check" aria-hidden="true">✓</span>
            <div>
              <span class="all-clear-text">No one waiting</span>
              <span class="all-clear-sub">{{ waitlistTrendLabel }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <DetailDrawer
      v-model="drawerOpen"
      :title="drawerTitle"
      :icon="drawerIcon"
      :rows="drawerClients"
      :columns="drawerColumns"
    />
  </v-col>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Client, DrawerColumn } from '@/types'
import DetailDrawer from '@/components/DetailDrawer.vue'

const props = defineProps<{
  notContacted: Client[]
  medicaidExpiring: Client[]
  waitlisted: Client[]
  priorWaitlistCount: number
  priorMonthLabel: string
}>()

const TODAY = new Date('2026-09-05')

function daysSince(dateStr: string): number {
  return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86_400_000)
}

function daysUntil(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - TODAY.getTime()) / 86_400_000)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
}

function neighborhoodSpread(clients: Client[]): string {
  const hoods = new Set(clients.map((c) => c.neighborhood))
  if (hoods.size === 1) return `in ${[...hoods][0]}`
  return `across ${hoods.size} neighborhoods`
}

const totalCount = computed(
  () =>
    (props.notContacted.length > 0 ? 1 : 0) +
    (props.medicaidExpiring.length > 0 ? 1 : 0) +
    (props.waitlisted.length > 0 ? 1 : 0),
)

const waitlistTrend = computed(() => props.waitlisted.length - props.priorWaitlistCount)

const waitlistTrendLabel = computed(() => {
  const diff = waitlistTrend.value
  if (diff === 0) return `Unchanged vs ${props.priorMonthLabel}`
  const dir = diff > 0 ? '↑' : '↓'
  return `${dir}${Math.abs(diff)} vs ${props.priorMonthLabel}`
})

// ── Drawer state ──────────────────────────────────────────────────────────────
const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerIcon = ref('')
const drawerClients = ref<Client[]>([])
const drawerColumns = ref<DrawerColumn[]>([])

const columnConfigs: Record<string, {
  title: string
  icon: string
  getClients: () => Client[]
  columns: DrawerColumn[]
}> = {
  notContacted: {
    title: 'Not Contacted 30+ Days',
    icon: 'mdi-phone-missed',
    getClients: () => props.notContacted,
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'neighborhood', label: 'Neighborhood' },
      {
        key: 'lastContactDate',
        label: 'Last Contact',
        align: 'right',
        badge: (c) => {
          const d = daysSince(c.lastContactDate)
          const variant = d < 20 ? 'success' : d < 30 ? 'warning' : 'error'
          return { text: `${d}d`, variant }
        },
      },
    ],
  },
  medicaid: {
    title: 'Medicaid Expiring in 30 Days',
    icon: 'mdi-card-account-details-outline',
    getClients: () => props.medicaidExpiring,
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'medicaidExpirationDate', label: 'Expires', format: (c) => formatDate(c.medicaidExpirationDate) },
      {
        key: 'medicaidExpirationDate',
        label: 'Days Left',
        align: 'right',
        badge: (c) => {
          const d = daysUntil(c.medicaidExpirationDate)
          return { text: `${d}d`, variant: d <= 7 ? 'error' : 'warning' }
        },
      },
    ],
  },
  waitlist: {
    title: 'Waitlisted Clients',
    icon: 'mdi-clock-alert-outline',
    getClients: () => props.waitlisted,
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'neighborhood', label: 'Neighborhood' },
      { key: 'careTypeNeeded', label: 'Care Needed' },
      {
        key: 'referralDate',
        label: 'Waiting',
        align: 'right',
        badge: (c) => ({ text: `${daysSince(c.referralDate)}d`, variant: 'warning' }),
      },
    ],
  },
}

function openDrawer(panel: keyof typeof columnConfigs) {
  const config = columnConfigs[panel]
  drawerTitle.value = config.title
  drawerIcon.value = config.icon
  drawerClients.value = config.getClients()
  drawerColumns.value = config.columns
  drawerOpen.value = true
}
</script>

<style scoped>
/* ── Card shell ──────────────────────────────────────────────────────────── */
.watchlist-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  height: 100%;
}

.watchlist-card--clear .watchlist-header {
  background: oklch(97% 0.012 145);
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.watchlist-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.watchlist-header__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #9e9e9e;
  flex: 1;
}

.watchlist-header__badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: oklch(96% 0.02 20);
  color: oklch(42% 0.14 20);
  border-radius: 20px;
  padding: 2px 8px;
  letter-spacing: 0.01em;
}

.watchlist-header__clear {
  font-size: 0.75rem;
  font-weight: 500;
  color: oklch(38% 0.1 145);
}

/* ── Rows ────────────────────────────────────────────────────────────────── */
.watchlist-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.watchlist-row:hover {
  background: oklch(98% 0.01 305);
}

.watchlist-row:focus-visible {
  outline: 2px solid oklch(42% 0.15 305);
  outline-offset: -2px;
}

.watchlist-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 20px;
}

.watchlist-row__count {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  min-width: 2.5rem;
  text-align: right;
  flex-shrink: 0;
}

.count--alert {
  color: oklch(48% 0.18 20);
}

.count--waitlist {
  color: oklch(55% 0.14 65);
}

.count--zero {
  color: #d4d4d4;
}

.watchlist-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.watchlist-row__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #212121;
  line-height: 1.3;
}

.watchlist-row__meta {
  font-size: 0.75rem;
  color: #9e9e9e;
}

.meta--alert {
  color: oklch(48% 0.18 20);
}

.meta--positive {
  color: oklch(38% 0.1 145);
}

.watchlist-row__arrow {
  color: #bdbdbd !important;
  flex-shrink: 0;
  transition: transform 0.12s ease;
}

.watchlist-row:hover .watchlist-row__arrow {
  transform: translateX(2px);
  color: #9e9e9e !important;
}

/* ── All-clear (good Monday) state ──────────────────────────────────────────── */
.all-clear-body {
  padding: 20px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.all-clear-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.all-clear-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: oklch(93% 0.05 145);
  color: oklch(38% 0.12 145);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.65rem;
  font-weight: 800;
}

.all-clear-text {
  font-size: 0.875rem;
  color: oklch(36% 0.1 145);
  font-weight: 500;
  display: block;
}

.all-clear-sub {
  font-size: 0.75rem;
  color: oklch(55% 0.06 145);
  display: block;
  margin-top: 2px;
}
</style>

<style scoped>
/* All table styles now live in ActionDetailDrawer.vue */
</style>
