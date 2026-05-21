import { defineField, defineType } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

export const resumeSchema = defineType({
  name: 'resume',
  title: 'Resume',
  type: 'document',
  fields: [
    defineField({
      name: 'basics',
      title: 'Basics',
      type: 'object',
      fields: [
        defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'url', title: 'Website URL', type: 'url' }),
        bilingualText('summary', 'Summary'),
        defineField({ name: 'image', title: 'Portrait Photo', type: 'image', options: { hotspot: true } }),
        defineField({
          name: 'location',
          title: 'Location',
          type: 'object',
          fields: [
            defineField({ name: 'city', title: 'City', type: 'string' }),
            defineField({ name: 'countryCode', title: 'Country Code', type: 'string' }),
          ],
        }),
        defineField({
          name: 'profiles',
          title: 'Profiles',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'network', title: 'Network', type: 'string' }),
              defineField({ name: 'username', title: 'Username', type: 'string' }),
              defineField({ name: 'url', title: 'URL', type: 'url' }),
            ],
          }],
        }),
      ],
    }),
    defineField({
      name: 'work',
      title: 'Work Experience',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Company', type: 'string', validation: r => r.required() }),
          bilingualField('position', 'Position / Role'),
          defineField({ name: 'startDate', title: 'Start Date (YYYY or YYYY-MM)', type: 'string' }),
          defineField({ name: 'endDate', title: 'End Date (YYYY, YYYY-MM, or "Present")', type: 'string' }),
          bilingualText('summary', 'Summary'),
          defineField({
            name: 'highlights',
            title: 'Highlights',
            type: 'array',
            of: [{
              type: 'object',
              fields: [bilingualField('text', 'Bullet text')],
            }],
          }),
        ],
      }],
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'institution', title: 'Institution', type: 'string' }),
          bilingualField('area', 'Area / Degree title'),
          defineField({ name: 'studyType', title: 'Study Type (BSc / MSc)', type: 'string' }),
          defineField({ name: 'startDate', title: 'Start', type: 'string' }),
          defineField({ name: 'endDate', title: 'End', type: 'string' }),
        ],
      }],
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Category', type: 'string' }),
          defineField({ name: 'keywords', title: 'Keywords', type: 'array', of: [{ type: 'string' }] }),
        ],
      }],
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'language', title: 'Language', type: 'string' }),
          defineField({ name: 'fluency', title: 'Fluency', type: 'string' }),
        ],
      }],
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string' }),
          bilingualText('description', 'Description'),
          defineField({ name: 'roles', title: 'Roles', type: 'array', of: [{ type: 'string' }] }),
          defineField({ name: 'keywords', title: 'Keywords', type: 'array', of: [{ type: 'string' }] }),
          defineField({ name: 'url', title: 'URL', type: 'url' }),
        ],
      }],
    }),
    defineField({
      name: 'speaking',
      title: 'Speaking',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          bilingualField('title', 'Talk Title'),
          defineField({ name: 'venue', title: 'Venue', type: 'string' }),
          defineField({ name: 'year', title: 'Year', type: 'string' }),
        ],
      }],
    }),
  ],
  preview: {
    select: { title: 'basics.name' },
  },
})
