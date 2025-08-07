// schemaTypes/conference.ts
import {localeString, localeText} from './_localeTypes'

export default {
  name: 'conference',
  title: 'Conferences',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Conference Title',
      type: 'localeString',
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
      name: 'startDateTime',
      title: 'Conference Start Date & Time',
      type: 'datetime',
      description: 'When the conference begins (date and time)',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'endDateTime',
      title: 'Conference End Date & Time',
      type: 'datetime',
      description: 'When the conference ends (optional)',
    },
    {
      name: 'timezone',
      title: 'Conference Timezone',
      type: 'string',
      description: 'Timezone for displaying the conference times',
      options: {
        list: [
          {title: 'Eastern Time (ET)', value: 'America/New_York'},
          {title: 'Central Time (CT)', value: 'America/Chicago'},
          {title: 'Mountain Time (MT)', value: 'America/Denver'},
          {title: 'Pacific Time (PT)', value: 'America/Los_Angeles'},
          {title: 'UTC', value: 'UTC'},
          {title: 'London (GMT/BST)', value: 'Europe/London'},
          {title: 'Paris (CET/CEST)', value: 'Europe/Paris'},
          {title: 'Tokyo (JST)', value: 'Asia/Tokyo'},
          {title: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney'},
          {title: 'Mumbai (IST)', value: 'Asia/Kolkata'},
          {title: 'Dubai (GST)', value: 'Asia/Dubai'},
          {title: 'São Paulo (BRT)', value: 'America/Sao_Paulo'},
        ],
      },
      initialValue: 'America/New_York',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'location',
      title: 'Location',
      type: 'localeString',
      description: 'Physical location or "Online" for virtual conferences',
    },
    {
      name: 'organizer',
      title: 'Organizer',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Organizer Name',
          type: 'string',
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: 'logo',
          title: 'Organizer Logo',
          type: 'image',
          options: {hotspot: true},
        },
      ],
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
      type: 'localeText',
      rows: 3,
      validation: (Rule: any) => Rule.required(),
      description: 'Brief summary for previews and listings',
    },
    {
      name: 'about',
      title: 'Conference Content',
      type: 'array',
      description: 'Rich content editor for detailed conference information',
      of: [
        {
          type: 'block',
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
              type: 'localeString',
            },
            {
              name: 'role',
              title: 'Role/Title',
              type: 'localeString',
            },
            {
              name: 'bio',
              title: 'Short Bio',
              type: 'localeText',
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
      title: 'title.en',
      subtitle: 'startDateTime',
      media: 'image',
      organizerName: 'organizer.name',
    },
    prepare({
      title,
      subtitle,
      media,
      organizerName,
    }: {
      title: string
      subtitle: string
      media: any
      organizerName: string
    }) {
      const formattedDate = subtitle
        ? new Date(subtitle).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : ''

      return {
        title,
        subtitle: `${organizerName ? `${organizerName} - ` : ''}${formattedDate}`,
        media,
      }
    },
  },
}
