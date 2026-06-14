import { defineField, defineType } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

const MARKDOWN_HINT = 'Supports markdown: **bold**, *italic*, `code`, [links](https://example.com).'

export const nowSchema = defineType({
  name: 'now',
  title: 'Now',
  type: 'document',
  fields: [
    defineField({
      name: 'building',
      title: 'Building',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          bilingualField('title', 'Title'),
          bilingualText('blurb', 'Blurb', MARKDOWN_HINT),
        ],
      }],
    }),
    defineField({
      name: 'learning',
      title: 'Learning',
      type: 'array',
      of: [{ type: 'object', fields: [bilingualField('item', 'Item', MARKDOWN_HINT)] }],
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
      of: [{ type: 'object', fields: [bilingualField('item', 'Item', MARKDOWN_HINT)] }],
    }),
  ],
  // Singleton document — only one 'now' should ever exist
  preview: {
    select: { title: '_updatedAt' },
  },
})
