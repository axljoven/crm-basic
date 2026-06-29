-- CRM Basic — Run this in Supabase SQL Editor (once)
-- Project: crm-basic

-- People: one row per person, deduplicated by email
CREATE TABLE IF NOT EXISTS people (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  company text,
  role text,
  source_site text,
  ok_to_contact boolean DEFAULT false,
  attributes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contacts: inquiry pipeline
CREATE TABLE IF NOT EXISTS contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id uuid REFERENCES people(id) ON DELETE CASCADE,
  type text CHECK (type IN (
    'landing_page_quote',
    'custom_ui_dev',
    'site_upload',
    'multipage_website_quote',
    'package_inquiry'
  )),
  subject text,
  message text,
  source text DEFAULT 'contact_form',
  status text DEFAULT 'new_lead' CHECK (status IN (
    'new_lead', 'contacted', 'discovery_call', 'proposal', 'won', 'lost'
  )),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- activity_log: every status change
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  person_id uuid REFERENCES people(id) ON DELETE CASCADE,
  from_status text,
  to_status text,
  actor text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Orders: what people bought
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id uuid REFERENCES people(id) ON DELETE CASCADE,
  product_name text,
  amount_cents integer,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Auto-update updated_at on people
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS people_updated_at ON people;
CREATE TRIGGER people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
