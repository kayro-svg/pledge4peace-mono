export default {
  name: 'brevoForm',
  title: 'Brevo Form',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Internal name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'html',
      title: 'Form HTML',
      type: 'text',
      rows: 20,
      description: 'Insert the HTML code of the form (without <style>, <link> or <script>).',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'height',
      title: 'Iframe height (px)',
      type: 'number',
      initialValue: 1100,
    },
  ],
  preview: {select: {title: 'title'}},
}
