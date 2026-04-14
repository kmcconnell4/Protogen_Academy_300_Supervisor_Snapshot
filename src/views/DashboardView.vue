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
        />
        <SummaryRow
          :total-active="totalActiveCount"
          :avg-days-to-appt="avgDaysToFirstAppointment"
          :new-referrals="newReferralsThisMonth"
          :prior-active="data.priorMonthSnapshot.totalActiveClients"
          :prior-avg-days="data.priorMonthSnapshot.avgDaysToFirstAppointment"
          :prior-referrals="data.priorMonthSnapshot.newReferrals"
        />
      </v-row>
    </section>

    <!-- ── 🟡 Caseload Chart ───────────────────────────────────────────── -->
    <section aria-labelledby="caseload-heading" class="mb-2">
      <h2 id="caseload-heading" class="section-label mb-3">
        <v-icon color="warning" size="18" class="mr-1">mdi-account-group</v-icon>
        Team Capacity
      </h2>
      <CaseloadChart :caseload="caseloadPerCaseworker" />
    </section>

    <!-- ── Charts Row ─────────────────────────────────────────────────── -->
    <section aria-labelledby="charts-heading" class="mb-2">
      <h2 id="charts-heading" class="section-label mb-3">
        <v-icon color="primary" size="18" class="mr-1">mdi-chart-bar</v-icon>
        Community Insights
      </h2>
      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <PhillyNeighborhoodMap :data="referralsByNeighborhood" />
        </v-col>
        <v-col cols="12" md="8">
          <CareNeedsByNeighborhoodChart
            :data="careNeedsByNeighborhood"
            :care-types="data.metadata.careTypes"
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
      <SitesChart :data="sitesByIndividualsServed" />
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { useDashboardData } from '@/composables/useDashboardData'
import DashboardHeader from '@/components/DashboardHeader.vue'
import GlobalFilters from '@/components/GlobalFilters.vue'
import ActionNeededRow from '@/components/ActionNeededRow.vue'
import SummaryRow from '@/components/SummaryRow.vue'
import CaseloadChart from '@/components/CaseloadChart.vue'
import PhillyNeighborhoodMap from '@/components/PhillyNeighborhoodMap.vue'
import CareNeedsByNeighborhoodChart from '@/components/CareNeedsByNeighborhoodChart.vue'
import SitesChart from '@/components/SitesChart.vue'

const {
  data,
  filters,
  resetFilters,
  waitlistedClients,
  notContactedIn30Days,
  medicaidExpiringIn30Days,
  totalActiveCount,
  avgDaysToFirstAppointment,
  newReferralsThisMonth,
  caseloadPerCaseworker,
  referralsByNeighborhood,
  sitesByIndividualsServed,
  careNeedsByNeighborhood,
} = useDashboardData()
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
