<template>
  <header class="dashboard-header mb-6" role="banner">
    <div class="header-inner">
      <div class="header-brand">
        <div class="header-icon-wrap" aria-hidden="true">
          <v-icon size="32" color="white">mdi-medical-bag</v-icon>
        </div>
        <div>
          <h1 class="header-title">Supervisor Snapshot</h1>
          <p class="header-subtitle">Philadelphia Community Mental Health — Monday Morning Briefing</p>
        </div>
      </div>
      <div class="header-meta" aria-label="Current date and time">
        <div class="header-date-chip">
          <v-icon size="16" class="mr-1" aria-hidden="true">mdi-calendar-today</v-icon>
          {{ formattedDate }}
        </div>
        <div class="header-time-chip mt-1">
          <v-icon size="14" class="mr-1" aria-hidden="true">mdi-clock-outline</v-icon>
          {{ formattedTime }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Dashboard is pinned to the prototype date
const NOW = new Date('2026-04-13T09:00:00')

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(NOW),
)

const formattedTime = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(NOW),
)
</script>

<style scoped>
.dashboard-header {
  background: linear-gradient(135deg, #6b297d 0%, #6a0c7d 55%, #c977b1 100%);
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 8px 32px rgba(107, 41, 125, 0.22);
  position: relative;
  overflow: hidden;
}

/* Decorative background circles */
.dashboard-header::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}
.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: -60px;
  right: 120px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}

.header-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0;
}

.header-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.76);
  margin: 4px 0 0;
  font-weight: 400;
}

.header-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.header-date-chip,
.header-time-chip {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 0.82rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
  white-space: nowrap;
}

@media (max-width: 600px) {
  .dashboard-header {
    padding: 20px 18px;
  }
  .header-title {
    font-size: 1.35rem;
  }
  .header-meta {
    text-align: left;
    align-items: flex-start;
  }
}
</style>
