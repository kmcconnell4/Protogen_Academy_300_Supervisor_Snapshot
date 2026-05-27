import type { ThemeDefinition } from 'vuetify'

export const theme: ThemeDefinition = {
  dark: false,
  colors: {
    // Brand primaries
    primary: '#6b297d',
    'primary-darken-1': '#6a0c7d',
    'primary-lighten-1': '#c977b1',

    // Secondary / positive
    secondary: '#285707',
    'secondary-lighten-1': '#e7ffde',

    // Neutrals
    background: '#f7f5f9',
    surface: '#ffffff',
    'on-surface': '#212121',
    'surface-variant': '#f7f5f9',

    // Status
    error: '#e53935',       // 🔴 Action Needed (coral/red)
    warning: '#f9a825',     // 🟡 Team Capacity (amber)
    success: '#285707',     // 🟢 Positive / Big Picture

    // Tertiary chart palette
    'chart-1': '#6b297d', // purple 100
    'chart-2': '#c977b1', // purple 30
    'chart-3': '#285707', // green 100
    'chart-4': '#5c8ed4', // complementary blue
    'chart-5': '#f4a261', // complementary orange
    'chart-6': '#2a9d8f', // complementary teal
  },
}
