<template>
  <v-app>
    <v-main class="bg-background">
      <DashboardView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import DashboardView from '@/views/DashboardView.vue'
</script>

<style>
* {
  font-family: 'Roboto', sans-serif;
  box-sizing: border-box;
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
