// schemaTypes/homePage.ts
export default {
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // Use groups to visually organize sections
  groups: [
    {name: 'hero', title: 'Main Section (Hero)'},
    {name: 'howItWorks', title: 'How It Works'},
    {name: 'campaignsSection', title: 'Campaigns Section'},
    {name: 'waysToSupportSection', title: 'Ways to Support Section'},
    {name: 'articlesSection', title: 'Articles Section'},
    {name: 'conferencesSection', title: 'Conferences Section'},
  ],
  fields: [
    // General Configuration
    {
      name: 'title',
      title: 'Document Title',
      type: 'string',
      initialValue: 'Home Page Configuration',
      description: 'For reference in the CMS only (does not appear on the site)',
      validation: (rule: {required: () => any}) => rule.required(),
    },

    // ===== HERO SECTION =====
    {
      name: 'heroHeading',
      title: 'Main Title',
      type: 'string',
      group: 'hero',
      description: 'Large title at the top of the page',
    },
    {
      name: 'heroSubheading',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
      group: 'hero',
      description: 'Descriptive text below the main title',
    },
    {
      name: 'heroPrimaryButtonText',
      title: 'Primary Button Text',
      type: 'string',
      group: 'hero',
      description: 'E.g., "Pledge Now"',
    },
    {
      name: 'heroSecondaryButtonText',
      title: 'Secondary Button Text',
      type: 'string',
      group: 'hero',
      description: 'E.g., "Learn About Us"',
    },
    {
      name: 'heroVideo',
      title: 'Background Video',
      type: 'file',
      options: {accept: 'video/*'},
      group: 'hero',
      description: 'Video that appears in the background of the hero (optional)',
    },
    {
      name: 'heroImage',
      title: 'Background Image',
      type: 'image',
      options: {hotspot: true},
      group: 'hero',
      description: 'Alternative image if no video is available',
    },

    // ===== HOW IT WORKS SECTION =====
    {
      name: 'howItWorksHeading',
      title: 'Section Title',
      type: 'string',
      group: 'howItWorks',
      description: 'E.g., "How Pledge4Peace Works"',
    },
    {
      name: 'howItWorksDescription',
      title: 'General Description',
      type: 'text',
      rows: 3,
      group: 'howItWorks',
      description: 'Introductory text explaining the process',
    },
    {
      name: 'howItWorksSteps',
      title: 'Process Steps',
      type: 'array',
      of: [
        {
          type: 'object',
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
              //   media: 'icon',
            },
          },
          fields: [
            {
              name: 'title',
              title: 'Step Title',
              type: 'string',
              description: 'E.g., "Register as a P4P Member", "Pledge", "Endorse"',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              description: 'Brief explanation of what the user does in this step',
            },
            // {
            //   name: 'icon',
            //   title: 'Icon',
            //   type: 'image',
            //   description: 'Representative icon for this step',
            // },
          ],
        },
      ],
      group: 'howItWorks',
    },

    // ===== CAMPAIGNS SECTION =====
    {
      name: 'campaignsHeading',
      title: 'Section Title',
      type: 'string',
      group: 'campaignsSection',
      description: 'E.g., "Our Campaigns"',
    },
    {
      name: 'campaignsDescription',
      title: 'General Description',
      type: 'text',
      rows: 3,
      group: 'campaignsSection',
      description: 'Introductory text explaining the campaigns',
    },
    {
      name: 'campaigns',
      title: 'Campaigns',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'campaign'}]}],
      group: 'campaignsSection',
      description: 'Select the campaigns to display in this section',
    },

    // ===== WAYS TO SUPPORT SECTION =====
    {
      name: 'waysToSupportHeading',
      title: 'Section Title',
      type: 'string',
      group: 'waysToSupportSection',
      description: 'E.g., "Ways to Support"',
    },
    {
      name: 'waysToSupportDescription',
      title: 'General Description',
      type: 'text',
      rows: 3,
      group: 'waysToSupportSection',
      description: 'Introductory text explaining the ways to support',
    },
    {
      name: 'waysToSupportItems',
      title: 'Support Options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Option Title',
              type: 'string',
              description: 'E.g., "Donate"',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              description: 'Brief explanation of what this support option is',
            },
            {
              name: 'icon',
              title: 'Icon',
              type: 'image',
              description: 'Representative icon for this support option',
            },
            {
              name: 'buttonText',
              title: 'Button Text',
              type: 'string',
              description: 'E.g., "Donate Now"',
            },
            {
              name: 'buttonLink',
              title: 'Button Link',
              type: 'url',
              description: 'E.g., "https://www.pledge4peace.org/donate"',
            },
          ],
        },
      ],
      group: 'waysToSupportSection',
    },

    // Second Card Fields for Ways to Support Section
    {
      name: 'secondCardHeading',
      title: 'Second Card Main Heading',
      type: 'string',
      group: 'waysToSupportSection',
      description: 'The main heading for the second card',
    },
    {
      name: 'secondCardDescription',
      title: 'Second Card Description',
      type: 'text',
      rows: 3,
      group: 'waysToSupportSection',
      description: 'The main description text for the second card',
    },
    {
      name: 'secondCardButtonText',
      title: 'Second Card Button Text',
      type: 'string',
      group: 'waysToSupportSection',
      description: 'The text to display on the button',
    },
    {
      name: 'secondCardSecondHeading',
      title: 'Second Card Secondary Heading',
      type: 'string',
      group: 'waysToSupportSection',
      description: 'The secondary heading for the second card',
    },
    {
      name: 'secondCardListOfSupportImpact',
      title: 'Impact List',
      type: 'array',
      of: [{type: 'string'}],
      group: 'waysToSupportSection',
      description: 'List of impact statements to display in the second card',
    },

    // ===== ARTICLES SECTION =====
    {
      name: 'articlesHeading',
      title: 'Section Title',
      type: 'string',
      group: 'articlesSection',
      description: 'E.g., "Articles & Updates"',
    },
    {
      name: 'articlesDescription',
      title: 'General Description',
      type: 'text',
      rows: 3,
      group: 'articlesSection',
      description: 'Introductory text explaining the articles',
    },
    {
      name: 'articles',
      title: 'Articles',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'article'}], limit: 3}],
      group: 'articlesSection',
      description: 'Select the articles to display in this section (max 3)',
    },

    // ===== CONFERENCES SECTION =====
    {
      name: 'conferencesHeading',
      title: 'Section Title',
      type: 'string',
      group: 'conferencesSection',
      description: 'E.g., "Upcoming Conferences and Events"',
    },
    {
      name: 'conferencesDescription',
      title: 'General Description',
      type: 'text',
      rows: 3,
      group: 'conferencesSection',
      description: 'Introductory text explaining the conferences',
    },
    {
      name: 'conferences',
      title: 'Conferences',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'conference'}], limit: 3}],
      group: 'conferencesSection',
      description: 'Select the conferences to display in this section (max 3)',
    },
  ],

  preview: {
    select: {
      title: 'title',
    },
    prepare({title}: {title: string}) {
      return {
        title: title || 'Home Page',
        subtitle: 'Static content configuration',
      }
    },
  },
}
