import { defineField, defineType } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

export const nowSchema = defineType({
  name: 'now',
  title: 'Now',
  type: 'document',
  fields: [
    defineField({
      name: 'asOf',
      title: 'As of (display string, e.g. "May 2026")',
      type: 'object',
      fields: [
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'pl', title: 'Polski', type: 'string' }),
      ],
    }),
    defineField({
      name: 'building',
      title: 'Building',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          bilingualField('title', 'Title'),
          bilingualText('blurb', 'Blurb'),
        ],
      }],
    }),
    defineField({
      name: 'learning',
      title: 'Learning',
      type: 'array',
      of: [{ type: 'object', fields: [bilingualField('item', 'Item')] }],
    }),
    defineField({
      name: 'reading',
      title: 'Reading (fallback when Goodreads proxy unavailable)',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Book Title', type: 'string' }),
          defineField({ name: 'author', title: 'Author', type: 'string' }),
        ],
      }],
    }),
    defineField({
      name: 'around',
      title: 'Around',
      type: 'array',
      of: [{ type: 'object', fields: [bilingualField('item', 'Item')] }],
    }),
  ],
  // Singleton document — only one 'now' should ever exist
  preview: {
    select: { title: 'asOf.en' },
  },
})
