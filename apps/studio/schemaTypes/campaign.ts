export default {
  name: 'campaign',
  title: 'Campaigns',
  type: 'document',
  groups: [
    {name: 'main', title: 'Main Info'},
    {name: 'pledge', title: 'Pledge Form'},
    {name: 'solutions', title: 'Solution Proposals'},
    {name: 'support', title: 'Ways to Support'},
  ],
  fields: [
    // MAIN INFO
    // Imagen destacada
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'main',
      description: 'Main image for the campaign (used as cover/thumbnail).',
      options: {hotspot: true},
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'gallery',
      title: 'Gallery (Images & Videos)',
      type: 'array',
      group: 'main',
      description: 'Add images and/or videos that represent this campaign.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Media Type',
              type: 'string',
              options: {list: ['image', 'video']},
              description: 'Select if this is an image or a video.',
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              description: 'Upload an image for this campaign.',
              hidden: ({parent}: {parent: any}) => parent?.type !== 'image',
            },
            {
              name: 'video',
              title: 'Video File',
              type: 'file',
              options: {accept: 'video/*'},
              description: 'Upload a video file for this campaign.',
              hidden: ({parent}: {parent: any}) => parent?.type !== 'video',
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Short description for accessibility.',
            },
          ],
        },
      ],
    },
    {
      name: 'title',
      title: 'Campaign Title',
      type: 'string',
      group: 'main',
      description: 'The main title of the campaign.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      description:
        'Unique URL identifier for this campaign (auto-generated from the title, but you can edit it).',
      options: {source: 'title', maxLength: 96},
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'main',
      description: 'Select the main category for this campaign.',
      options: {
        list: [
          {title: 'Peace', value: 'Peace'},
          {title: 'Democracy', value: 'Democracy'},
          {title: 'Environment', value: 'Environment'},
          {title: 'Education', value: 'Education'},
          {title: 'Health', value: 'Health'},
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'A brief summary of the campaign (max 200 characters).',
      validation: (Rule: any) => Rule.required().max(200),
    },
    {
      name: 'goalPledges',
      title: 'Pledge Goal',
      type: 'number',
      group: 'main',
      description: 'The target number of pledges for this campaign.',
      validation: (Rule: any) => Rule.required().positive(),
    },

    // PLEDGE FORM
    {
      name: 'pledgeCommitmentItems',
      title: 'Pledge Commitment Items',
      type: 'array',
      group: 'pledge',
      description:
        'Checkbox items for the pledge form. Each item will appear as a checkbox for the user to agree to.',
      of: [{type: 'string'}],
    },

    // SOLUTION PROPOSALS
    {
      name: 'solutionsSection',
      title: 'Solution Proposals Section',
      type: 'object',
      group: 'solutions',
      description: 'Section for proposing and voting on solutions to the campaign issue.',
      fields: [
        {
          name: 'heading',
          title: 'Section Heading',
          type: 'string',
          description: 'Main heading for the solution proposals section.',
        },
        {
          name: 'paragraphs',
          title: 'Intro Paragraphs',
          type: 'array',
          of: [{type: 'text'}],
          description: 'Introductory paragraphs for this section.',
        },
        {
          name: 'subheading',
          title: 'Subheading',
          type: 'string',
          description: 'E.g., “Vote Below on Solutions…”',
        },
        // {
        //   name: 'solutions',
        //   title: 'Solutions',
        //   type: 'array',
        //   description: 'List of proposed solutions for this campaign.',
        //   of: [
        //     {
        //       type: 'object',
        //       fields: [
        //         {
        //           name: 'title',
        //           title: 'Solution Title',
        //           type: 'string',
        //           description: 'Title of the proposed solution.',
        //         },
        //         {
        //           name: 'description',
        //           title: 'Solution Description',
        //           type: 'text',
        //           description: 'Detailed description of the solution.',
        //         },
        //       ],
        //     },
        //   ],
        // },
      ],
    },

    // WAYS TO SUPPORT
    {
      name: 'waysToSupportTabs',
      title: 'Ways to Support Tabs',
      type: 'array',
      group: 'support',
      description:
        'Cards/tabs for ways to support this campaign. Only fill in the ones that apply.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Tab Type',
              type: 'string',
              options: {list: ['conference', 'donations', 'volunteering', 'share']},
              description: 'Type of support tab.',
            },
            {
              name: 'title',
              title: 'Tab Title',
              type: 'string',
              description: 'Title for this support tab.',
            },
            {
              name: 'content',
              title: 'Tab Content',
              type: 'text',
              description: 'Main content for this tab (can be a description, instructions, etc.)',
            },
            // Conference Reference
            {
              name: 'conferenceRef',
              title: 'Conference Reference',
              type: 'reference',
              to: [{type: 'conference'}],
              description:
                'Select a conference from the conferences collection to display in this tab.',
              hidden: ({parent}: {parent: any}) => parent?.type !== 'conference',
            },
            // Optional: manual fields if no reference
            {
              name: 'conferenceDetails',
              title: 'Conference Details if no reference is selected',
              type: 'object',
              description: 'Only fill if this tab is a conference.',
              fields: [
                {
                  name: 'date',
                  title: 'Date',
                  type: 'datetime',
                  description: 'Date and time of the conference.',
                },
                {
                  name: 'registrationForm',
                  title: 'Registration Form Embed',
                  type: 'text',
                  description: 'Embed code or instructions for the registration form.',
                },
                {
                  name: 'description',
                  title: 'Conference Description',
                  type: 'text',
                  description: 'Details about the conference.',
                },
              ],
              hidden: ({parent}: {parent: any}) => parent?.type !== 'conference',
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'gallery.0',
    },
  },
}
