<template>
  <v-card class="chart-card fill-height" :elevation="0">
    <div class="chart-card__header">
      <div class="chart-card__title">Referrals by Neighborhood</div>
      <div class="chart-card__subtitle">All referral statuses</div>
    </div>
    <div class="chart-wrap" style="height: 280px">
      <Bar
        :data="chartData"
        :options="chartOptions"
        aria-label="Horizontal bar chart: total referrals by neighborhood"
        role="img"
        :aria-description="ariaDescription"
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
  type TooltipItem,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: Record<string, number>
}>()

const emit = defineEmits<{ 'bar-click': [neighborhood: string] }>()

const sortedEntries = computed(() =>
  Object.entries(props.data).sort((a, b) => b[1] - a[1]),
)

const chartData = computed(() => ({
  labels: sortedEntries.value.map(([n]) => n),
  datasets: [
    {
      label: 'Referrals',
      data: sortedEntries.value.map(([, v]) => v),
      backgroundColor: '#6b297d',
      hoverBackgroundColor: '#6a0c7d',
      borderRadius: 4,
    },
  ],
}))

const chartOptions = computed(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  onClick: (_evt: unknown, elements: { index: number }[]) => {
    if (!elements.length) return
    const neighborhood = sortedEntries.value[elements[0].index]?.[0]
    if (neighborhood) emit('bar-click', neighborhood)
  },
  onHover: (_evt: unknown, elements: unknown[], chart: { canvas: HTMLCanvasElement }) => {
    chart.canvas.style.cursor = elements.length ? 'pointer' : 'default'
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#212121',
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => ` ${ctx.parsed.x ?? 0} referrals`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { stepSize: 1, color: '#757575' },
      grid: { color: '#f0f0f0' },
    },
    y: {
      ticks: { color: '#212121', font: { size: 11 } },
      grid: { display: false },
    },
  },
}))

const ariaDescription = computed(() =>
  sortedEntries.value.map(([n, v]) => `${n}: ${v}`).join(', '),
)
</script>

<style scoped>
.chart-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.chart-card__header {
  padding: 20px 22px 12px;
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
