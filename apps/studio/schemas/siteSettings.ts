import { defineField, defineType, type Rule } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

const CHANNEL_TYPES = ['linkedin', 'github'] as const

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    bilingualField('availabilityLabel', 'Availability label (e.g. "Open for work")'),
    defineField({ name: 'calendarUrl', title: 'Book a call URL (cal.com)', type: 'url' }),
    defineField({
      name: 'contact',
      title: 'Contact',
      description: 'The statement shown on the Contact tab',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('heading', 'Heading — wrap the emphasised word in *asterisks*, e.g. "Let\'s *talk*."'),
        bilingualText('availabilityLine', 'Availability line — use {availability} where the availability label should appear'),
        bilingualText('bookingLine', 'Booking line'),
        bilingualField('signature', 'Signature — use {name} for the first name, e.g. "— {name}"'),
      ],
    }),
    defineField({
      name: 'channels',
      title: 'Social channels',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'type',
              title: 'Channel',
              type: 'string',
              options: {
                list: CHANNEL_TYPES.map(t => ({ title: t.charAt(0).toUpperCase() + t.slice(1), value: t })),
                layout: 'radio',
              },
              validation: (Rule: Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Profile URL',
              type: 'url',
              validation: (Rule: Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'type', subtitle: 'url' },
            prepare: ({ title, subtitle }: { title: string; subtitle: string }) => ({
              title: title?.charAt(0).toUpperCase() + title?.slice(1),
              subtitle,
            }),
          },
        },
      ],
      validation: (Rule: Rule) =>
        Rule.max(2).custom((channels: Array<{ type: string }> | undefined) => {
          if (!channels || channels.length === 0) return true
          const types = channels.map(c => c.type).filter(Boolean)
          const unique = new Set(types)
          if (unique.size !== types.length) return 'Each channel type can only appear once'
          return true
        }),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
