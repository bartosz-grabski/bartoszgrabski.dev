import { defineField, defineType } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

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
        defineField({
          name: 'links',
          title: 'Buttons',
          description: 'Drag to reorder. Internal pages use a path (/contact, /cv); external links a full URL (https://…, mailto:…, tel:…).',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                bilingualField('label', 'Label'),
                defineField({
                  name: 'url',
                  title: 'URL or internal path',
                  type: 'string',
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: 'style',
                  title: 'Style',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Default (outline)', value: 'default' },
                      { title: 'Light (filled accent)', value: 'light' },
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'default',
                }),
              ],
              preview: { select: { title: 'label.en', subtitle: 'url' } },
            },
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Services' }),
  },
})
