<template>
  <v-container fluid class="dashboard-container pa-4 pa-md-6 pa-lg-8">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <DashboardHeader />

    <!-- ── Global Filters ─────────────────────────────────────────────── -->
    <GlobalFilters
      v-model:filters="filters"
      :metadata="data.metadata"
      @reset="resetFilters"
      @export="exportFilteredData"
    />
    <!-- ── Error state ──────────────────────────────────────────────── -->
    <div v-if="error" class="error-banner" role="alert" aria-live="assertive">
      <v-icon color="error" size="20" aria-hidden="true">mdi-alert-circle-outline</v-icon>
      <div>
        <div class="error-banner__title">Unable to load dashboard data</div>
        <div class="error-banner__message">{{ error }}</div>
      </div>
    </div>
    <!-- ── Overview: Map + At a Glance ────────────────────────────────── -->
    <section aria-labelledby="overview-heading" class="mb-8">
      <h2 id="overview-heading" class="section-label mb-3">Overview</h2>
      <v-row align="stretch">
        <v-col cols="12" md="7">
          <PhillyNeighborhoodMap
            :data="referralsByNeighborhood"
            @neighborhood-click="onNeighborhoodClick"
          />
        </v-col>
        <v-col cols="12" md="5">
          <v-row>
            <ActionNeededRow
              :not-contacted="notContactedIn30Days"
              :medicaid-expiring="medicaidExpiringIn30Days"
              :waitlisted="waitlistedClients"
              :prior-waitlist-count="data.priorMonthSnapshot.waitlistCount"
              :prior-month-label="priorMonthLabel"
            />
            <SummaryRow
              :total-active="totalActiveCount"
              :avg-days-to-appt="avgDaysToFirstAppointment"
              :new-referrals="newReferralsThisMonth"
              :prior-active="data.priorMonthSnapshot.totalActiveClients"
              :prior-avg-days="data.priorMonthSnapshot.avgDaysToFirstAppointment"
              :prior-referrals="data.priorMonthSnapshot.newReferrals"
              :prior-month-label="priorMonthLabel"
              :longest-wait-neighborhood="longestWaitNeighborhood"
              @total-active-click="onTotalActiveClick"
              @avg-days-click="onAvgDaysClick"
              @new-referrals-click="onNewReferralsClick"
            />
          </v-row>
        </v-col>
      </v-row>
    </section>

    <!-- ── 🟡 Caseload Chart ───────────────────────────────────────────── -->
    <section aria-labelledby="caseload-heading" class="mb-8">
      <h2 id="caseload-heading" class="section-label mb-3">Team Capacity</h2>
      <CaseloadChart
        :caseload="caseloadPerCaseworker"
        @bar-click="onCaseworkerClick"
      />
    </section>

    <!-- ── Care Needs by Neighborhood ─────────────────────────────────── -->
    <section aria-labelledby="care-needs-heading" class="mb-8">
      <h2 id="care-needs-heading" class="section-label mb-3">Care Needs by Neighborhood</h2>
      <CareNeedsByNeighborhoodChart
        :data="careNeedsByNeighborhood"
        :care-types="data.metadata.careTypes"
        @bar-click="onCareNeedsClick"
      />
    </section>

    <!-- ── Sites Chart ────────────────────────────────────────────────── -->
    <section aria-labelledby="sites-heading" class="mb-8">
      <h2 id="sites-heading" class="section-label mb-3">Sites &amp; Providers</h2>
      <SitesChart
        :data="sitesByIndividualsServed"
        @bar-click="onSiteClick"
      />
    </section>

    <!-- ── Chart detail drawer ────────────────────────────────────────── -->
    <DetailDrawer
      v-model="chartDrawerOpen"
      :title="chartDrawerTitle"
      :icon="chartDrawerIcon"
      :rows="chartDrawerRows"
      :columns="chartDrawerColumns"
      accent-color="#6b297d"
      chip-color="primary"
    />
  </v-container>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useDashboardData } from '@/composables/useDashboardData'
import type { DrawerColumn } from '@/types'
import { exportCsv } from '@/utils/exportCsv'
import DashboardHeader from '@/components/DashboardHeader.vue'
import GlobalFilters from '@/components/GlobalFilters.vue'
import ActionNeededRow from '@/components/ActionNeededRow.vue'
import SummaryRow from '@/components/SummaryRow.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'

const CaseloadChart = defineAsyncComponent(() => import('@/components/CaseloadChart.vue'))
const PhillyNeighborhoodMap = defineAsyncComponent(() => import('@/components/PhillyNeighborhoodMap.vue'))
const CareNeedsByNeighborhoodChart = defineAsyncComponent(() => import('@/components/CareNeedsByNeighborhoodChart.vue'))
const SitesChart = defineAsyncComponent(() => import('@/components/SitesChart.vue'))

const {
  data,
  filters,
  resetFilters,
  filteredClients,
  activeClients,
  waitlistedClients,
  notContactedIn30Days,
  medicaidExpiringIn30Days,
  totalActiveCount,
  avgDaysToFirstAppointment,
  newReferralsThisMonth,
  newReferralsThisMonthClients,
  caseloadPerCaseworker,
  referralsByNeighborhood,
  sitesByIndividualsServed,
  careNeedsByNeighborhood,
  longestWaitNeighborhood,
  avgWaitBySite,
  priorMonthLabel,
  error,
} = useDashboardData()

