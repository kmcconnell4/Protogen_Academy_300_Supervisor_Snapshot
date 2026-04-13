<template>
  <v-card class="mb-6 pa-4">
    <div class="text-h6 font-weight-semibold mb-4">Active Caseload per Caseworker</div>
    <Bar
      :data="chartData"
      :options="chartOptions"
      aria-label="Bar chart showing active client caseload per caseworker"
      role="img"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  caseload: Record<string, number>
}>()

const chartData = computed(() => ({
  labels: Object.keys(props.caseload),
  datasets: [
    {
      label: 'Active Clients',
      data: Object.values(props.caseload),
      backgroundColor: [
        '#6b297d',
        '#c977b1',
        '#5c8ed4',
        '#f4a261',
        '#2a9d8f',
      ],
      borderRadius: 6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => ` ${ctx.parsed.y ?? 0} active clients`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
}
</script>
