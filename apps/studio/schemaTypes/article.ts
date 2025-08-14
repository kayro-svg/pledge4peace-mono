// schemaTypes/article.ts
import {localeString, localeText} from './_localeTypes'

export default {
  name: 'article',
  title: 'Articles',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Article Title',
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
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'localeText',
      rows: 3,
      // validation: (Rule: any) => Rule.max(200),
      // validation: (Rule: any) =>
      //   Rule.required().custom((val: any) => {
      //     const tooLong = (val?.en?.length ?? 0) > 200 || (val?.es?.length ?? 0) > 200
      //     return tooLong ? 'Max 200 characters per language' : true
      //   }),
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
    },
    // SEO Section
    {
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      description: 'Search Engine Optimization settings',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'localeString',
          description: 'Title for search engines (50-60 characters recommended)',
          // validation: (Rule: any) =>
          //   Rule.max(60).warning('Keep it under 60 characters for optimal SEO'),
          // validation: (Rule: any) =>
          //   Rule.custom((val: any) => {
          //     const tooLong = (val?.en?.length ?? 0) > 60 || (val?.es?.length ?? 0) > 60
          //     return tooLong ? 'Max 60 characters per language' : true
          //   }),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'localeText',
          rows: 3,
          description: 'Description for search engines (150-160 characters recommended)',
          // validation: (Rule: any) =>
          //   Rule.custom((val: any) => {
          //     const tooLong = (val?.en?.length ?? 0) > 160 || (val?.es?.length ?? 0) > 160
          //     return tooLong ? 'Max 160 characters per language' : true
          //   }),
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{type: 'string'}],
          description: 'Keywords for SEO (add relevant keywords)',
          options: {
            layout: 'tags',
          },
        },
        {
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Image for social media sharing (1200x630px recommended)',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'noIndex',
          title: 'No Index',
          type: 'boolean',
          description: 'Check this to prevent search engines from indexing this article',
          initialValue: false,
        },
        {
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description: 'If this article was originally published elsewhere, add the original URL',
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    },
    {
      name: 'content',
      title: 'Article Content',
      type: 'array',
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
        // Referencia a formulario de Brevo (reutilizable)
        {
          type: 'reference',
          name: 'brevoFormRef',
          title: 'Brevo Form',
          to: [{type: 'brevoForm'}],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'excerpt.en',
      media: 'image',
    },
  },
}
