import {defineField, defineType} from 'sanity'
import {localeString, localeText} from './_localeTypes'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localeText',
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
    },
    prepare({title}: {title: string}) {
      return {title: title || 'Untitled'}
    },
  },
})
