<template>
  <v-card class="chart-card fill-height" :elevation="0">
    <div class="chart-card__header">
      <div>
        <div class="chart-card__title">Care Needs by Neighborhood</div>
        <div class="chart-card__subtitle">All care types across filtered neighborhoods</div>
      </div>
    </div>
    <div class="chart-wrap" style="height: 280px">
      <Bar
        :data="chartData"
        :options="chartOptions"
        aria-label="Stacked bar chart: care type needs broken down by neighborhood"
        role="img"
      />
    </div>
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

const CARE_COLORS = ['#6b297d', '#5c8ed4', '#2a9d8f', '#f4a261', '#c977b1']

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
    hoverBackgroundColor: CARE_COLORS[i % CARE_COLORS.length] + 'cc',
    borderRadius: 2,
  })),
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 14,
        font: { size: 11 },
        color: '#212121',
      },
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: '#212121',
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      stacked: true,
      ticks: { color: '#212121', font: { size: 11 } },
      grid: { display: false },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { stepSize: 1, color: '#757575' },
      grid: { color: '#f0f0f0' },
    },
  },
}
</script>

<style scoped>
.chart-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.chart-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #212121;
}

.chart-card__subtitle {
  font-size: 0.75rem;
  color: #757575;
  margin-top: 2px;
}

.chart-wrap {
  padding: 4px 16px 20px;
}
</style>
