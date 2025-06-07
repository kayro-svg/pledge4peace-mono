export default {
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Banner'},
    {name: 'whoWeAre', title: 'Who We Are Section'},
    {name: 'ourMission', title: 'Our Mission Section'},
    {name: 'ourPhilosophy', title: 'Our Philosophy Section'},
    {name: 'ourCharter', title: 'Our Charter Section'},
    {name: 'contactInfo', title: 'Get In Touch Section'},
    {name: 'ourCommitment', title: 'Our Commitment Section'},
  ],
  fields: [
    // General Configuration
    {
      name: 'title',
      title: 'Document Title',
      type: 'string',
      initialValue: 'About Page Static Content',
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
          type: 'string',
          description: 'The main heading. Example: "About Us"',
        },
        {
          name: 'heroSubheading',
          title: 'Hero Subheading',
          type: 'text',
          description:
            'The explanatory text below the heading. Example: "We take our freedoms for granted..."',
        },
        {
          name: 'heroBgImage',
          title: 'Hero Background Image (Optional)',
          type: 'image',
          options: {hotspot: true},
          description: 'The gradient background image for the hero section',
        },
      ],
    },

    // ===== WHO WE ARE SECTION =====

    {
      name: 'whoWeAreSection',
      title: 'Who We Are Section',
      type: 'object',
      group: 'whoWeAre',
      fields: [
        {
          name: 'whoWeAreHeading',
          title: 'Section Heading',
          type: 'string',
          description: 'The heading for this section. Example: "Who We Are"',
        },
        {
          name: 'whoWeAreFirstParagraph',
          title: 'First Paragraph',
          type: 'text',
          description: 'The first paragraph explaining who we are',
        },
        {
          name: 'whoWeAreImage',
          title: 'Section Image',
          type: 'image',
          options: {hotspot: true},
          description: 'The image for this section',
        },
        {
          name: 'whoWeAreSecondParagraph',
          title: 'Second Paragraph',
          type: 'text',
          description: 'The second explanatory paragraph about who we are and our mission',
        },
        {
          name: 'whoWeAreThirdParagraph',
          title: 'Third Paragraph',
          type: 'text',
          description: 'Additional information about our group, advocates, and involvement',
        },
      ],
    },

    // ===== OUR MISSION SECTION =====

    {
      name: 'ourMissionSection',
      title: 'Our Mission Section',
      type: 'object',
      group: 'ourMission',
      fields: [
        {
          name: 'ourMissionHeading',
          title: 'Section Heading',
          type: 'string',
          description: 'The heading for this section. Example: "Our Mission"',
        },
        {
          name: 'ourMissionParagraph',
          title: 'Mission Statement',
          type: 'text',
          description: 'The main mission statement text',
        },
        {
          name: 'ourMissionImage',
          title: 'Section Image',
          type: 'image',
          options: {hotspot: true},
          description: 'The image for the mission section',
        },
      ],
    },

    // ===== OUR PHILOSOPHY SECTION =====

    {
      name: 'ourPhilosophySection',
      title: 'Our Philosophy Section',
      type: 'object',
      group: 'ourPhilosophy',
      fields: [
        {
          name: 'ourPhilosophyHeading',
          title: 'Section Heading',
          type: 'string',
          description: 'The heading for this section. Example: "Our Philosophy"',
        },
        {
          name: 'ourPhilosophyParagraph',
          title: 'Philosophy Statement',
          type: 'text',
          description: 'The main text explaining our philosophy',
        },
        {
          name: 'ourPhilosophyImage',
          title: 'Section Image',
          type: 'image',
          options: {hotspot: true},
          description: 'The image for the philosophy section',
        },
      ],
    },

    // ===== OUR CHARTER SECTION =====

    {
      name: 'ourCharterSection',
      title: 'Our Charter Section',
      type: 'object',
      group: 'ourCharter',
      fields: [
        {
          name: 'ourCharterHeading',
          title: 'Section Heading',
          type: 'string',
          description: 'The heading for this section. Example: "Our Charter"',
        },
        {
          name: 'ourCharterParagraph',
          title: 'Charter Introduction',
          type: 'text',
          description: 'Introductory text about our charter and principles',
        },
        {
          name: 'charterPrinciples',
          title: 'Charter Principles',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Principle Title',
                  type: 'string',
                  description: 'Title or heading for this principle',
                },
              ],
              preview: {
                select: {
                  title: 'title',
                },
              },
            },
          ],
          description: 'The key principles or points of our charter',
        },
      ],
    },

    // ===== OUR MISSION CARD =====
    {
      name: 'missionHighlightCard',
      title: 'Mission Highlight Card',
      type: 'object',
      group: 'ourMission',
      fields: [
        {
          name: 'title',
          title: 'Card Title',
          type: 'string',
          description: 'The title for the mission highlight card',
        },
        {
          name: 'description',
          title: 'Card Description',
          type: 'text',
          description: 'The description for the mission highlight card',
        },
      ],
    },

    // ===== GET IN TOUCH SECTION =====

    {
      name: 'getInTouchCard',
      title: 'Get In Touch Card',
      type: 'object',
      group: 'contactInfo',
      fields: [
        {
          name: 'getInTouchHeading',
          title: 'Section Heading',
          type: 'string',
          description: "The heading for this section. Example: 'Get In Touch'",
        },
        {
          name: 'contactInformation',
          title: 'Contact Information',
          type: 'reference',
          to: [{type: 'contactInformation'}],
          description: 'Select the contact information to display in this section',
        },
      ],
    },

    // ===== OUR COMMITMENT SECTION =====
    {
      name: 'ourCommitmentCard',
      title: 'Commitment Highlight Card',
      type: 'object',
      group: 'ourCommitment',
      fields: [
        {
          name: 'title',
          title: 'Card Title',
          type: 'string',
          description: 'The title for the commitment highlight card',
        },
        {
          name: 'description',
          title: 'Card Description',
          type: 'text',
          description: 'The description for the commitment highlight card',
        },
      ],
    },
  ],

  preview: {
    select: {
      title: 'title',
    },
    prepare({title}: {title: string}) {
      return {
        title: title || 'About Page',
        subtitle: 'Static content configuration',
      }
    },
  },
}
