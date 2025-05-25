// API utility functions for Pledge4Peace
// These functions will eventually connect to your backend API
import {
  AboutPage,
  Campaign,
  CampaignWithSolutions,
  MainAboutPage,
  PartySolutions,
  Solution,
  TeamMember,
} from "./types";

// Sample team members data
const teamMembers: TeamMember[] = [
  {
    name: "Peace Advocate",
    role: "Executive Director",
    bio: "Committed to fostering dialogue and understanding between communities in conflict zones.",
  },
  {
    name: "Community Organizer",
    role: "Outreach Coordinator",
    bio: "Works with local governments and organizations to implement peace initiatives and educational programs.",
  },
  {
    name: "Global Liaison",
    role: "International Relations",
    bio: "Builds partnerships with international entities to strengthen our global reach and impact.",
  },
];

/**
 * Mock data - will be replaced with real API/database calls
 */
const MOCK_DATA = {
  about: {
    main: {
      title: "About Us",
      content:
        "We take our freedoms for granted. For those under 50 years of age living in the United States and similar democratic nation states, it is easy to assume that the present political, social, and economic environment is how it has always been. Yet, humanity's history tells us just the opposite—relative peace is not the norm; war and strife are.",
      intro_paragraphs: [
        "As generations before us grappled with the horrors of two world wars and countless other regional battles, we too find ourselves at an inflection point. We are descending into another dark moment on this collective home we call Earth. Regional conflicts are tearing at the fabrics that we have worked so hard to create, and the voices of the majority, who we know desire peace, are drowned out by a small, but powerful minority who fan the flames.",
        "Pledge 4 Peace understands that peace is not a natural state. If we desire peace, we must work for it, create incentives to curb conflict, and produce meaningful initiatives that will naturally drive individuals to pursue peace as the only objective. The alternative is something unimaginable.",
        "We are a group of Peace Advocates. We have worked tirelessly in the last few weeks and launched Pledge4Peace.org with a sincere hope to halt further atrocities and resolve the 75+ year-old Israel and Palestine issue. If you like our idea of making peace through pledge, please like us on Facebook and pledge on this website. If you have any reservations or do not support the idea, we value your feedback to guide us in correcting our path and making improvements. Please give us 100% anonymous feedback by sending us an email at info@pledge4peace.org. This is your opportunity to contribute to the success and become a peacemaker, with the chance to reap great returns.",
      ],
      sections: [
        {
          heading: "Our Mission",
          content:
            "Our mission is simple yet profound: to foster a global community united in the pursuit of peace. Through meaningful dialogue, shared stories, and collective action, we strive to cultivate a culture of respect, empathy, and cooperation, transcending barriers of geography, ideology, and creed.",
        },
        {
          heading: "Our Philosophy",
          content:
            "Within these digital walls, every voice finds solace and significance. Whether a whispered plea for understanding or a resounding call to action, each pledge adds another layer to our shared vision of a world bathed in the gentle glow of harmony.",
        },
        {
          heading: "Our Charter",
          content:
            "We will collaborate with local governments, organizations, companies, and individuals who uphold equal rights and justice for all citizens, irrespective of their race, color, religion, ethnicity, or beliefs, to foster peace and tranquility in our targeted region. We will support these entities in providing the following to their constituents.",
        },
      ],
      charter_points: [
        "Ensure equal protection and rights for all residents of the region, regardless of their race, ethnicity, color, gender, religion, etc.",
        "Guarantee fundamental rights and freedoms to individuals, including freedom of speech, religion, and the press, the right to a fair trial, and protection against unreasonable searches and seizures, regardless of their race, ethnicity, color, gender, religion, etc.",
      ],
      team_members: teamMembers,
      partnerships_text:
        "We are actively seeking partnerships with the following organizations and companies that share our mission of promoting equality and justice for all, regardless of individuals' beliefs or backgrounds, including color, race, religion, ethnicity, etc. We are particularly interested in forging partnerships with investment companies, tourism companies, and other nonprofit organizations and groups.",
    } as MainAboutPage & {
      intro_paragraphs: string[];
      charter_points: string[];
      partnerships_text: string;
    },
  },
  campaigns: {
    all: [
      {
        id: "1",
        slug: "strengthen-democracy-in-pakistan",
        featuredImage: {
          asset: {
            url: "/placeholder.svg?height=400&width=600",
          },
        },
        gallery: [
          {
            type: "image" as const,
            image: {
              asset: {
                url: "/placeholder.svg?height=500&width=800&text=Modern+Green+Chair",
              },
            },
            alt: "Democracy in Pakistan",
          },
        ],
        title: "Strengthen Democracy In Pakistan",
        category: "Democracy",
        description:
          "Let's Strengthen The Democracy In Pakistan Through Travel And Tourism.",
        link: "/campaigns/strengthen-democracy-in-pakistan",
        raisedPledges: 8000,
        goalPledges: 10000,
        commitmentText:
          "I commit my vote for peace and will support political solutions that strengthen democracy in Pakistan.",
        media: [
          {
            type: "image" as const,
            src: "/placeholder.svg?height=500&width=800&text=Modern+Green+Chair",
            alt: "Democracy in Pakistan",
          },
          {
            type: "image" as const,
            src: "/placeholder.svg?height=500&width=800&text=Green+Chair",
            alt: "Pakistan democracy initiatives",
          },
          {
            type: "video" as const,
            src: "/pledge4peace_hero_video.mp4",
            alt: "Pakistan democracy video",
          },
          {
            type: "image" as const,
            src: "/placeholder.svg?height=500&width=800&text=Grey+Chair",
            alt: "Supporting democracy",
          },
        ],
        contentText: {
          title: "Pakistan's Journey Toward Democracy",
          paragraphs: [
            "Pakistan's journey toward a strong democracy has faced many obstacles. However, the benefits of true democratic governance are clear to its citizens. Challenges include tensions between military and democratic institutions, religious and cultural extremism, strained international relations, and the influence of powerful elites. Despite these issues, there is a strong desire for a fair and functional system. Collaboration between political parties and the military is crucial for achieving peace and stable democracy.",
            "The current political situation, with opposition leaders jailed and potential conflicts, highlights the need for a sustainable and fair system that benefits everyone. Pakistanis abroad are willing to support their country through investments and visits, provided there is stable and peaceful democratic governance.",
            "If political parties, military institutions, and civic leaders unite, Pakistan can achieve the full benefits of authentic democracy, leading to prosperity and peace. Even if just 1% of the over 10 million Pakistanis abroad invested $100,000 each in their homeland, it could add $10 billion to Pakistan's economy, driving further development and stability. The following 'Peace and Strengthen Democracy Framework,' created by Pakistanis, offers a roadmap to political stability and national success.",
          ],
        },
        conference: {
          title: "Democracy Summit: Pakistan's Path Forward",
          date: "December 15, 2024",
          time: "10:00 AM PKT",
          description:
            "Join us for a groundbreaking online summit focused on strengthening democratic institutions in Pakistan.",
          about:
            "This virtual conference brings together political leaders, civil society representatives, and international experts to discuss practical strategies for enhancing democratic governance in Pakistan. Key topics include electoral reforms, transparency initiatives, civil-military relations, and citizen engagement in democratic processes. Through collaborative dialogue, we aim to develop actionable recommendations that can contribute to Pakistan's democratic journey. The event will feature panel discussions, expert presentations, and interactive Q&A sessions to ensure diverse perspectives are considered.",
          images: {
            banner:
              "/placeholder.svg?height=400&width=800&text=Pakistan+Democracy+Summit",
            gallery: [
              {
                src: "/placeholder.svg?height=200&width=400&text=Election+Day+Pakistan",
                alt: "Pakistani citizens participating in elections",
              },
              {
                src: "/placeholder.svg?height=200&width=400&text=Parliament+House",
                alt: "Pakistan's Parliament House in Islamabad",
              },
              {
                src: "/placeholder.svg?height=200&width=400&text=Youth+Activists",
                alt: "Young Pakistani democracy activists rallying for change",
              },
              {
                src: "/placeholder.svg?height=200&width=400&text=Reform+Protest",
                alt: "Pakistanis advocating for democratic reforms",
              },
            ],
          },
        },
        partySolutions: [
          {
            id: "political-parties",
            name: "Pakistan Political Parties",
            partyNumber: 1,
            logo: "/placeholder.svg?height=80&width=80",
            solutions: [
              {
                id: "strengthen-democracy",
                title:
                  "Strengthen Democracy & Accountability within Political Parties.",
                description:
                  "Strengthen Democracy & Accountability within Political Parties.",
                rank: "Ranked #1",
                expanded: false,
                details: {
                  intro:
                    "Pakistan's political parties should strengthen democracy, transparency, and accountability within their organizations by following these guidelines:",
                  guidelines: [
                    {
                      title:
                        "Transparent Elections & Limit on Party Presidentship:",
                      description:
                        "Hold regular, fair internal elections with independent oversight and establish a rule that leadership rotates among deserving members where a party president cannot hold the presidency for more than two terms of three years each. A party president cannot hold dual citizenship.",
                    },
                    {
                      title: "Audited Financial Statements:",
                      description:
                        "Promote transparency in all departments, especially finances, and conduct regular audits. All parties shall furnish audited financial statements, signed by the board, to the Election Commission of Pakistan and the public yearly.",
                    },
                    {
                      title: "Declaration of Local and Overseas Assets:",
                      description:
                        "Develop and enforce a code of ethics with clear disciplinary actions for all party officers and members. All political party officers shall furnish their personal financial statements available to the public including overseas properties and accounts.",
                    },
                  ],
                },
              },
              {
                id: "land-reforms",
                title:
                  "Land Reforms, Eliminate Mafias, and Redistribute Resources in Pakistan.",
                description:
                  "Land Reforms, Eliminate Mafias, and Redistribute Resources in Pakistan.",
                rank: "Ranked #2",
                expanded: false,
                details: {
                  intro:
                    "Pakistan needs comprehensive land reforms and resource redistribution to eliminate monopolies and create economic opportunities for all citizens:",
                  guidelines: [
                    {
                      title: "Land Reform Commission:",
                      description:
                        "Establish an independent commission to identify and reclaim illegally acquired land and redistribute it to landless farmers and indigenous communities.",
                    },
                    {
                      title: "Break Monopolies:",
                      description:
                        "Implement anti-monopoly laws to prevent concentration of resources in few hands and promote fair competition across all sectors of the economy.",
                    },
                    {
                      title: "Resource Redistribution:",
                      description:
                        "Create transparent mechanisms for equitable distribution of national resources across all provinces and regions of Pakistan.",
                    },
                  ],
                },
              },
              {
                id: "economy-charter",
                title:
                  "A Charter of Economy Should Be Signed and Supported by All Political Parties, Establishment, and Institutions.",
                description:
                  "A Charter of Economy Should Be Signed and Supported by All Political Parties, Establishment, and Institutions.",
                rank: "Ranked #3",
                expanded: false,
                details: {
                  intro:
                    "Pakistan needs a unified economic vision that transcends political differences and provides stability for long-term growth:",
                  guidelines: [
                    {
                      title: "Collaborative Economic Framework:",
                      description:
                        "Develop a 15-year economic framework with input from all political parties, military, judiciary, and civil society that remains consistent regardless of which party is in power.",
                    },
                    {
                      title: "Tax Reform and Revenue Generation:",
                      description:
                        "Implement progressive taxation, expand the tax base, and eliminate exemptions for powerful groups to ensure all citizens contribute fairly to national development.",
                    },
                    {
                      title: "Investment Protection:",
                      description:
                        "Create legal safeguards to protect domestic and foreign investments from political instability, ensuring economic policies remain consistent across government changes.",
                    },
                  ],
                },
              },
            ],
          },
          {
            id: "establishment",
            name: "Pakistan Establishment (Army, Agencies)",
            partyNumber: 2,
            logo: "/placeholder.svg?height=80&width=80",
            solutions: [
              {
                id: "national-security-charter",
                title:
                  'Establish a National Security Charter and the Rule of Two "Yes" and one "No" on National Security Matters of Pakistan.',
                description:
                  'Establish a National Security Charter and the Rule of Two "Yes" and one "No" on National Security Matters of Pakistan.',
                rank: "Ranked #1",
                expanded: false,
                details: {
                  intro:
                    "Pakistan needs a more balanced approach to national security decisions that incorporates civilian oversight while respecting military expertise:",
                  guidelines: [
                    {
                      title: "National Security Council Reform:",
                      description:
                        "Restructure the National Security Council to include equal representation from military leadership, elected civilian government, and independent security experts.",
                    },
                    {
                      title: "Two-Consensus Rule:",
                      description:
                        "Implement a system where major security decisions require agreement from at least two of the three main stakeholders: military leadership, civilian government, and parliament.",
                    },
                    {
                      title: "Transparency in Security Affairs:",
                      description:
                        "Establish appropriate mechanisms for parliamentary oversight of security operations while protecting classified information necessary for national security.",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: "2",
        slug: "create-permanent-peace-strengthen-democracies-in-israel-and-palestine",
        featuredImage: {
          asset: {
            url: "/placeholder.svg?height=400&width=600",
          },
        },
        gallery: [
          {
            type: "image" as const,
            image: {
              asset: {
                url: "/placeholder.svg?height=500&width=800&text=Modern+Green+Chair",
              },
            },
          },
          {
            type: "image" as const,
            image: {
              asset: {
                url: "/placeholder.svg?height=500&width=800&text=Modern+Green+Chair",
              },
            },
          },
        ],
        title:
          "Create Permanent Peace & Strengthen Democracies In Israel & Palestine",
        category: "Peace",
        description: "Stand For Peace And Democracy",
        link: "/campaigns/create-permanent-peace-strengthen-democracies-in-israel-and-palestine",
        raisedPledges: 6500,
        goalPledges: 10000,
        commitmentText:
          "I commit my vote for peace and will support political parties & political solutions based on dialogue.",
        media: [
          {
            type: "image" as const,
            src: "/placeholder.svg?height=500&width=800&text=Peace+Efforts",
            alt: "Peace efforts in the region",
          },
          {
            type: "image" as const,
            src: "/placeholder.svg?height=500&width=800&text=Democracy+Building",
            alt: "Democracy building initiatives",
          },
          {
            type: "video" as const,
            src: "/pledge4peace_hero_video.mp4",
            alt: "Peace initiatives video",
          },
        ],
        contentText: {
          title: "Building Lasting Peace in the Middle East",
          paragraphs: [
            "The conflict between Israel and Palestine has spanned generations, causing immense suffering on both sides. Despite numerous peace initiatives and agreements, a sustainable resolution remains elusive. The complexity of historical claims, religious significance, territorial disputes, and security concerns has made this one of the world's most challenging conflicts to resolve.",
            "While political leaders often focus on differences, ordinary citizens on both sides consistently express their desire for peace, security, and the opportunity to live normal lives. Tourism and economic cooperation have shown promising results in fostering understanding and mutual respect between communities.",
            "International investment and tourism can play a crucial role in building economic interdependence, which is a foundation for lasting peace. When communities prosper together, the incentives for cooperation increase dramatically. Our campaign proposes a framework where both Israeli and Palestinian societies can benefit from increased tourism and investment while working toward democratic values that respect the rights and dignity of all people in the region.",
          ],
        },
        conference: {
          title: "Path to Peace: Israel & Palestine Virtual Conference",
          date: "October 24, 2024",
          time: "9:00 AM EDT",
          description:
            "Reserve a free spot today for this groundbreaking online event dedicated to fostering lasting peace in the region.",
          about:
            "Join us for a groundbreaking online event dedicated to fostering lasting peace in one of the world's most complex regions. This conference brings together renowned experts, passionate activists, and dedicated peacemakers to explore innovative solutions and strategies for ending the Israel-Palestine conflict. Through open dialogue and collaborative efforts, we aim to build bridges of understanding and create a roadmap to a peaceful coexistence. This is your chance to be part of a historic conversation and contribute to shaping a brighter future for both Israel and Palestine.",
          images: {
            banner:
              "/placeholder.svg?height=400&width=800&text=Jerusalem+Landscape",
            gallery: [
              {
                src: "/placeholder.svg?height=200&width=400&text=Peace+Activists",
                alt: "Peace activists with Israeli and Palestinian flags",
              },
              {
                src: "/placeholder.svg?height=200&width=400&text=Protest",
                alt: "Protesters with flags advocating for peace",
              },
              {
                src: "/placeholder.svg?height=200&width=400&text=Gaza+Destruction",
                alt: "Children amid destruction in Gaza",
              },
              {
                src: "/placeholder.svg?height=200&width=400&text=Palestinians+In+Crisis",
                alt: "Palestinian families amid destruction",
              },
            ],
          },
        },
        partySolutions: [
          {
            id: "democratic-governance",
            name: "Democratic Governance",
            partyNumber: 1,
            logo: "/placeholder.svg?height=80&width=80",
            solutions: [
              {
                id: "two-state-solution",
                title:
                  "Implement a Two-State Solution with Clear Borders and Security Guarantees",
                description:
                  "Implement a Two-State Solution with Clear Borders and Security Guarantees",
                rank: "Ranked #1",
                expanded: false,
                details: {
                  intro:
                    "A comprehensive two-state solution is vital for sustainable peace in the region:",
                  guidelines: [
                    {
                      title: "Defined Borders and Territories:",
                      description:
                        "Establish internationally recognized borders that respect both Israeli and Palestinian territorial integrity, with equitable land swaps where necessary.",
                    },
                    {
                      title: "Jerusalem Status:",
                      description:
                        "Create a shared administration for Jerusalem that respects the holy sites of all religions and provides access for all worshippers.",
                    },
                    {
                      title: "Security Arrangements:",
                      description:
                        "Develop robust security protocols that protect both Israeli and Palestinian citizens from terrorism and violence, with international monitoring mechanisms.",
                    },
                  ],
                },
              },
              {
                id: "economic-cooperation",
                title: "Establish Economic Cooperation and Shared Resources",
                description:
                  "Establish Economic Cooperation and Shared Resources",
                rank: "Ranked #2",
                expanded: false,
                details: {
                  intro:
                    "Economic interdependence is key to sustainable peace:",
                  guidelines: [
                    {
                      title: "Joint Economic Zones:",
                      description:
                        "Create special economic zones that employ citizens from both states and foster business cooperation across borders.",
                    },
                    {
                      title: "Water Resource Sharing:",
                      description:
                        "Develop equitable agreements for sharing water resources, with conservation and sustainable management at the forefront.",
                    },
                    {
                      title: "International Trade Partnerships:",
                      description:
                        "Form joint trade agreements with other nations that benefit both Israeli and Palestinian economies.",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Get about page data
 * @param slug - Identifier for which about page to retrieve
 *
 * Future implementation:
 * This will make a fetch request to your API:
 * return fetch(`${API_BASE_URL}/about/${slug}`).then(res => res.json())
 */
export async function getAbout(slug: string): Promise<AboutPage> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock data based on slug
  return (
    MOCK_DATA.about[slug as keyof typeof MOCK_DATA.about] || {
      title: `About ${slug}`,
      content: "This page is under construction.",
    }
  );
}

/**
 * Get all possible about page slugs
 * For use with generateStaticParams if you add dynamic [slug] routes
 *
 * Future implementation:
 * return fetch(`${API_BASE_URL}/about/slugs`).then(res => res.json())
 */
export async function getAboutSlugs() {
  return Object.keys(MOCK_DATA.about).map((slug) => ({ slug }));
}

/**
 * Get all available campaigns
 *
 * Future implementation:
 * return fetch(`${API_BASE_URL}/campaigns`).then(res => res.json())
 */
export async function getCampaigns(): Promise<Campaign[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock data
  return MOCK_DATA.campaigns.all;
}

/**
 * Get a specific campaign by slug with its solutions
 * @param slug - Identifier for which campaign to retrieve
 *
 * Future implementation:
 * return fetch(`${API_BASE_URL}/campaigns/${slug}`).then(res => res.json())
 */
export async function getCampaignBySlug(
  slug: string
): Promise<CampaignWithSolutions | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find campaign by slug
  const campaign = MOCK_DATA.campaigns.all.find((c) => c.slug === slug);

  // Return campaign or null if not found
  return campaign || null;
}

/**
 * Get all campaign slugs
 * For use with generateStaticParams in dynamic routes
 *
 * Future implementation:
 * return fetch(`${API_BASE_URL}/campaigns/slugs`).then(res => res.json())
 */
export async function getCampaignSlugs() {
  return MOCK_DATA.campaigns.all.map((campaign) => ({ slug: campaign.slug }));
}

/**
 * Get party solutions for a specific campaign
 * @param campaignSlug - Identifier for which campaign's solutions to retrieve
 *
 * Future implementation:
 * return fetch(`${API_BASE_URL}/campaigns/${campaignSlug}/solutions`).then(res => res.json())
 */
export async function getCampaignSolutions(
  campaignSlug: string
): Promise<PartySolutions[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find campaign by slug
  const campaign = MOCK_DATA.campaigns.all.find(
    (c) => c.slug === campaignSlug
  ) as CampaignWithSolutions;

  // Return solutions or empty array if not found
  return campaign?.partySolutions || [];
}

export async function getCampaignSolutionById(
  id: string
): Promise<Solution | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find campaign containing the solution
  const campaign = MOCK_DATA.campaigns.all.find((c) =>
    c.partySolutions?.some((p) => p.solutions.some((s) => s.id === id))
  );

  // Find and return the specific solution
  if (campaign && campaign.partySolutions) {
    for (const party of campaign.partySolutions) {
      const solution = party.solutions.find((s) => s.id === id);
      if (solution) {
        return solution;
      }
    }
  }

  return null;
}
