// schemaTypes/conference.ts
export default {
  name: 'conference',
  title: 'Conferences',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Conference Title',
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
      name: 'date',
      title: 'Conference Date',
      type: 'date',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'time',
      title: 'Conference Time',
      type: 'string',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Physical location or "Online" for virtual conferences',
    },
    {
      name: 'image',
      title: 'Conference Banner',
      type: 'image',
      options: {hotspot: true},
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'about',
      title: 'About Conference',
      type: 'text',
      rows: 6,
    },
    {
      name: 'registrationLink',
      title: 'Registration Link',
      type: 'url',
    },
    {
      name: 'speakers',
      title: 'Speakers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Speaker Name',
              type: 'string',
            },
            {
              name: 'role',
              title: 'Role/Title',
              type: 'string',
            },
            {
              name: 'bio',
              title: 'Short Bio',
              type: 'text',
              rows: 3,
            },
            {
              name: 'image',
              title: 'Speaker Photo',
              type: 'image',
            },
          ],
        },
      ],
    },
    {
      name: 'gallery',
      title: 'Conference Images',
      type: 'array',
      of: [{type: 'image'}],
    },
    {
      name: 'relatedCampaign',
      title: 'Related Campaign',
      type: 'reference',
      to: [{type: 'campaign'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
      media: 'image',
    },
    prepare({title, subtitle, media}: {title: string; subtitle: string; media: any}) {
      const formattedDate = subtitle
        ? new Date(subtitle).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : ''

      return {
        title,
        subtitle: formattedDate,
        media,
      }
    },
  },
}
