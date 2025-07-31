import {localeString, localeText} from './_localeTypes'

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
      type: 'localeString',
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
      type: 'localeText',
      rows: 3,
      group: 'main',
      description: 'A brief summary of the campaign (max 200 characters).',
      // validation: (Rule: any) => Rule.required().max(200),
      validation: (Rule: any) =>
        Rule.required().custom((val: any) => {
          const tooLong = (val?.en?.length ?? 0) > 500 || (val?.es?.length ?? 0) > 500
          return tooLong ? 'Max 500 characters per language' : true
        }),
    },
    {
      name: 'goalPledges',
      title: 'Pledge Goal',
      type: 'number',
      group: 'main',
      description: 'The target number of pledges for this campaign.',
      validation: (Rule: any) => Rule.required().positive(),
    },
    // Countries involved
    {
      name: 'countriesInvolved',
      title: 'Countries/Regions Involved',
      type: 'array',
      description: 'Select the countries or regions involved in this campaign.',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'Israel', value: 'israel'},
              {title: 'Palestine', value: 'palestine'},
              {title: 'United States', value: 'usa'},
              {title: 'Ukraine', value: 'ukraine'},
              {title: 'Sudan', value: 'sudan'},
              {title: 'Pakistan', value: 'pakistan'},
              {title: 'India', value: 'india'},
              /* …el resto de países… */
              {title: 'Other', value: 'other'},
            ],
          },
        },
      ],
      options: {
        layout: 'tags',
      },
      validation: (Rule: any) =>
        Rule.required().min(1).error('Please select at least one country/region'),
    },
    // PLEDGE FORM
    {
      name: 'pledgeCommitmentItems',
      title: 'Pledge Commitment Items',
      type: 'array',
      group: 'pledge',
      description:
        'Checkbox items for the pledge form. Each item will appear as a checkbox for the user to agree to.',
      of: [{type: 'localeString'}],
    },

    // SOLUTION PROPOSALS
    {
      name: 'parties',
      title: 'Campaign Parties/Sides',
      type: 'array',
      group: 'solutions',
      description:
        'Define the parties/sides that can propose solutions for this campaign. You can add multiple parties with custom solution limits.',
      validation: (Rule: any) => Rule.required().min(1).error('You must define at least 1 party'),
      of: [
        {
          type: 'object',
          title: 'Party',
          fields: [
            {
              name: 'name',
              title: 'Party Name',
              type: 'localeString',
              description:
                'Full display name of the party (e.g., "Israel", "Palestine", "Democrats", "Republicans")',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'slug',
              title: 'Party Slug',
              type: 'string',
              description:
                'Short identifier without spaces (e.g., "israeli", "palestinian", "democrats", "republicans")',
              validation: (Rule: any) =>
                Rule.required().regex(/^[a-z]+$/, {
                  name: 'lowercase letters only',
                  invert: false,
                }),
            },
            {
              name: 'description',
              title: 'Party Description',
              type: 'localeText',
              description:
                'Brief description to who these solutions are for (e.g., "Israeli solutions", "Palestinian solutions", "Democratic solutions", "Republican solutions")',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'icon',
              title: 'Party Icon/Flag',
              type: 'image',
              description: 'Icon, flag, or symbol representing this party',
              options: {hotspot: true},
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'color',
              title: 'Party Color Theme',
              type: 'string',
              description: 'Color theme for this party (affects badges and UI elements)',
              options: {
                list: [
                  {title: 'Blue', value: 'blue'},
                  {title: 'Green', value: 'green'},
                  {title: 'Red', value: 'red'},
                  {title: 'Purple', value: 'purple'},
                  {title: 'Orange', value: 'orange'},
                  {title: 'Teal', value: 'teal'},
                  {title: 'Gray', value: 'gray'},
                ],
              },
              initialValue: 'blue',
            },
            {
              name: 'solutionLimit',
              title: 'Solution Limit',
              type: 'number',
              description: 'Maximum number of solutions this party can have (e.g., 5, 10, 15)',
              validation: (Rule: any) => Rule.required().positive().integer().min(1).max(50),
              initialValue: 5,
            },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'slug',
              media: 'icon',
            },
          },
        },
      ],
    },
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
          type: 'localeString',
          description: 'Main heading for the solution proposals section.',
        },
        // {
        //   name: 'paragraphs',
        //   title: 'Intro Paragraphs',
        //   type: 'array',
        //   of: [{type: 'text'}],
        //   description: 'Introductory paragraphs for this section.',
        // },
        {
          name: 'introParagraphs',
          title: 'Intro Paragraphs',
          description: 'Introductory paragraphs for this section.',
          type: 'array',
          of: [
            {type: 'block'}, // 👈 compatibilidad con contenido antiguo
            {
              type: 'localeBlockContent',
              // Estilos que permites en el texto
              styles: [
                {title: 'Normal', value: 'normal'},
                {title: 'H1', value: 'h1'},
                {title: 'H2', value: 'h2'},
                {title: 'H3', value: 'h3'},
                {title: 'H4', value: 'h4'},
                {title: 'H5', value: 'h5'},
                {title: 'H6', value: 'h6'},
                {title: 'Quote', value: 'blockquote'},
                {title: 'Code Block', value: 'code'},
              ],
              lists: [
                {title: 'Bullet', value: 'bullet'},
                {title: 'Numbered', value: 'number'},
                {title: 'Checklist', value: 'checklist'},
              ],
              marks: {
                decorators: [
                  {title: 'Strong', value: 'strong'},
                  {title: 'Emphasis', value: 'em'},
                  {title: 'Code', value: 'code'},
                  {title: 'Underline', value: 'underline'},
                  {title: 'Strike-through', value: 'strike-through'},
                  {title: 'Highlight', value: 'highlight'},
                ],
                annotations: [
                  {
                    title: 'URL',
                    name: 'link',
                    type: 'object',
                    fields: [
                      {
                        title: 'URL',
                        name: 'href',
                        type: 'url',
                      },
                      {
                        title: 'Open in new tab',
                        name: 'blank',
                        type: 'boolean',
                        initialValue: true,
                      },
                    ],
                  },
                  // Alineación de texto
                  {
                    title: 'Text Align Left',
                    name: 'alignLeft',
                    type: 'object',
                    fields: [
                      {
                        title: 'Enabled',
                        name: 'enabled',
                        type: 'boolean',
                        initialValue: true,
                      },
                    ],
                  },
                  {
                    title: 'Text Align Center',
                    name: 'alignCenter',
                    type: 'object',
                    fields: [
                      {
                        title: 'Enabled',
                        name: 'enabled',
                        type: 'boolean',
                        initialValue: true,
                      },
                    ],
                  },
                  {
                    title: 'Text Align Right',
                    name: 'alignRight',
                    type: 'object',
                    fields: [
                      {
                        title: 'Enabled',
                        name: 'enabled',
                        type: 'boolean',
                        initialValue: true,
                      },
                    ],
                  },
                  {
                    title: 'Text Align Justify',
                    name: 'alignJustify',
                    type: 'object',
                    fields: [
                      {
                        title: 'Enabled',
                        name: 'enabled',
                        type: 'boolean',
                        initialValue: true,
                      },
                    ],
                  },
                  // Color de texto
                  {
                    title: 'Text Color',
                    name: 'color',
                    type: 'object',
                    fields: [
                      {
                        title: 'Color',
                        name: 'value',
                        type: 'string',
                        options: {
                          list: [
                            {title: 'Red', value: 'red'},
                            {title: 'Blue', value: 'blue'},
                            {title: 'Green', value: 'green'},
                            {title: 'Orange', value: 'orange'},
                            {title: 'Purple', value: 'purple'},
                            {title: 'Teal', value: 'teal'},
                            {title: 'Gray', value: 'gray'},
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            },
            // Imagen dentro del contenido
            {
              type: 'image',
              name: 'inlineImage',
              title: 'Image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'alt',
                  title: 'Alternative Text',
                  type: 'string',
                  description: 'Important for SEO and accessibility.',
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: 'caption',
                  title: 'Caption',
                  type: 'string',
                  description: 'Optional caption for the image.',
                },
                {
                  name: 'alignment',
                  title: 'Image Alignment',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Left', value: 'left'},
                      {title: 'Center', value: 'center'},
                      {title: 'Right', value: 'right'},
                      {title: 'Full Width', value: 'full'},
                    ],
                  },
                  initialValue: 'center',
                },
                {
                  name: 'size',
                  title: 'Image Size',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Small (25%)', value: 'small'},
                      {title: 'Medium (50%)', value: 'medium'},
                      {title: 'Large (75%)', value: 'large'},
                      {title: 'Full (100%)', value: 'full'},
                    ],
                  },
                  initialValue: 'large',
                },
              ],
            },
            // Video embeds
            {
              type: 'object',
              name: 'videoEmbed',
              title: 'Video Embed',
              fields: [
                {
                  name: 'url',
                  title: 'Video URL',
                  type: 'url',
                  description: 'YouTube, Vimeo, or other video platform URL',
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: 'title',
                  title: 'Video Title',
                  type: 'string',
                },
                {
                  name: 'caption',
                  title: 'Caption',
                  type: 'string',
                },
              ],
            },
            // Callout/Alert boxes
            {
              type: 'object',
              name: 'callout',
              title: 'Callout Box',
              fields: [
                {
                  name: 'type',
                  title: 'Callout Type',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Info', value: 'info'},
                      {title: 'Warning', value: 'warning'},
                      {title: 'Success', value: 'success'},
                      {title: 'Error', value: 'error'},
                      {title: 'Note', value: 'note'},
                    ],
                  },
                  initialValue: 'info',
                },
                {
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                },
                {
                  name: 'content',
                  title: 'Content',
                  type: 'text',
                  rows: 3,
                },
              ],
            },
            // Separador visual
            {
              type: 'object',
              name: 'divider',
              title: 'Divider',
              fields: [
                {
                  name: 'style',
                  title: 'Divider Style',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Simple Line', value: 'simple'},
                      {title: 'Thick Line', value: 'thick'},
                      {title: 'Dotted', value: 'dotted'},
                      {title: 'Stars', value: 'stars'},
                    ],
                  },
                  initialValue: 'simple',
                },
              ],
            },
            // Columnas de texto
            {
              type: 'object',
              name: 'columns',
              title: 'Two Columns',
              fields: [
                {
                  name: 'leftColumn',
                  title: 'Left Column',
                  type: 'array',
                  of: [{type: 'block'}],
                },
                {
                  name: 'rightColumn',
                  title: 'Right Column',
                  type: 'array',
                  of: [{type: 'block'}],
                },
              ],
            },
          ],
        },
        {
          name: 'subheading',
          title: 'Subheading',
          type: 'localeString',
          description: 'E.g., "Vote Below on Solutions…"',
        },
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
