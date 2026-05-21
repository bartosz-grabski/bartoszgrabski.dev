import { defineField } from 'sanity'

/** Inline object with `en` and `pl` string fields */
export function bilingualField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'en', title: 'English', type: 'string', validation: r => r.required() }),
      defineField({ name: 'pl', title: 'Polski', type: 'string', validation: r => r.required() }),
    ],
  })
}

/** Same but multi-line text */
export function bilingualText(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'en', title: 'English', type: 'text', rows: 3 }),
      defineField({ name: 'pl', title: 'Polski', type: 'text', rows: 3 }),
    ],
  })
}
