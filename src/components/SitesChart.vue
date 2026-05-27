<template>
  <v-card class="chart-card mb-6" :elevation="0">
    <div class="chart-card__header">
      <div>
        <div class="chart-card__title">Sites &amp; Providers Serving Most Individuals</div>
        <div class="chart-card__subtitle">Active clients per site</div>
      </div>
      <v-btn
        icon="mdi-download"
        size="small"
        variant="text"
        density="compact"
        aria-label="Download Sites & Providers as CSV"
        title="Download as CSV"
        @click="downloadCsv"
      />
    </div>
    <div class="chart-wrap" :style="{ height: chartHeight }">
      <Bar
        :data="chartData"
        :options="chartOptions"
        aria-label="Horizontal bar chart: sites and providers serving the most active clients"
        role="img"
        :aria-description="ariaDescription"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { exportCsv } from '@/utils/exportCsv'
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

const emit = defineEmits<{ 'bar-click': [site: string] }>()

// Gradient-like color range from primary to teal
const BAR_COLORS = [
  '#6b297d', '#7a3490', '#5c8ed4', '#2a9d8f', '#f4a261',
  '#c977b1', '#6b297d', '#5c8ed4', '#2a9d8f', '#f4a261',
]

const chartData = computed(() => ({
  labels: props.data.map(([site]) => site),
  datasets: [
    {
      label: 'Active Individuals',
      data: props.data.map(([, count]) => count),
      backgroundColor: props.data.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
      hoverBackgroundColor: props.data.map((_, i) => BAR_COLORS[i % BAR_COLORS.length] + 'cc'),
      borderRadius: 5,
    },
  ],
}))

const chartOptions = computed(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  onClick: (_evt: unknown, elements: { index: number }[]) => {
    if (!elements.length) return
    const site = props.data[elements[0].index]?.[0]
    if (site) emit('bar-click', site)
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
        label: (ctx: TooltipItem<'bar'>) => ` ${ctx.parsed.x ?? 0} active individuals`,
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

// Dynamic height based on number of sites
const chartHeight = computed(() => `${Math.max(240, props.data.length * 38)}px`)

const ariaDescription = computed(() =>
  props.data.map(([site, n]) => `${site}: ${n}`).join(', '),
)

function downloadCsv() {
  const month = new Date().toISOString().slice(0, 7)
  const rows: string[][] = [
    ['Site', 'Individuals Served'],
    ...props.data.map(([site, count]) => [site, String(count)]),
  ]
  exportCsv(rows, `sites-providers_${month}.csv`)
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
