import { defineField, defineType } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

/** Inline `{ en, pl }` object for array members (arrays can't hold bare bilingual fields). */
const bilingualMember = {
  type: 'object' as const,
  fields: [
    defineField({ name: 'en', title: 'English', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'pl', title: 'Polski', type: 'string', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'en', subtitle: 'pl' } },
}

export const servicesSchema = defineType({
  name: 'services',
  title: 'Services',
  type: 'document',
  fields: [
    bilingualField('title', 'Page title — shown as "$ <title>" (e.g. "services")'),
    bilingualText('lede', 'Lede — the intro paragraph under the title'),
    defineField({
      name: 'blocks',
      title: 'Service blocks',
      description: 'One panel per service ($ web, $ apps, $ ai, …)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'cmd',
              title: 'Command — short slug shown as "$ <cmd>" in the panel header',
              type: 'string',
              validation: (r) => r.required(),
            }),
            bilingualField('tag', 'Tag — category label on the right of the panel header'),
            bilingualText('blurb', 'Blurb — intro paragraph of the panel'),
            defineField({
              name: 'bullets',
              title: 'Bullets',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [bilingualField('text', 'Bullet')],
                  preview: { select: { title: 'text.en' } },
                },
              ],
            }),
            defineField({
              name: 'stack',
              title: 'Tech chips',
              type: 'array',
              of: [bilingualMember],
            }),
            bilingualField('note', 'Note — small print at the bottom (e.g. "Typical engagement: 2–5 weeks.")'),
          ],
          preview: { select: { title: 'cmd', subtitle: 'tag.en' } },
        },
      ],
    }),
    bilingualField('howHeading', 'Process heading (e.g. "how it runs")'),
    defineField({
      name: 'steps',
      title: 'Process steps',
      description: 'Numbered automatically (01, 02, …) in the order listed here',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            bilingualField('title', 'Step title'),
            bilingualText('text', 'Step description'),
          ],
          preview: { select: { title: 'title.en', subtitle: 'text.en' } },
        },
      ],
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        bilingualField('line', 'Headline — shown as "$ <line>" with a blinking cursor'),
        bilingualText('blurb', 'Blurb under the headline'),
        bilingualField('book', 'Label of the primary "book a call" button'),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Services' }),
  },
})
