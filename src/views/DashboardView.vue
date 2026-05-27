<template>
  <v-container fluid class="dashboard-container pa-4 pa-md-6 pa-lg-8">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <DashboardHeader />

    <!-- ── Global Filters ─────────────────────────────────────────────── -->
    <GlobalFilters
      v-model:filters="filters"
      :metadata="data.metadata"
      @reset="resetFilters"
    />

    <!-- ── At a Glance (Action Needed + Big Picture combined row) ──────── -->
    <section aria-labelledby="at-a-glance-heading" class="mb-4">
      <h2 id="at-a-glance-heading" class="section-label mb-2">
        <v-icon color="primary" size="18" class="mr-1" aria-hidden="true">mdi-view-dashboard-outline</v-icon>
        Metrics
      </h2>
      <v-row align="stretch">
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
          @new-referrals-click="onNewReferralsClick"
        />
      </v-row>
    </section>

    <!-- ── 🟡 Caseload Chart ───────────────────────────────────────────── -->
    <section aria-labelledby="caseload-heading" class="mb-2">
      <h2 id="caseload-heading" class="section-label mb-3">
        <v-icon color="warning" size="18" class="mr-1">mdi-account-group</v-icon>
        Team Capacity
      </h2>
      <CaseloadChart
        :caseload="caseloadPerCaseworker"
        @bar-click="onCaseworkerClick"
      />
    </section>

    <!-- ── Charts Row ─────────────────────────────────────────────────── -->
    <section aria-labelledby="charts-heading" class="mb-2">
      <h2 id="charts-heading" class="section-label mb-3">
        <v-icon color="primary" size="18" class="mr-1">mdi-chart-bar</v-icon>
        Community Insights
      </h2>
      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <PhillyNeighborhoodMap
            :data="referralsByNeighborhood"
            @neighborhood-click="onNeighborhoodClick"
          />
        </v-col>
        <v-col cols="12" md="8">
          <CareNeedsByNeighborhoodChart
            :data="careNeedsByNeighborhood"
            :care-types="data.metadata.careTypes"
            @bar-click="onCareNeedsClick"
          />
        </v-col>
      </v-row>
    </section>

    <!-- ── Sites Chart ────────────────────────────────────────────────── -->
    <section aria-labelledby="sites-heading" class="mb-6">
      <h2 id="sites-heading" class="section-label mb-3">
        <v-icon color="primary" size="18" class="mr-1">mdi-hospital-building</v-icon>
        Sites &amp; Providers
      </h2>
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
      :clients="chartDrawerClients"
      :columns="chartDrawerColumns"
      accent-color="#6b297d"
      chip-color="primary"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardData } from '@/composables/useDashboardData'
import type { Client, DrawerColumn } from '@/types'
import DashboardHeader from '@/components/DashboardHeader.vue'
import GlobalFilters from '@/components/GlobalFilters.vue'
import ActionNeededRow from '@/components/ActionNeededRow.vue'
import SummaryRow from '@/components/SummaryRow.vue'
import CaseloadChart from '@/components/CaseloadChart.vue'
import PhillyNeighborhoodMap from '@/components/PhillyNeighborhoodMap.vue'
import CareNeedsByNeighborhoodChart from '@/components/CareNeedsByNeighborhoodChart.vue'
import SitesChart from '@/components/SitesChart.vue'
import DetailDrawer from '@/components/DetailDrawer.vue'

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
  priorMonthLabel,
} = useDashboardData()

// ── Chart drill-down drawer state ─────────────────────────────────────────────
const chartDrawerOpen = ref(false)
const chartDrawerTitle = ref('')
const chartDrawerIcon = ref('mdi-chart-bar')
const chartDrawerClients = ref<Client[]>([])
const chartDrawerColumns = ref<DrawerColumn[]>([])

const TODAY = new Date('2026-04-14')

function daysSince(dateStr: string): number {
  return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86_400_000)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
}

function openChartDrawer(config: {
  title: string
  icon: string
  clients: Client[]
  columns: DrawerColumn[]
}) {
  chartDrawerTitle.value = config.title
  chartDrawerIcon.value = config.icon
  chartDrawerClients.value = config.clients
  chartDrawerColumns.value = config.columns
  chartDrawerOpen.value = true
}

function onCaseworkerClick(caseworker: string) {
  openChartDrawer({
    title: `${caseworker}'s Caseload`,
    icon: 'mdi-account-group',
    clients: filteredClients.value.filter(
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
    clients: filteredClients.value.filter((c) => c.site === site),
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
    clients: filteredClients.value.filter(
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
    clients: filteredClients.value.filter((c) => c.neighborhood === neighborhood),
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
    clients: activeClients.value,
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
    clients: newReferralsThisMonthClients.value,
    columns: [
      { key: 'clientName', label: 'Client' },
      { key: 'assignedCaseworker', label: 'Caseworker' },
      { key: 'neighborhood', label: 'Neighborhood' },
      { key: 'careTypeNeeded', label: 'Care Needed' },
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
  color: #212121;
  opacity: 0.5;
  display: flex;
  align-items: center;
}

</style>
