export type ClientStatus = 'active' | 'waitlisted' | 'closed'

export type ReferralSource =
  | 'Hospital'
  | 'PCP'
  | 'Self-Referral'
  | 'Crisis Team'
  | 'Court System'

export type CareType =
  | 'Individual Therapy'
  | 'Substance Use Treatment'
  | 'Crisis Stabilization'
  | 'Medication Management'
  | 'Case Management'

export type Neighborhood =
  | 'East Kensington'
  | 'Fishtown - Lower Kensington'
  | 'Feltonville'
  | 'Fairhill'
  | 'North Central'
  | 'Olney'
  | 'Brewerytown'
  | 'Mantua'
  | 'Mill Creek'
  | 'West Powelton'
  | 'Northern Liberties'
  | 'Callowhill'
  | 'Logan Square'
  | 'Bella Vista'
  | 'Newbold'
  | 'Whitman'
  | 'Logan'
  | 'Wister'

export type Caseworker = 'Elly' | 'Orien' | 'Kirsten' | 'Mac' | 'Charlotte'

export interface Client {
  clientId: string
  clientName: string
  assignedCaseworker: Caseworker
  site: string
  neighborhood: Neighborhood
  referralSource: ReferralSource
  referralDate: string        // ISO date string YYYY-MM-DD
  firstAppointmentDate: string | null
  careTypeNeeded: CareType
  clientStatus: ClientStatus
  lastContactDate: string
  medicaidExpirationDate: string
  providerName: string
}

export type BadgeVariant = 'error' | 'warning' | 'success'

export interface DrawerColumn {
  key: keyof Client
  label: string
  align?: 'left' | 'right'
  badge?: (c: Client) => { text: string; variant: BadgeVariant } | null
}

export interface SiteMetadata {
  name: string
  neighborhood: Neighborhood
  caseworkers: Caseworker[]
}

export interface PriorMonthSnapshot {
  month: string
  waitlistCount: number
  newReferrals: number
  totalActiveClients: number
  avgDaysToFirstAppointment: number
}

export interface MockData {
  metadata: {
    generatedDate: string
    description: string
    caseworkers: Caseworker[]
    neighborhoods: Neighborhood[]
    referralSources: ReferralSource[]
    careTypes: CareType[]
    sites: SiteMetadata[]
  }
  priorMonthSnapshot: PriorMonthSnapshot
  clients: Client[]
}

// Filter state shape used across the dashboard
export interface DashboardFilters {
  neighborhoods: Neighborhood[]
  caseworkers: Caseworker[]
  dateRange: {
    start: string  // YYYY-MM (Month/Year)
    end: string    // YYYY-MM
  }
}
