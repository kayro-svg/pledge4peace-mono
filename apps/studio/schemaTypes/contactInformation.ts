import {localeString, localeText} from './_localeTypes'

export default {
  name: 'contactInformation',
  title: 'Contact Information',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      description:
        'A name to identify this contact information (e.g., "Main Office", "General Contact")',
      validation: (rule: {required: () => any}) => rule.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Contact email address',
      validation: (rule: {email: () => any}) => rule.email(),
    },
    {
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'Contact phone number',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string',
      description: 'Physical address',
    },
    {
      name: 'socialMedia',
      title: 'Social Media',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Twitter', value: 'twitter'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'TikTok', value: 'tiktok'},
                ],
              },
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule: {required: () => any}) => rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'platform',
              subtitle: 'url',
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'email',
    },
    prepare({title}: {title: string}) {
      return {title: title || 'Untitled'}
    },
  },
}
