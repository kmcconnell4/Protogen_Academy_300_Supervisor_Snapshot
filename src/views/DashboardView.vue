<template>
  <v-container fluid class="pa-4 pa-md-6">
    <!-- Header -->
    <DashboardHeader />

    <!-- Global Filters -->
    <GlobalFilters
      v-model:filters="filters"
      :metadata="data.metadata"
      @reset="resetFilters"
    />

    <!-- 🔴 Action Needed Row -->
    <ActionNeededRow
      :not-contacted="notContactedIn30Days"
      :medicaid-expiring="medicaidExpiringIn30Days"
      :waitlisted="waitlistedClients"
      :prior-waitlist-count="data.priorMonthSnapshot.waitlistCount"
    />

    <!-- 🟡🟢 Summary Row -->
    <SummaryRow
      :total-active="totalActiveCount"
      :avg-days-to-appt="avgDaysToFirstAppointment"
      :new-referrals="newReferralsThisMonth"
      :prior-active="data.priorMonthSnapshot.totalActiveClients"
      :prior-avg-days="data.priorMonthSnapshot.avgDaysToFirstAppointment"
      :prior-referrals="data.priorMonthSnapshot.newReferrals"
    />

    <!-- 🟡 Caseload Bar Chart -->
    <CaseloadChart :caseload="caseloadPerCaseworker" />

    <!-- 2-col row: Referrals by Neighborhood + Care Needs -->
    <v-row>
      <v-col cols="12" md="4">
        <ReferralsByNeighborhoodChart :data="referralsByNeighborhood" />
      </v-col>
      <v-col cols="12" md="8">
        <CareNeedsByNeighborhoodChart :data="careNeedsByNeighborhood" :care-types="data.metadata.careTypes" />
      </v-col>
    </v-row>

    <!-- Sites/Providers Chart -->
    <SitesChart :data="sitesByIndividualsServed" />
  </v-container>
</template>

<script setup lang="ts">
import { useDashboardData } from '@/composables/useDashboardData'
import DashboardHeader from '@/components/DashboardHeader.vue'
import GlobalFilters from '@/components/GlobalFilters.vue'
import ActionNeededRow from '@/components/ActionNeededRow.vue'
import SummaryRow from '@/components/SummaryRow.vue'
import CaseloadChart from '@/components/CaseloadChart.vue'
import ReferralsByNeighborhoodChart from '@/components/ReferralsByNeighborhoodChart.vue'
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
