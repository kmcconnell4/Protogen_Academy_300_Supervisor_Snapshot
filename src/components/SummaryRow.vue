<template>
  <v-row class="mb-6">
    <v-col cols="12" sm="4">
      <MetricTile
        label="Total Individuals Actively Served"
        :value="totalActive"
        :prior-value="priorActive"
        color="success"
        icon="mdi-account-group"
        aria-label="Total individuals actively served with trend"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <MetricTile
        label="Avg Days: Referral to First Appt"
        :value="avgDaysToAppt"
        :prior-value="priorAvgDays"
        :lower-is-better="true"
        color="secondary"
        suffix="days"
        icon="mdi-calendar-check"
        aria-label="Average days from referral to first appointment with trend"
      />
    </v-col>
    <v-col cols="12" sm="4">
      <MetricTile
        label="New Referrals This Month"
        :value="newReferrals"
        :prior-value="priorReferrals"
        color="warning"
        icon="mdi-account-plus"
        aria-label="New referrals this month compared to prior month"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import MetricTile from '@/components/MetricTile.vue'

defineProps<{
  totalActive: number
  avgDaysToAppt: number
  newReferrals: number
  priorActive: number
  priorAvgDays: number
  priorReferrals: number
}>()
</script>
