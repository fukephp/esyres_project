import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

void i18n.use(initReactI18next).init({
  lng: 'bs',
  fallbackLng: 'bs',
  interpolation: { escapeValue: false },
  resources: {
    bs: {
      translation: {
        salon: {
          notFound: 'Salon nije pronađen.',
          hours: 'Radno vrijeme',
          services: 'Usluge',
          closed: 'Zatvoreno',
          break: 'pauza {{start}}–{{end}}',
          emptyServices: 'Nema usluga.',
          duration: '{{n}} min',
          loading: 'Učitavanje…',
          busy: {
            LOW: 'Slobodnije',
            MEDIUM: 'Umjereno',
            HIGH: 'Zauzeto',
          },
        },
        category: {
          HAIR: 'Kosa',
          MAKE_UP: 'Šminka',
          MASSAGE: 'Masaža',
        },
        weekday: {
          MONDAY: 'Ponedjeljak',
          TUESDAY: 'Utorak',
          WEDNESDAY: 'Srijeda',
          THURSDAY: 'Četvrtak',
          FRIDAY: 'Petak',
          SATURDAY: 'Subota',
          SUNDAY: 'Nedjelja',
        },
      },
    },
  },
})

export default i18n
