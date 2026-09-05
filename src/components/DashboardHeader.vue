<template>
  <header class="dashboard-header mb-6" role="banner">
    <div class="header-inner">
      <div class="header-brand">
        <div class="header-icon-wrap" aria-hidden="true">
          <v-icon size="32" color="white">mdi-medical-bag</v-icon>
        </div>
        <div>
          <h1 class="header-title">Supervisor Snapshot</h1>
          <p class="header-subtitle">Philadelphia Community Mental Health</p>
        </div>
      </div>
      <div class="header-meta" aria-label="Snapshot refresh time">
        <span class="header-date-chip">September 5, 2026</span>
        <span class="header-time-chip">Last refreshed 8:30 AM</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.dashboard-header {
  background: var(--color-primary);
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
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
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  gap: 10px;
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
