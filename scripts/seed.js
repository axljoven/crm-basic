// Seed 100 sample inquiries across the past 7 days
// Run: node scripts/seed.js

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.local values first.')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation',
}

const TYPES = ['landing_page_quote', 'custom_ui_dev', 'site_upload', 'multipage_website_quote', 'package_inquiry']
const STATUSES = ['new_lead', 'new_lead', 'new_lead', 'contacted', 'contacted', 'discovery_call', 'proposal', 'won', 'lost']
const BUDGETS = ['Under $500', '$500 – $2,000', '$2,000 – $5,000', '$5,000 – $10,000', '$10,000+']
const HOW_MET = ['LinkedIn', 'Referral', 'Google', 'Instagram', 'Facebook', 'Word of mouth', 'Portfolio site', null]

const NAMES = [
  'Maria Santos', 'Jake Rivera', 'Carla Reyes', 'Marco Dela Cruz', 'Ana Gomez',
  'Luis Torres', 'Sofia Mendoza', 'Diego Ramirez', 'Isabel Flores', 'Carlos Lim',
  'Patricia Chan', 'Roberto Tan', 'Elena Sy', 'Miguel Ong', 'Rosa Garcia',
  'Fernando Cruz', 'Camille Lee', 'Andres Go', 'Jasmine Chua', 'Ryan Santos',
  'Melissa Ramos', 'Kevin Yu', 'Angela Reyes', 'Bryan Ang', 'Christine Lim',
  'Mark Villanueva', 'Stephanie Ko', 'Paul Bautista', 'Nicole Dela Rosa', 'Eric Tan',
  'Hannah Kim', 'Joshua Uy', 'Samantha Yap', 'Daniel Castro', 'Laura Medina',
  'Aaron Domingo', 'Bianca Ocampo', 'Christian Velasco', 'Diana Pascual', 'Edwin Salazar',
  'Francis Aquino', 'Grace Hernandez', 'Henry Marquez', 'Iris Aguilar', 'Julius Navarro',
  'Karen Serrano', 'Lance Guevara', 'Monica Ibarra', 'Nathan Mercado', 'Olivia Padilla',
  'Patrick Delos Santos', 'Quinn Magsaysay', 'Rachel Espino', 'Samuel Magno', 'Teresa Buenaventura',
  'Ulysses Alcantara', 'Vivian Montoya', 'Walter Coronel', 'Xandra Soriano', 'Yolanda Mendez',
  'Zach Evangelista', 'Abby Corpuz', 'Ben Tupaz', 'Cathy Macapagal', 'Dave Aldaba',
  'Emma Bondoc', 'Fred Camacho', 'Gina Dizon', 'Harold Enriquez', 'Irene Fernandez',
  'Joel Galang', 'Kate Hilario', 'Leo Ignacio', 'Mia Jacinto', 'Noel Katipunan',
  'Opal Lorenzo', 'Peter Manalac', 'Queenie Natividad', 'Rex Orlino', 'Sally Panganiban',
  'Tony Quirino', 'Uma Resurreccion', 'Victor Santiago', 'Wendy Teodoro', 'Xavi Umali',
  'Ysa Valdez', 'Zeus Wijangco', 'Alice Yamamoto', 'Bob Zamora', 'Coleen Abrera',
  'Dennis Beltran', 'Eve Capistrano', 'Gil Datingaling', 'Hope Estrada', 'Ian Fajardo',
  'Joy Galvez', 'Karl Hizon', 'Lily Imperial', 'Max Jimenez', 'Nina Kabigting',
]

const COMPANIES = [
  'Acme Corp', 'BrightStart PH', 'Nova Digital', 'Peak Solutions', 'Riser Studio',
  'Spark Agency', 'Tidal Works', 'Urban Desk', 'Velo Creative', 'Zest Media',
  null, null, null, null, null,
]

const MESSAGES = [
  'I need a landing page for my new product launch. Looking for something clean and fast.',
  'We want a full website redesign. Currently on WordPress but want something more modern.',
  'I have a Figma design ready and need it built in React. How long would that take?',
  'Looking for someone to upload and deploy my existing site to a proper host.',
  'Need a quote for a 5-page business site. Home, about, services, portfolio, contact.',
  'I want a custom UI for my SaaS dashboard. We have a design system already.',
  'My site is stuck on an old server. Need help migrating to Vercel.',
  'Looking for a frontend dev for a 2-week project. Budget is flexible.',
  'Need a landing page with a waitlist form. Nothing too fancy.',
  'We need a complete redesign of our company site. About 8 pages total.',
  'I want to revamp my portfolio. Looking for a clean, minimal design.',
  'Our marketing team needs a campaign landing page by end of month.',
  'I have a Next.js project that needs someone to finish the frontend.',
  'Looking for quotes on a multi-page site for our restaurant.',
  'Need a simple one-pager for my consulting business.',
  'We want interactive animations on our homepage. Is that something you do?',
  'Looking for a developer to maintain and update our existing site monthly.',
  'Need help connecting a domain and deploying. The site is already built.',
  'We want a site that works well on mobile. Ours is broken on phones.',
  'I need a personal brand site — bio, work samples, contact form.',
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function randomDate(daysAgo) {
  const now = Date.now()
  const start = now - daysAgo * 24 * 60 * 60 * 1000
  return new Date(start + Math.random() * (now - start)).toISOString()
}

async function supabaseFetch(path, method, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function seed() {
  console.log('Seeding 100 inquiries...')
  let inserted = 0

  for (let i = 0; i < 100; i++) {
    const name = NAMES[i % NAMES.length]
    const email = `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}.${i}@example.com`
    const createdAt = randomDate(7)

    // Upsert person
    const [person] = await supabaseFetch('people?on_conflict=email', 'POST', {
      email,
      name,
      phone: Math.random() > 0.5 ? `+63 9${Math.floor(100000000 + Math.random() * 900000000)}` : null,
      company: pick(COMPANIES),
      source_site: 'crm-axl.vercel.app',
      ok_to_contact: Math.random() > 0.4,
      attributes: {
        how_we_met: pick(HOW_MET),
        budget_range: pick(BUDGETS),
        follow_up_date: Math.random() > 0.6 ? randomDate(-3).split('T')[0] : null,
      },
      created_at: createdAt,
      updated_at: createdAt,
    })

    // Insert contact
    await supabaseFetch('contacts', 'POST', {
      person_id: person.id,
      type: pick(TYPES),
      subject: `Inquiry from ${name}`,
      message: pick(MESSAGES),
      source: 'contact_form',
      status: pick(STATUSES),
      created_at: createdAt,
    })

    inserted++
    if (inserted % 10 === 0) console.log(`  ${inserted}/100`)
  }

  console.log('Done. 100 inquiries seeded.')
}

seed().catch(console.error)
