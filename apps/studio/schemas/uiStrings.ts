import { defineField, defineType } from 'sanity'
import { bilingualField, bilingualText } from './helpers'

/**
 * Every UI label on the site, bilingual. One field per string the frontend
 * renders — grouped to mirror where they appear. Fields documented with
 * {placeholders} are templates the frontend fills in at render time.
 */
export const uiStringsSchema = defineType({
  name: 'uiStrings',
  title: 'UI Labels',
  type: 'document',
  fields: [
    defineField({
      name: 'tabs',
      title: 'Navigation tabs',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('services', 'Services tab'),
        bilingualField('cv', 'CV tab'),
        bilingualField('now', 'Now tab'),
        bilingualField('contact', 'Contact tab'),
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Theme toggle',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('light', 'Light theme label'),
        bilingualField('dark', 'Dark theme label'),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Section headings',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('about', 'About'),
        bilingualField('skills', 'Skills'),
        bilingualField('education', 'Education'),
        bilingualField('speaking', 'Speaking'),
        bilingualField('languages', 'Languages'),
        bilingualField('experience', 'Experience'),
        bilingualField('now', 'Now'),
        bilingualField('building', 'Building'),
        bilingualField('learning', 'Learning'),
        bilingualField('reading', 'Reading'),
        bilingualField('around', 'Around'),
        bilingualField('channels', 'Channels'),
        bilingualField('form', 'Message form'),
      ],
    }),
    bilingualText('nowIntro', 'Now page intro'),
    bilingualField('nowAsOf', 'Now "as of" line — use {date} for the date'),
    defineField({
      name: 'channels',
      title: 'Contact channel labels',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('email', 'Email'),
        bilingualField('github', 'GitHub'),
        bilingualField('linkedin', 'LinkedIn'),
        bilingualField('calendar', 'Book a call'),
      ],
    }),
    defineField({
      name: 'contactForm',
      title: 'Contact form',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('name', 'Name field label'),
        bilingualField('email', 'Email field label'),
        bilingualField('phone', 'Phone field label'),
        bilingualField('message', 'Message field label'),
        bilingualField('submit', 'Submit button'),
        bilingualField('sending', 'Sending state label'),
        bilingualText('rodo', 'RODO / data-use note'),
        bilingualText('consent', 'Consent checkbox label'),
        defineField({
          name: 'errors',
          title: 'Validation & error messages',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            bilingualField('name', 'Missing name'),
            bilingualField('emailRequired', 'Missing email'),
            bilingualField('emailInvalid', 'Invalid email'),
            bilingualField('message', 'Missing message'),
            bilingualField('consent', 'Missing consent'),
            bilingualField('invalid_payload', 'Server: invalid payload'),
            bilingualField('turnstile_failed', 'Server: verification failed'),
            bilingualText('send_failed', 'Server: send failed'),
          ],
        }),
      ],
    }),
    defineField({
      name: 'buttons',
      title: 'CV export buttons',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('json', 'Download JSON'),
        bilingualField('pdf', 'Download PDF'),
      ],
    }),
    defineField({
      name: 'toasts',
      title: 'Toasts',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('json', 'JSON downloaded'),
        bilingualField('contactSent', 'Message sent'),
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('copy', 'Copyright line — use {year} and {name}'),
        bilingualField('built', 'Built-by line'),
      ],
    }),
    bilingualField('atSep', 'Role/company separator (e.g. " at " / " w ")'),
    defineField({
      name: 'langLevels',
      title: 'Language fluency labels',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        bilingualField('native', 'Native'),
        bilingualField('fluent', 'Fluent'),
        bilingualField('intermediate', 'Intermediate'),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'UI Labels' }),
  },
})
