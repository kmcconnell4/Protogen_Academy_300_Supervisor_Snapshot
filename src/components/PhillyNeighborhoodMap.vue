<template>
  <v-card class="chart-card fill-height" :elevation="0">
    <div class="chart-card__header">
      <div class="chart-card__title">Referrals by Neighborhood</div>
      <div class="chart-card__subtitle">All referral statuses</div>
    </div>
    <div ref="containerRef" class="map-wrap">
      <svg
        v-if="width > 0 && height > 0"
        :width="width"
        :height="height"
        role="img"
        :aria-label="ariaLabel"
      >
        <path
          v-for="feature in coloredFeatures"
          :key="feature.id"
          :d="feature.d"
          :fill="feature.fill"
          stroke="#ffffff"
          stroke-width="0.5"
          class="map-polygon"
          :class="{ 'map-polygon--active': feature.count > 0 }"
          @mousemove="onMouseMove($event, feature)"
          @mouseleave="tooltip = null"
          @click="onNeighborhoodClick(feature)"
        />
      </svg>
      <div
        v-if="tooltip"
        class="map-tooltip"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
        aria-hidden="true"
      >
        <span class="map-tooltip__name">{{ tooltip.name }}</span>
        <span class="map-tooltip__count">{{ tooltip.count }} referral{{ tooltip.count !== 1 ? 's' : '' }}</span>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { geoMercator, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import geoData from '@/data/philly-neighborhoods.json'

const props = defineProps<{
  data: Record<string, number>
}>()

const emit = defineEmits<{ 'neighborhood-click': [neighborhood: string] }>()

// ── Container dimensions ──────────────────────────────────────────────────────
const containerRef = ref<HTMLDivElement | null>(null)
const width = ref(0)
const height = ref(0)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return
  const measure = () => {
    const el = containerRef.value
    if (el) {
      width.value = el.clientWidth
      height.value = el.clientHeight
    }
  }
  measure()
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

// ── Max count for color scale ─────────────────────────────────────────────────
const maxCount = computed(() => {
  const vals = Object.values(props.data)
  return vals.length ? Math.max(...vals) : 1
})

function interpolateColor(t: number): string {
  // #f3e4f7 (light purple) → #6b297d (brand purple)
  const r = Math.round(0xf3 + t * (0x6b - 0xf3))
  const g = Math.round(0xe4 + t * (0x29 - 0xe4))
  const b = Math.round(0xf7 + t * (0x7d - 0xf7))
  return `rgb(${r},${g},${b})`
}

function fillColor(mapname: string): string {
  const count = props.data[mapname] ?? 0
  if (count === 0) return '#e0e0e0'
  const t = maxCount.value > 0 ? count / maxCount.value : 0
  return interpolateColor(t)
}

// ── SVG path generation ───────────────────────────────────────────────────────
const coloredFeatures = computed(() => {
  if (width.value === 0 || height.value === 0) return []

  const projection = geoMercator().fitSize(
    [width.value, height.value],
    geoData as unknown as GeoPermissibleObjects,
  )
  const pathGen = geoPath(projection)

  return (geoData as any).features.map((feature: any, i: number) => {
    const mapname: string = feature.properties.MAPNAME ?? ''
    return {
      id: mapname || i,
      d: pathGen(feature) ?? '',
      fill: fillColor(mapname),
      name: mapname,
      count: props.data[mapname] ?? 0,
    }
  })
})

// ── Tooltip ───────────────────────────────────────────────────────────────────
interface Tooltip { x: number; y: number; name: string; count: number }
const tooltip = ref<Tooltip | null>(null)

function onMouseMove(event: MouseEvent, feature: { name: string; count: number }) {
  const rect = (event.currentTarget as Element).closest('.map-wrap')?.getBoundingClientRect()
  if (!rect) return
  tooltip.value = {
    x: event.clientX - rect.left + 12,
    y: event.clientY - rect.top - 10,
    name: feature.name,
    count: feature.count,
  }
}

function onNeighborhoodClick(feature: { name: string; count: number }) {
  if (feature.name) emit('neighborhood-click', feature.name)
}

// ── Aria label ────────────────────────────────────────────────────────────────
const ariaLabel = computed(() => {
  const entries = Object.entries(props.data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([n, v]) => `${n}: ${v}`)
    .join(', ')
  return `Choropleth map of Philadelphia neighborhoods by referral count. Top neighborhoods: ${entries}`
})
</script>

<style scoped>
.chart-card {
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08) !important;
}

.chart-card__header {
  padding: 16px 16px 8px;
}

.chart-card__title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #212121;
}

.chart-card__subtitle {
  font-size: 0.75rem;
  color: #757575;
  margin-top: 2px;
}

.map-wrap {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.map-polygon {
  cursor: pointer;
  transition: opacity 0.15s;
}

.map-polygon--active {
  cursor: pointer;
}

.map-polygon--active:hover {
  opacity: 0.82;
}

.map-tooltip {
  position: absolute;
  background: #212121;
  color: #ffffff;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.75rem;
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 1px;
  z-index: 10;
  max-width: 200px;
}

.map-tooltip__name {
  font-weight: 600;
}

.map-tooltip__count {
  color: #e0d0ff;
}
</style>
