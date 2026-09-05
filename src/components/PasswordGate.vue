<template>
  <main class="gate-shell">
    <section class="gate-card" aria-labelledby="gate-title">
      <div class="gate-icon" aria-hidden="true">
        <v-icon size="28" color="white">mdi-lock-outline</v-icon>
      </div>
      <p class="gate-kicker">Protogen Academy</p>
      <h1 id="gate-title">Supervisor Snapshot</h1>
      <p class="gate-copy">Enter the access password to view this private case-study prototype.</p>
      <form class="gate-form" @submit.prevent="submitPassword">
        <label class="gate-label" for="access-password">Access password</label>
        <input
          id="access-password"
          ref="passwordInput"
          v-model="password"
          class="gate-input"
          type="password"
          autocomplete="current-password"
          required
          aria-describedby="gate-error"
        />
        <p id="gate-error" class="gate-error" role="alert" aria-live="polite">
          {{ errorMessage }}
        </p>
        <button class="gate-submit" type="submit">
          <span>Continue to dashboard</span>
          <v-icon size="17" aria-hidden="true">mdi-arrow-right</v-icon>
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

const ACCESS_PASSWORD = 'Protogen300!'
const STORAGE_KEY = 'supervisor-snapshot-access'

const emit = defineEmits<{ authenticated: [] }>()
const password = ref('')
const errorMessage = ref('')
const passwordInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  nextTick(() => passwordInput.value?.focus())
})

function submitPassword() {
  if (password.value !== ACCESS_PASSWORD) {
    errorMessage.value = 'That password did not match. Try again.'
    password.value = ''
    nextTick(() => passwordInput.value?.focus())
    return
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, 'granted')
  } catch {
    // The gate still works for the current session if storage is unavailable.
  }
  emit('authenticated')
}
</script>

<style scoped>
.gate-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 15% 10%, rgba(201, 119, 177, 0.16), transparent 32%),
    linear-gradient(135deg, #f7f5f9 0%, #ffffff 52%, #eef5ed 100%);
}

.gate-card {
  width: min(100%, 430px);
  padding: 40px;
  background: #ffffff;
  border: 1px solid #e6e0e8;
  border-radius: 16px;
  box-shadow: 0 18px 48px rgba(50, 31, 57, 0.12);
}

.gate-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  margin-bottom: 28px;
  border-radius: 14px;
  background: var(--color-primary);
}

.gate-kicker {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 2rem;
  line-height: 1.15;
}

.gate-copy {
  margin: 12px 0 28px;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.gate-form {
  display: grid;
  gap: 8px;
}

.gate-label {
  color: var(--color-text-primary);
  font-size: 0.82rem;
  font-weight: 700;
}

.gate-input {
  width: 100%;
  padding: 12px 14px;
  color: var(--color-text-primary);
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font: inherit;
  outline: none;
}

.gate-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(107, 41, 125, 0.18);
}

.gate-error {
  min-height: 20px;
  margin: 2px 0 4px;
  color: #b3261e;
  font-size: 0.8rem;
}

.gate-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 11px 16px;
  color: #ffffff;
  background: var(--color-primary);
  border: 0;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.gate-submit:hover {
  background: #6a0c7d;
  transform: translateY(-1px);
}

.gate-submit:focus-visible {
  outline: 3px solid rgba(107, 41, 125, 0.3);
  outline-offset: 2px;
}

@media (max-width: 520px) {
  .gate-card {
    padding: 28px 24px;
  }
}
</style>
