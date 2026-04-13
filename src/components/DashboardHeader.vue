<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between flex-wrap gap-2">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">Supervisor Snapshot</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">{{ formattedDateTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const formattedDateTime = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date('2026-04-13'))
})
</script>
