import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { theme } from './theme'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'supervisorLight',
    themes: {
      supervisorLight: theme,
    },
  },
  defaults: {
    VCard: {
      rounded: 'lg',
      elevation: 2,
    },
    VBtn: {
      rounded: 'md',
    },
  },
})
