// studio/schemas/_localeTypes.ts
export const localeString = {
  name: 'localeString',
  type: 'object',
  fields: [
    {name: 'en', type: 'string', title: 'English'},
    {name: 'es', type: 'string', title: 'Español'},
  ],
}
export const localeText = {
  name: 'localeText',
  type: 'object',
  fields: [
    {name: 'en', type: 'text', title: 'English'},
    {name: 'es', type: 'text', title: 'Español'},
  ],
}

export const localeBlockContent = {
  name: 'localeBlockContent',
  title: 'Localized Block Content',
  type: 'object',
  fields: [
    {name: 'en', title: 'English', type: 'blockContent'},
    {name: 'es', title: 'Español', type: 'blockContent'},
  ],
}
