<template>
  <v-card class="chart-card mb-6" :elevation="0">
    <div class="chart-card__header">
      <div>
        <div class="chart-card__title">Active Caseload per Caseworker</div>
        <div class="chart-card__subtitle">Current active clients assigned to each caseworker</div>
      </div>
      <v-btn
        icon="mdi-download"
        size="small"
        variant="text"
        density="compact"
        aria-label="Download Active Caseload as CSV"
        title="Download as CSV"
        @click="downloadCsv"
      />
    </div>
    <div class="chart-wrap" style="height: 240px">
      <Bar
        class="caseload-canvas"
        :data="chartData"
        :options="chartOptions"
        aria-label="Bar chart: active client caseload per caseworker"
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

const BAR_COLORS = ['#6b297d', '#c977b1', '#5c8ed4', '#f4a261', '#2a9d8f']

const props = defineProps<{
  caseload: Record<string, number>
}>()

const emit = defineEmits<{ 'bar-click': [caseworker: string] }>()

const chartData = computed(() => ({
  labels: Object.keys(props.caseload),
  datasets: [
    {
      label: 'Active Clients',
      data: Object.values(props.caseload),
      backgroundColor: BAR_COLORS,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: BAR_COLORS.map((c) => c + 'cc'),
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  onClick: (_evt: unknown, elements: { index: number }[]) => {
    if (!elements.length) return
    const label = Object.keys(props.caseload)[elements[0].index]
    if (label) emit('bar-click', label)
  },
  onHover: (_evt: unknown, elements: unknown[]) => {
    const canvas = document.querySelector('.caseload-canvas') as HTMLCanvasElement | null
    if (canvas) canvas.style.cursor = elements.length ? 'pointer' : 'default'
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#212121',
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => ` ${ctx.parsed.y ?? 0} active clients`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1, color: '#757575' },
      grid: { color: '#f0f0f0' },
    },
    x: {
      ticks: { color: '#212121', font: { weight: 'bold' as const } },
      grid: { display: false },
    },
  },
}))

const ariaDescription = computed(() =>
  Object.entries(props.caseload)
    .map(([cw, n]) => `${cw}: ${n}`)
    .join(', '),
)

function downloadCsv() {
  const month = new Date().toISOString().slice(0, 7)
  const rows: string[][] = [
    ['Caseworker', 'Active Clients'],
    ...Object.entries(props.caseload).map(([name, count]) => [name, String(count)]),
  ]
  exportCsv(rows, `caseload-by-caseworker_${month}.csv`)
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

.chart-card__legend {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-text {
  font-size: 0.75rem;
  color: #757575;
}

.chart-wrap {
  padding: 4px 16px 20px;
}
</style>
