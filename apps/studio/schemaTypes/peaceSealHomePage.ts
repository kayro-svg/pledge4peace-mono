export default {
  name: 'peaceSealHomePage',
  title: 'Peace Seal Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero'},
    {name: 'valuePromise', title: 'Value Promise'},
    {name: 'whatIs', title: 'What Is'},
    {name: 'whyNeeds', title: 'Why Business Needs'},
    {name: 'howItWorks', title: 'How It Works'},
    {name: 'rewards', title: 'Unlock Rewards'},
    {name: 'advantage', title: 'Advantage'},
    {name: 'finalCta', title: 'Final CTA'},
  ],
  fields: [
    // ===== GENERAL =====
    {
      name: 'title',
      title: 'Document Title',
      type: 'string',
      initialValue: 'Peace Seal Page Configuration',
      description: 'For CMS reference only',
      validation: (rule: {required: () => any}) => rule.required(),
    },

    // ===== HERO =====
    {name: 'heroTagline', title: 'Tagline', type: 'localeString', group: 'hero'},
    {name: 'heroHeading', title: 'Main Title', type: 'localeString', group: 'hero'},
    {name: 'heroSubheading', title: 'Subtitle', type: 'localeText', rows: 2, group: 'hero'},
    {name: 'heroDescription', title: 'Description', type: 'localeText', rows: 3, group: 'hero'},
    {
      name: 'heroPrimaryButtonText',
      title: 'Primary Button Text',
      type: 'localeString',
      group: 'hero',
    },
    {name: 'heroPrimaryButtonLink', title: 'Primary Button Link', type: 'url', group: 'hero'},
    {
      name: 'heroVideo',
      title: 'Background Video',
      type: 'file',
      options: {accept: 'video/*'},
      group: 'hero',
    },
    {
      name: 'heroImage',
      title: 'Background Image',
      type: 'image',
      options: {hotspot: true},
      group: 'hero',
    },

    // ===== VALUE PROMISE =====
    {
      name: 'valueHeadingLines',
      title: 'Heading Lines',
      type: 'array',
      of: [{type: 'localeString'}],
      group: 'valuePromise',
      description: 'Up to 3 lines',
    },
    {
      name: 'valueParagraph',
      title: 'Paragraph',
      type: 'localeText',
      rows: 3,
      group: 'valuePromise',
    },
    {
      name: 'valueImage',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
      group: 'valuePromise',
    },

    // ===== WHAT IS =====
    {name: 'whatIsHeadingTop', title: 'Top Heading', type: 'localeString', group: 'whatIs'},
    {name: 'whatIsHeadingMain', title: 'Main Heading', type: 'localeString', group: 'whatIs'},
    {name: 'whatIsDescription', title: 'Description', type: 'localeText', rows: 4, group: 'whatIs'},
    // CHANGED: Only YouTube video ID
    {
      name: 'whatIsVideoId',
      title: 'YouTube Video ID',
      type: 'string',
      group: 'whatIs',
      description: 'Only the YouTube video ID. Example: 9508ClZd1Qw',
    },
    {
      name: 'whatIsVideoPoster',
      title: 'Video Poster',
      type: 'image',
      options: {hotspot: true},
      group: 'whatIs',
    },

    // ===== WHY BUSINESS NEEDS =====
    {name: 'whyNeedsTitle', title: 'Section Title', type: 'localeString', group: 'whyNeeds'},
    {
      name: 'whyNeedsFeatures',
      title: 'Features',
      type: 'array',
      group: 'whyNeeds',
      of: [
        {
          type: 'object',
          preview: {select: {title: 'title.en'}},
          fields: [
            {name: 'icon', title: 'Icon', type: 'image'},
            {name: 'title', title: 'Title', type: 'localeString'},
            {name: 'text', title: 'Text', type: 'localeText', rows: 3},
          ],
        },
      ],
    },

    // ===== HOW IT WORKS =====
    {name: 'howItWorksHeading', title: 'Section Title', type: 'localeString', group: 'howItWorks'},
    {
      name: 'howItWorksSteps',
      title: 'Steps',
      type: 'array',
      group: 'howItWorks',
      of: [
        {
          type: 'object',
          preview: {select: {title: 'title.en', subtitle: 'index'}},
          fields: [
            {name: 'index', title: 'Index', type: 'string'},
            {name: 'icon', title: 'Icon', type: 'image'},
            {name: 'title', title: 'Step Title', type: 'localeString'},
            {name: 'text', title: 'Description', type: 'localeText', rows: 3},
          ],
        },
      ],
    },

    // ===== UNLOCK REWARDS =====
    {name: 'rewardsTitle', title: 'Section Title', type: 'localeString', group: 'rewards'},
    {
      name: 'rewardsDescription',
      title: 'Description',
      type: 'localeText',
      rows: 3,
      group: 'rewards',
    },
    // CHANGED: Only YouTube video ID
    {
      name: 'rewardsVideoId',
      title: 'YouTube Video ID',
      type: 'string',
      group: 'rewards',
      description: 'Only the YouTube video ID. Example: f0iA27NXYm0',
    },
    {
      name: 'rewardsVideoPoster',
      title: 'Video Poster',
      type: 'image',
      options: {hotspot: true},
      group: 'rewards',
    },
    {
      name: 'perks',
      title: 'Perks',
      type: 'array',
      group: 'rewards',
      of: [
        {
          type: 'object',
          preview: {select: {title: 'label.en'}},
          fields: [
            {name: 'icon', title: 'Icon', type: 'image'},
            {name: 'label', title: 'Label', type: 'localeString'},
          ],
        },
      ],
    },
    {
      name: 'startFreeAssessmentTitle',
      title: 'Start Free Assessment Title',
      type: 'localeString',
      group: 'rewards',
    },
    {
      name: 'startFreeAssessmentDescription',
      title: 'Start Free Assessment Description',
      type: 'localeText',
      rows: 3,
      group: 'rewards',
    },
    {
      name: 'startFreeAssessmentPros',
      title: 'Start Free Assessment Pros',
      type: 'array',
      of: [{type: 'localeString'}],
      group: 'rewards',
    },
    {
      name: 'startFreeAssessmentButtonText',
      title: 'Start Free Assessment Button Text',
      type: 'localeString',
      group: 'rewards',
    },

    // ===== ADVANTAGE =====
    {name: 'advantageTitle', title: 'Section Title', type: 'localeString', group: 'advantage'},
    {
      name: 'advantageDescription',
      title: 'Description',
      type: 'localeText',
      rows: 3,
      group: 'advantage',
    },
    {name: 'withoutTitle', title: 'Left Card Title', type: 'localeString', group: 'advantage'},
    {
      name: 'withoutItems',
      title: 'Negative Points',
      type: 'array',
      of: [{type: 'localeString'}],
      group: 'advantage',
    },
    {name: 'withTitle', title: 'Right Card Title', type: 'localeString', group: 'advantage'},
    {
      name: 'withItems',
      title: 'Positive Points',
      type: 'array',
      of: [{type: 'localeString'}],
      group: 'advantage',
    },

    // ===== FINAL CTA =====
    {name: 'finalCtaTitle', title: 'CTA Title', type: 'localeString', group: 'finalCta'},
    {
      name: 'finalCtaDescription',
      title: 'CTA Description',
      type: 'localeText',
      rows: 3,
      group: 'finalCta',
    },
    {name: 'finalCtaButtonText', title: 'CTA Button Text', type: 'localeString', group: 'finalCta'},
  ],

  preview: {
    select: {title: 'title.en'},
    prepare({title}: {title: string}) {
      return {title: title || 'Peace Seal Page', subtitle: 'Static content configuration'}
    },
  },
}
