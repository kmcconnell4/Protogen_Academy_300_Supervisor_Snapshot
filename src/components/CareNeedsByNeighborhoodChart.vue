<template>
  <v-card class="pa-4 fill-height">
    <div class="text-h6 font-weight-semibold mb-4">Care Needs by Neighborhood</div>
    <Bar
      :data="chartData"
      :options="chartOptions"
      aria-label="Stacked bar chart showing care type needs broken down by neighborhood"
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
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const CARE_COLORS = [
  '#6b297d',
  '#c977b1',
  '#5c8ed4',
  '#f4a261',
  '#2a9d8f',
]

const props = defineProps<{
  data: Record<string, Record<string, number>>
  careTypes: string[]
}>()

const chartData = computed(() => ({
  labels: Object.keys(props.data),
  datasets: props.careTypes.map((ct, i) => ({
    label: ct,
    data: Object.values(props.data).map((n) => n[ct] ?? 0),
    backgroundColor: CARE_COLORS[i % CARE_COLORS.length],
    borderRadius: 2,
  })),
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true },
  },
}
</script>
