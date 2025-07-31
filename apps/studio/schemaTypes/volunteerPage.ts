export default {
  name: 'volunteerPage',
  title: 'Volunteer Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Banner'},
    {name: 'waysToVolunteer', title: 'Ways to Volunteer Section'},
    {name: 'convinceHighProfile', title: 'Convince High-Profile Figures Section'},
    {name: 'spreadTheWord', title: 'Spread the Word Section'},
    {name: 'impact', title: 'Impact Section'},
  ],
  fields: [
    // General Configuration
    {
      name: 'title',
      title: 'Document Title',
      type: 'string',
      initialValue: 'Volunteer Page Static Content',
      description: 'For reference in the CMS only (does not appear on the site)',
      validation: (rule: {required: () => any}) => rule.required(),
    },

    // ===== HERO BANNER =====
    {
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      group: 'hero',
      fields: [
        {
          name: 'heroHeading',
          title: 'Hero Heading',
          type: 'localeString',
          description: 'The main heading. Example: "Raise your voice..."',
        },
        {
          name: 'heroSubheading',
          title: 'Hero Subheading',
          type: 'localeText',
          description:
            'The explanatory text below the heading. Example: "Join us in making a difference..."',
        },
        {
          name: 'heroButtonText',
          title: 'Button Text',
          type: 'localeString',
          description: 'The text for the hero button. Example: "Apply Now"',
        },
        {
          name: 'heroBgImage',
          title: 'Hero Right Image',
          type: 'image',
          options: {hotspot: true},
          description: 'The gradient background image for the hero section',
        },
      ],
    },

    // ===== WAYS TO VOLUNTEER SECTION =====
    {
      name: 'waysToVolunteerSection',
      title: 'Ways to Volunteer Section',
      type: 'object',
      group: 'waysToVolunteer',
      fields: [
        {
          name: 'waysToVolunteerHeading',
          title: 'Section Heading',
          type: 'localeString',
          description: 'The heading for this section. Example: "Ways to Volunteer"',
        },
        {
          name: 'waysToVolunteerParagraph',
          title: 'Section Paragraph',
          type: 'localeText',
          description:
            'The paragraph for this section. Example: "There are many ways to get involved with our organization. We welcome all volunteers who share our mission and values."',
        },
        // {
        //   name: 'waysToVolunteerCards',
        //   title: 'Volunteer Cards',
        //   type: 'array',
        //   of: [
        //     {
        //       type: 'object',
        //       fields: [
        //         {
        //           name: 'title',
        //           title: 'Card Title',
        //           type: 'string',
        //           description:
        //             'The title for the volunteer card. Example: "Volunteer as a P4P Member"',
        //         },
        //         {
        //           name: 'description',
        //           title: 'Card Description',
        //           type: 'text',
        //           description: 'The description of this volunteer opportunity',
        //         },
        //         {
        //           name: 'buttonText',
        //           title: 'Button Text',
        //           type: 'string',
        //           description: 'Text for the call-to-action button. Example: "Learn More"',
        //         },
        //       ],
        //     },
        //   ],
        // },
      ],
    },

    // ==== CONVINCE HIGH-PROFILE FIGURES SECTION =====
    {
      name: 'convinceHighProfileSection',
      title: 'Convince High-Profile Figures Section',
      type: 'object',
      group: 'convinceHighProfile',
      fields: [
        {
          name: 'convinceHighProfileHeading',
          title: 'Section Heading',
          type: 'localeString',
          description: 'The heading for this section. Example: "Convince High-Profile Figures"',
        },
        {
          name: 'convinceHighProfileParagraph',
          title: 'Section Paragraph',
          type: 'localeText',
          description:
            'The paragraph for this section. Example: "We are looking for high-profile figures to help us spread our message and make a difference."',
        },
        {
          name: 'convinceHighProfileChecklist',
          title: 'Checklist',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Checklist Item',
                  type: 'localeString',
                  description:
                    'The title for this checklist item. Example: "Convince a High-Profile Figure"',
                },
              ],
            },
          ],
        },
        {
          name: 'convinceHighProfileImage',
          title: 'Section Image',
          type: 'image',
          options: {hotspot: true},
          description: 'The image for this section',
        },
      ],
    },

    // ==== SPREAD THE WORD SECTION =====
    {
      name: 'spreadTheWordSection',
      title: 'Spread the Word Section',
      type: 'object',
      group: 'spreadTheWord',
      fields: [
        {
          name: 'spreadTheWordHeading',
          title: 'Section Heading',
          type: 'localeString',
          description: 'The heading for this section. Example: "Spread the Word"',
        },
        {
          name: 'spreadTheWordParagraph',
          title: 'Section Paragraph',
          type: 'localeText',
          description:
            'The paragraph for this section. Example: "We are looking for high-profile figures to help us spread our message and make a difference."',
        },
        {
          name: 'spreadTheWordCards',
          title: 'Spread the Word Cards',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Card Title',
                  type: 'localeString',
                  description: 'The title for this card. Example: "Share on Social Media"',
                },
                {
                  name: 'description',
                  title: 'Card Description',
                  type: 'localeText',
                  description: 'The description of this card',
                },
              ],
            },
          ],
        },
        {
          name: 'spreadTheWordImage',
          title: 'Section Image',
          type: 'image',
          options: {hotspot: true},
          description: 'The image for this section',
        },
      ],
    },

    // ==== IMPACT SECTION =====
    {
      name: 'impactSection',
      title: 'Impact Section',
      type: 'object',
      group: 'impact',
      fields: [
        {
          name: 'impactHeading',
          title: 'Section Heading',
          type: 'localeString',
          description:
            'The heading for this section. Example: "Hundreds of people are pledging..."',
        },
        {
          name: 'impactParagraph',
          title: 'Section Paragraph',
          type: 'localeText',
          description:
            'The paragraph for this section. Example: "Together, our community has raised significant..."',
        },
        {
          name: 'impactButtonText',
          title: 'Button Text',
          type: 'localeString',
          description: 'The text for the button. Example: "Volunteer today"',
        },
      ],
    },
  ],
}
