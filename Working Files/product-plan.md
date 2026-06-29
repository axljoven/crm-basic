# Product plan · CRM Basic

## What we're actually building and why

In one sentence: A CRM that catches every frontend dev inquiry the moment it lands so Axl can follow up on all of them — not just the ones he happened to remember.

Who it's for: Axl as the operator managing his frontend dev pipeline, and the potential clients who reach out asking about landing pages, custom UI, site uploads, multi-page sites, or package details.

What we are deliberately NOT building: no affiliates, no subscriptions, no cohorts, no analytics dashboards, no integrations beyond what's named here. If it isn't load-bearing for capturing and working a lead, it's out.

## The brief (drives every /goal command)

You are my engineering partner for building my CRM today. Build a
Next.js (App Router) + Supabase + Vercel app with two surfaces:
a public marketing site that captures leads, and an /admin CRM.
The /admin section is open and unprotected at first; it gets locked
down with email-and-password Supabase Auth later in the build. Do
not add any auth, login page, or route protection until I explicitly
ask for it.

The CRM has exactly four parts:

- People: a contact directory, one row per person, deduplicated by
  email. Columns: id, email (unique), name, phone, company, role,
  source_site, ok_to_contact, attributes (jsonb), created_at,
  updated_at. The custom attributes I named go inside attributes.
  The keys are my attribute names and the values match the types I
  specified.

- Contacts: an inquiry pipeline. Each inquiry links to a person and
  moves through stages new_lead, contacted, discovery_call,
  proposal, won, lost. Columns: id, person_id, type, subject,
  message, source, status, metadata (jsonb), created_at. The type
  field is constrained to exactly the inquiry types I gave in Q4
  (lowercased).

- activity_log: every status change on a Contacts row writes one row
  here. Columns: id, contact_id, person_id, from_status, to_status,
  actor, note, created_at.

- Orders: what people bought. Columns: id, person_id, product_name,
  amount_cents, currency, status (pending, paid, refunded,
  cancelled), created_at.

- Newsletter: people who opted in to email, tracked by
  people.ok_to_contact = true. No separate table.

Conventions:
- Upsert people by email; never duplicate a person.
- Access Supabase server-side with the service key; never expose
  secrets to the client; keys live in environment variables only.
- Keep it simple: no affiliates, no subscriptions, no cohorts.
- Work one step at a time and wait for my approval before each step.

My business: CRM Basic — frontend dev services (landing pages, custom UI/frontend dev, site uploading, multi-page business sites, package inquiries)
My inquiry types (contacts.type enum): landing_page_quote, custom_ui_dev, site_upload, multipage_website_quote, package_inquiry
My design system: Academic — serious, structured, editorial, trustworthy
My brand colors: #000000 (primary), #FFFFFF (background), #0070F3 (accent)
My custom attributes (people.attributes jsonb keys):
  - how_we_met (string — short typed note)
  - budget_range (enum — "Under $500" | "$500–$2,000" | "$2,000–$5,000" | "$5,000–$10,000" | "$10,000+")
  - follow_up_date (date)
My domain: crm-axl.vercel.app (Vercel-assigned; project name: crm-axl)

## BUILD 1 — Prove the loop

Goal: A stranger can submit an inquiry on the live site and Axl can see that lead inside /admin, on the same day, without anyone touching the database by hand. This closes the exact gap Axl named: emails coming in and getting forgotten because nothing is tracking them.

Scope: the People and Contacts tables with custom attributes wired into the jsonb column; a working contact form on the live marketing site that writes a People row (upserted by email) and a linked Contacts row; one admin login with a single verified account; one admin page that lists incoming leads newest first.

Definition of Done (every box must be true):
- [ ] The contact form is live on crm-axl.vercel.app, not localhost.
- [ ] Submitting it creates exactly one People row and one linked Contacts row, deduplicated by email on repeat submits.
- [ ] how_we_met, budget_range, and follow_up_date are saved correctly inside attributes.
- [ ] A new Contacts row lands in status new_lead.
- [ ] Axl can log in to /admin with his one seeded account.
- [ ] The admin leads page shows the submission within seconds, newest first.
- [ ] Axl personally runs the full flow once: submit as a visitor, log in, see it.

Success Criteria (how we know it's good, not just done):
- From a cold start, submit to visible in under 60 seconds.
- Two submissions from the same email produce one person, not two.
- Axl can read the lead's name, inquiry type, message, and all three custom attributes on the admin page without opening Supabase.
- No lead can land and go unseen — the failure mode Axl named is structurally impossible.

## BUILD 2 — Make it the system I run the business from

Goal: Turn the proven loop into the place Axl actually manages relationships and money. After this, he works leads, records what clients bought, and keeps his newsletter list entirely from /admin behind his login — and every new inquiry gets an automatic confirmation email. This is what makes the ninety-day win real: zero missed follow-ups at 5–10 inquiries a week, with a full pipeline he can review anytime.

Scope: the rest of the /admin back end behind Axl's login: the full People directory, all inquiries with working pipeline stages, the Orders list, and the Newsletter list (ok_to_contact = true). Plus Resend wired so a confirmation email fires on form submit. Every Contacts status change writes an activity_log row.

Definition of Done (every box must be true):
- [ ] All four parts (People, Contacts, Orders, Newsletter) are visible and usable in /admin, and all of /admin sits behind Axl's login.
- [ ] Axl can move a Contacts row through new_lead → contacted → discovery_call → proposal → won or lost from the interface.
- [ ] Each status change writes one activity_log row with from_status, to_status, and actor.
- [ ] The People directory is searchable and shows how_we_met, budget_range, and follow_up_date.
- [ ] Axl can add an Orders row against a person and see it on their record.
- [ ] The Newsletter list shows everyone with ok_to_contact = true.
- [ ] Resend is connected, the sending domain is verified, and a real confirmation email arrives after a form submit.

Success Criteria (how we know it's good, not just done):
- Axl can run a lead from first inquiry to won without leaving /admin or touching the database.
- A person's full history (their inquiries, status changes, and orders) is visible in one place.
- A test submission produces a confirmation email in the inbox, not spam, with a verified Resend sender domain.
- Nothing in /admin is reachable without logging in.
- At 5–10 inquiries a week, this keeps up without Axl dropping to the database by hand.
