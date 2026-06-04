import { defineField, defineType } from 'sanity'
import { bilingualField } from './helpers'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    bilingualField('availabilityLabel', 'Availability label (e.g. "Open for work")'),
    defineField({ name: 'calendarUrl', title: 'Book a call URL (cal.com)', type: 'url' }),
  ],
  // Singleton document
  preview: {
    select: { title: 'availabilityLabel.en' },
  },
})
