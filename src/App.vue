<template>
  <v-app>
    <v-main class="bg-background">
      <PasswordGate v-if="!authenticated" @authenticated="authenticated = true" />
      <DashboardView v-else />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardView from '@/views/DashboardView.vue'
import PasswordGate from '@/components/PasswordGate.vue'

const STORAGE_KEY = 'supervisor-snapshot-access'

const authenticated = ref(false)
try {
  authenticated.value = sessionStorage.getItem(STORAGE_KEY) === 'granted'
} catch {
  authenticated.value = false
}
</script>

<style>
* {
  box-sizing: border-box;
  font-family: inherit;
}

:root {
  font-family: 'DM Sans Variable', 'DM Sans', sans-serif;
  font-variant-numeric: tabular-nums;

  /* Design tokens */
  --color-primary: #6b297d;
  --color-primary-tint: #f8f0fb;
  --color-secondary: #285707;
  --color-secondary-light: #e7ffde;
  --color-text-primary: #212121;
  --color-text-muted: #757575;
  --color-text-subtle: #9e9e9e;
  --color-surface: #ffffff;
  --color-border: #e0e0e0;
  --color-border-subtle: #f0f0f0;
}

/* Override Vuetify's Roboto default */
.v-application {
  font-family: 'DM Sans Variable', 'DM Sans', sans-serif !important;
}

html,
body {
  background-color: oklch(98.5% 0.006 305);
  min-height: 100vh;
}

/* Smooth expand transitions */
.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Clean scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: oklch(98.5% 0.006 305);
}
::-webkit-scrollbar-thumb {
  background: oklch(78% 0.05 305);
  border-radius: 3px;
}

/* Chart canvas max-height */
canvas {
  max-height: 320px;
}
</style>
