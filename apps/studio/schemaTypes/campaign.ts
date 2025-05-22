// schemaTypes/campaign.ts
export default {
  name: 'campaign',
  title: 'Campaigns',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Campaign Title',
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
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Peace', value: 'Peace'},
          {title: 'Democracy', value: 'Democracy'},
          {title: 'Environment', value: 'Environment'},
          {title: 'Education', value: 'Education'},
          {title: 'Health', value: 'Health'},
        ],
      },
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (Rule: any) => Rule.required().max(200),
    },
    {
      name: 'goalPledges',
      title: 'Pledge Goal',
      type: 'number',
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: 'commitmentText',
      title: 'Pledge Commitment Text',
      type: 'text',
      rows: 2,
    },
    {
      name: 'contentText',
      title: 'Main Content',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Content Title',
          type: 'string',
        },
        {
          name: 'paragraphs',
          title: 'Content Paragraphs',
          type: 'array',
          of: [{type: 'text'}],
        },
      ],
    },
    {
      name: 'media',
      title: 'Media Gallery',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Media Type',
              type: 'string',
              options: {list: ['image', 'video']},
            },
            {
              name: 'src',
              title: 'Source URL',
              type: 'string',
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'image',
    },
  },
}
