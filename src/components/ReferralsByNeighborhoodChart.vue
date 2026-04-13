<template>
  <v-card class="pa-4 fill-height">
    <div class="text-h6 font-weight-semibold mb-4">Referrals by Neighborhood</div>
    <Bar
      :data="chartData"
      :options="chartOptions"
      aria-label="Horizontal bar chart showing total referrals by neighborhood"
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
  data: Record<string, number>
}>()

const chartData = computed(() => ({
  labels: Object.keys(props.data),
  datasets: [
    {
      label: 'Referrals',
      data: Object.values(props.data),
      backgroundColor: '#6b297d',
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
        label: (ctx: TooltipItem<'bar'>) => ` ${ctx.parsed.x ?? 0} referrals`,
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
