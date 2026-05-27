import { ref, computed } from 'vue'
import type { DashboardFilters, Neighborhood, Caseworker } from '@/types'
import rawData from '@/data/mockData.json'
import type { MockData } from '@/types'

const data = rawData as MockData

// ─── Default filter values ────────────────────────────────────────────────────
const today = new Date('2026-04-13')

function toYYYYMM(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function defaultDateRange() {
  const end = new Date(today)
  const start = new Date(today)
  start.setFullYear(start.getFullYear() - 1)
  start.setDate(1) // ensure we're at the start of that month
  return { start: toYYYYMM(start), end: toYYYYMM(end) }
}

export function useDashboardData() {
  const filters = ref<DashboardFilters>({
    neighborhoods: [...data.metadata.neighborhoods] as Neighborhood[],
    caseworkers: [...data.metadata.caseworkers] as Caseworker[],
    dateRange: defaultDateRange(),
  })

  function resetFilters() {
    filters.value = {
      neighborhoods: [...data.metadata.neighborhoods] as Neighborhood[],
      caseworkers: [...data.metadata.caseworkers] as Caseworker[],
      dateRange: defaultDateRange(),
    }
  }

  // Apply neighborhood + caseworker + date range (referralDate) filters
  const filteredClients = computed(() => {
    const { start, end } = filters.value.dateRange
    // Treat YYYY-MM range as inclusive: start of start-month to end of end-month
    const startDate = new Date(`${start}-01`)
    const endDate = new Date(`${end}-01`)
    endDate.setMonth(endDate.getMonth() + 1) // first day of month after end
    return data.clients.filter(
      (c) =>
        filters.value.neighborhoods.includes(c.neighborhood) &&
        filters.value.caseworkers.includes(c.assignedCaseworker) &&
        new Date(c.referralDate) >= startDate &&
        new Date(c.referralDate) < endDate,
    )
  })

  const activeClients = computed(() =>
    filteredClients.value.filter((c) => c.clientStatus === 'active'),
  )

  const waitlistedClients = computed(() =>
    filteredClients.value
      .filter((c) => c.clientStatus === 'waitlisted')
      .sort(
        (a, b) =>
          new Date(a.referralDate).getTime() - new Date(b.referralDate).getTime(),
      ),
  )

  // ── Action Needed ────────────────────────────────────────────────────────────

  const notContactedIn30Days = computed(() =>
    activeClients.value
      .filter((c) => {
        const lastContact = new Date(c.lastContactDate)
        const diffMs = today.getTime() - lastContact.getTime()
        return diffMs >= 30 * 24 * 60 * 60 * 1000
      })
      .sort(
        (a, b) =>
          new Date(a.lastContactDate).getTime() -
          new Date(b.lastContactDate).getTime(),
      ),
  )

  const medicaidExpiringIn30Days = computed(() =>
    filteredClients.value
      .filter((c) => {
        if (c.clientStatus === 'closed') return false
        const exp = new Date(c.medicaidExpirationDate)
        const diffMs = exp.getTime() - today.getTime()
        return diffMs >= 0 && diffMs <= 30 * 24 * 60 * 60 * 1000
      })
      .sort(
        (a, b) =>
          new Date(a.medicaidExpirationDate).getTime() -
          new Date(b.medicaidExpirationDate).getTime(),
      ),
  )

  // ── Summary metrics ──────────────────────────────────────────────────────────

  const totalActiveCount = computed(() => activeClients.value.length)

  const avgDaysToFirstAppointment = computed(() => {
    const appointments = filteredClients.value.filter(
      (c) => c.firstAppointmentDate !== null,
    )
    if (appointments.length === 0) return 0
    const total = appointments.reduce((sum, c) => {
      const ref = new Date(c.referralDate)
      const appt = new Date(c.firstAppointmentDate as string)
      return sum + Math.round((appt.getTime() - ref.getTime()) / (24 * 60 * 60 * 1000))
    }, 0)
    return Math.round(total / appointments.length)
  })

  // New referrals this calendar month (April 2026)
  const currentMonthStr = toYYYYMM(today)
  const newReferralsThisMonth = computed(() =>
    filteredClients.value.filter(
      (c) => c.referralDate.startsWith(currentMonthStr),
    ).length,
  )

  const newReferralsThisMonthClients = computed(() =>
    filteredClients.value.filter((c) => c.referralDate.startsWith(currentMonthStr)),
  )

  // ── Chart data helpers ───────────────────────────────────────────────────────

  const caseloadPerCaseworker = computed(() => {
    const map: Record<string, number> = {}
    for (const cw of data.metadata.caseworkers) {
      map[cw] = activeClients.value.filter((c) => c.assignedCaseworker === cw).length
    }
    return map
  })

  const referralsByNeighborhood = computed(() => {
    const map: Record<string, number> = {}
    for (const n of filters.value.neighborhoods) {
      map[n] = filteredClients.value.filter((c) => c.neighborhood === n).length
    }
    return map
  })

  const sitesByIndividualsServed = computed(() => {
    const map: Record<string, number> = {}
    for (const c of activeClients.value) {
      map[c.site] = (map[c.site] ?? 0) + 1
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  })

  const careNeedsByNeighborhood = computed(() => {
    const result: Record<string, Record<string, number>> = {}
    for (const n of filters.value.neighborhoods) {
      result[n] = {}
      for (const ct of data.metadata.careTypes) {
        result[n][ct] = filteredClients.value.filter(
          (c) => c.neighborhood === n && c.careTypeNeeded === ct,
        ).length
      }
    }
    return result
  })

  // ── Geographic context ───────────────────────────────────────────────────────

  const longestWaitNeighborhood = computed((): { name: string; days: number } | null => {
    const byNeighborhood: Record<string, number[]> = {}
    for (const c of filteredClients.value) {
      if (c.firstAppointmentDate) {
        const days = Math.round(
          (new Date(c.firstAppointmentDate).getTime() - new Date(c.referralDate).getTime()) / 86_400_000,
        )
        if (!byNeighborhood[c.neighborhood]) byNeighborhood[c.neighborhood] = []
        byNeighborhood[c.neighborhood].push(days)
      }
    }
    let maxAvg = -Infinity
    let result: { name: string; days: number } | null = null
    for (const [name, daysList] of Object.entries(byNeighborhood)) {
      if (daysList.length === 0) continue
      const avg = Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length)
      if (avg > maxAvg) { maxAvg = avg; result = { name, days: avg } }
    }
    return result
  })

  const priorMonthLabel = computed(() => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - 1)
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d)
  })

  return {
    data,
    filters,
    resetFilters,
    filteredClients,
    activeClients,
    waitlistedClients,
    notContactedIn30Days,
    medicaidExpiringIn30Days,
    totalActiveCount,
    avgDaysToFirstAppointment,
    newReferralsThisMonth,
    newReferralsThisMonthClients,
    caseloadPerCaseworker,
    referralsByNeighborhood,
    sitesByIndividualsServed,
    careNeedsByNeighborhood,
    longestWaitNeighborhood,
    priorMonthLabel,
  }
}
