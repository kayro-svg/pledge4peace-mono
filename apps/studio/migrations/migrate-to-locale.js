const { createClient } = require('@sanity/client')
require('dotenv').config()

if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN env var is missing. Aborting.')
    process.exit(1)
}

/**
 * Sanity client configured for write operations.
 *
 * IMPORTANT:  Set SANITY_API_TOKEN in your environment (RW token).
 */
const client = createClient({
    projectId: 'f5zk7i1f', // update if you changed your project ID
    dataset: 'production',
    token: 'skWohs9pc5G8ezSbOuVlULtSvdmLGitelC9aYUeOGrMuJUEZXed6Ngr9ks0XM2TWdIQuxTCeW4KrCSo7fQVZ5sQKickhb8DNaoxc9UqKtnas7O8QGrnAN1qmPyxxZbsPV2wWNVeu95rSorLrVSLcJsOsUWxY196MkmstzQHXIaH89DEm6tt8', // Required for write operations
    useCdn: false,
    apiVersion: '2025-07-31',
})

/**
 * Array of GROQ paths you need to migrate from a plain string to
 * a localeString/localeText object.  Fill this list with every field
 * you changed in your schema.
 */
const FIELDS = [
    'heroSection.heroHeading',
    'heroSection.heroSubheading',
    'whoWeAreSection.whoWeAreHeading',
    // 👉  Add more paths here as needed
]

// Extra fields inside the Campaign document (handled below programmatically)
const CAMPAIGN_SIMPLE_FIELDS = [
    'title',
    'description',
    'solutionsSection.heading',
    'solutionsSection.subheading',
]

/**
 * Helper to turn a plain string into a locale object (en only).
 */
function toLocale(value) {
    return typeof value === 'string' ? { en: value } : value
}

async function migrateCampaign(doc, patch) {
    let changed = false

    // 1. Simple dotted paths
    for (const path of CAMPAIGN_SIMPLE_FIELDS) {
        const value = path.split('.').reduce((o, k) => o?.[k], doc)
        if (typeof value === 'string') {
            patch = patch.set({ [path]: toLocale(value) })
            changed = true
        }
    }

    // 2. pledgeCommitmentItems (array of strings → array of locale)
    if (Array.isArray(doc.pledgeCommitmentItems)) {
        const newItems = doc.pledgeCommitmentItems.map(toLocale)
        // Only patch if something actually changed
        const diff = newItems.some((item, idx) => item !== doc.pledgeCommitmentItems[idx])
        if (diff) {
            patch = patch.set({ pledgeCommitmentItems: newItems })
            changed = true
        }
    }

    // 3. parties array
    if (Array.isArray(doc.parties)) {
        const newParties = doc.parties.map((party) => {
            if (!party) return party
            const updated = { ...party }
            let innerChanged = false
            if (typeof party.name === 'string') {
                updated.name = toLocale(party.name)
                innerChanged = true
            }
            if (typeof party.description === 'string') {
                updated.description = toLocale(party.description)
                innerChanged = true
            }
            return innerChanged ? updated : party
        })
        const diff = newParties.some((p, idx) => p !== doc.parties[idx])
        if (diff) {
            patch = patch.set({ parties: newParties })
            changed = true
        }
    }

    // 4. solutionsSection.introParagraphs
    if (doc.solutionsSection?.introParagraphs) {
        const newIntro = doc.solutionsSection.introParagraphs.map((block) =>
            typeof block === 'string' ? toLocale(block) : block,
        )
        const diff = newIntro.some((b, idx) => b !== doc.solutionsSection.introParagraphs[idx])
        if (diff) {
            patch = patch.set({ 'solutionsSection.introParagraphs': newIntro })
            changed = true
        }
    }

    return { patch, changed }
}

async function run() {
    // Fetch every document whose _type ends with "Page" – e.g. aboutPage, volunteerPage …
    const docs = await client.fetch(`*[_type match "*Page" || _type == 'campaign']{_id, _type, ...}`)

    console.log(`Encontrados ${docs.length} documentos`)

    for (const doc of docs) {
        let patch = client.patch(doc._id)
        let changed = false

        // Generic fields (for *Page docs)
        for (const path of FIELDS) {
            // Resolve the current value through the dotted path
            const value = path.split('.').reduce((o, k) => o?.[k], doc)

            if (typeof value === 'string') {
                // Replace plain string with locale object. Default language: en
                patch = patch.set({ [path]: { en: value } })
                changed = true
            }
        }

        // Special handling for campaign documents
        if (doc._type === 'campaign') {
            const res = await migrateCampaign(doc, patch)
            patch = res.patch
            changed = changed || res.changed
        }

        if (changed) {
            console.log('→ Actualizando', doc._id)
            await patch.commit()
        }
    }
    console.log('✅ Migración terminada')
}

run().catch(err => {
    console.error(err)
    process.exit(1)
}) 