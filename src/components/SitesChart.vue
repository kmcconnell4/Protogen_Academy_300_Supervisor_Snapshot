<template>
  <v-card class="mb-6 pa-4">
    <div class="text-h6 font-weight-semibold mb-4">Sites / Providers Serving Most Individuals</div>
    <Bar
      :data="chartData"
      :options="chartOptions"
      aria-label="Horizontal bar chart showing sites and providers serving the most active individuals"
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
  data: [string, number][]
}>()

const chartData = computed(() => ({
  labels: props.data.map(([site]) => site),
  datasets: [
    {
      label: 'Active Individuals',
      data: props.data.map(([, count]) => count),
      backgroundColor: '#5c8ed4',
      borderRadius: 4,
    },
  ],
}))

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => ` ${ctx.parsed.x ?? 0} active individuals`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
}
</script>