// ── Chart drill-down drawer state ─────────────────────────────────────────────
const chartDrawerOpen = ref(false)
const chartDrawerTitle = ref('')
const chartDrawerIcon = ref('mdi-chart-bar')
const chartDrawerRows = ref<any[]>([])
const chartDrawerColumns = ref<DrawerColumn[]>([])

const TODAY = new Date('2026-09-05')

function daysSince(dateStr: string): number {
  return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86_400_000)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
}

function exportFilteredData() {
  const rows: string[][] = [
    [
      'Client ID',
      'Client Name',
      'Caseworker',
      'Site',
      'Neighborhood',
      'Referral Source',
      'Referral Date',
      'First Appointment Date',
      'Care Type Needed',
      'Status',
      'Last Contact Date',
      'Medicaid Expiration Date',
      'Provider Name',
    ],
    ...filteredClients.value.map((client) => [
      client.clientId,
      client.clientName,
      client.assignedCaseworker,
      client.site,
      client.neighborhood,
      client.referralSource,
      client.referralDate,
      client.firstAppointmentDate ?? '',
      client.careTypeNeeded,
      client.clientStatus,
      client.lastContactDate,
      client.medicaidExpirationDate,
      client.providerName,
    ]),
  ]
  const { start, end } = filters.value.dateRange
  exportCsv(rows, `supervisor-snapshot_${start}_${end}.csv`)
}

function openChartDrawer(config: {
  title: string
  icon: string
  rows: any[]
  columns: DrawerColumn[]
}) {
  chartDrawerTitle.value = config.title
  chartDrawerIcon.value = config.icon
  chartDrawerRows.value = config.rows
  chartDrawerColumns.value = config.columns
  chartDrawerOpen.value = true
}

function onCaseworkerClick(caseworker: string) {
  openChartDrawer({
    title: `${caseworker}'s Caseload`,
    icon: 'mdi-account-group',
    rows: filteredClients.value.filter(
      (c) => c.clientStatus === 'active' && c.assignedCaseworker === caseworker,
    ),
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'neighborhood', label: 'Neighborhood' },
      { key: 'careTypeNeeded', label: 'Care Needed' },
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
  })
}

function onSiteClick(site: string) {
  openChartDrawer({
    title: site,
    icon: 'mdi-hospital-building',
    rows: filteredClients.value.filter((c) => c.site === site),
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'careTypeNeeded', label: 'Care Needed' },
      { key: 'clientStatus', label: 'Status', format: (c) => c.clientStatus.charAt(0).toUpperCase() + c.clientStatus.slice(1) },
    ],
  })
}

function onCareNeedsClick({ neighborhood, careType }: { neighborhood: string; careType: string }) {
  openChartDrawer({
    title: `${careType} — ${neighborhood}`,
    icon: 'mdi-heart-pulse',
    rows: filteredClients.value.filter(
      (c) => c.neighborhood === neighborhood && c.careTypeNeeded === careType,
    ),
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'clientStatus', label: 'Status', format: (c) => c.clientStatus.charAt(0).toUpperCase() + c.clientStatus.slice(1) },
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
  })
}

function onNeighborhoodClick(neighborhood: string) {
  openChartDrawer({
    title: `${neighborhood}`,
    icon: 'mdi-map-marker',
    rows: filteredClients.value.filter((c) => c.neighborhood === neighborhood),
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'careTypeNeeded', label: 'Care Needed' },
      { key: 'referralDate', label: 'Referral Date', format: (c) => formatDate(c.referralDate) },
    ],
  })
}

function onTotalActiveClick() {
  openChartDrawer({
    title: 'Total Individuals Actively Served',
    icon: 'mdi-account-group',
    rows: activeClients.value,
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
  })
}

function onNewReferralsClick() {
  openChartDrawer({
    title: 'New Referrals This Month',
    icon: 'mdi-account-plus',
    rows: newReferralsThisMonthClients.value,
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'neighborhood', label: 'Neighborhood' },
      { key: 'careTypeNeeded', label: 'Care Needed' },
    ],
  })
}

function onAvgDaysClick() {
  openChartDrawer({
    title: 'Wait Times by Site',
    icon: 'mdi-clock-outline',
    rows: avgWaitBySite.value,
    columns: [
      { key: 'name', label: 'Site' },
      { key: 'address', label: 'Address' },
      { key: 'neighborhood', label: 'Neighborhood' },
      {
        key: 'avgDays',
        label: 'Avg Wait',
        align: 'right',
        badge: (row) => {
          const days = row.avgDays as number | null
          if (days === null) return null
          const variant = days <= 7 ? 'success' : days <= 14 ? 'warning' : 'error'
          return { text: `${days}d`, variant }
        },
      },
    ],
  })
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: oklch(45% 0.008 305);
}

.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  background: oklch(97% 0.015 20);
  border: 1px solid oklch(88% 0.04 20);
  border-radius: 10px;
  margin-bottom: 16px;
}

.error-banner__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: oklch(40% 0.14 20);
}

.error-banner__message {
  font-size: 0.8rem;
  color: oklch(50% 0.08 20);
  margin-top: 2px;
}

</style>
