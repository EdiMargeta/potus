-- POTUS PARADOX - Supabase Schema
-- Run this in your Supabase SQL editor

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL CHECK (category IN ('threat','nato','promise','reversal','economic','legal','victory')),
  date DATE NOT NULL,
  source_url TEXT,
  source_label TEXT,
  severity INTEGER DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
  president TEXT NOT NULL DEFAULT 'trump',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promises table
CREATE TABLE promises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('economy','immigration','foreign','domestic','military','healthcare','other')),
  date_made DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('kept','broken','pending','reversed')),
  notes TEXT,
  source_url TEXT,
  president TEXT NOT NULL DEFAULT 'trump',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contradictions table (links two events)
CREATE TABLE contradictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id_a UUID REFERENCES events(id) ON DELETE CASCADE,
  event_id_b UUID REFERENCES events(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('absurd','outrageous','unbelievable','classic')),
  count INTEGER DEFAULT 0,
  UNIQUE(event_id, type)
);

-- Indexes
CREATE INDEX idx_events_date ON events(date DESC);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_president ON events(president);
CREATE INDEX idx_promises_status ON promises(status);
CREATE INDEX idx_comments_event_id ON comments(event_id);
CREATE INDEX idx_reactions_event_id ON reactions(event_id);

-- Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE contradictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- FIX: Removed duplicate "Admin all" policies. The backend uses the service_role key
-- which bypasses RLS entirely — separate admin policies are not needed and cause conflicts.
-- These policies cover all public-facing operations:
CREATE POLICY "Public read events"          ON events        FOR SELECT USING (true);
CREATE POLICY "Public read promises"        ON promises      FOR SELECT USING (true);
CREATE POLICY "Public read contradictions"  ON contradictions FOR SELECT USING (true);
CREATE POLICY "Public read comments"        ON comments      FOR SELECT USING (true);
CREATE POLICY "Public read reactions"       ON reactions     FOR SELECT USING (true);
CREATE POLICY "Public insert comments"      ON comments      FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert reactions"     ON reactions     FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update reactions"     ON reactions     FOR UPDATE USING (true);
CREATE POLICY "Public update comments"      ON comments      FOR UPDATE USING (true);

-- Sample data
INSERT INTO events (title, summary, body, category, date, source_url, source_label, severity) VALUES
(
  'Trump Threatens to Seize Greenland by Force',
  'Trump refused to rule out using military force to take control of Greenland from Denmark, a NATO ally.',
  'In a press conference at Mar-a-Lago, President Trump declined to rule out military or economic coercion to acquire Greenland, stating it was "an absolute necessity" for US national security. Denmark, a NATO member, called the statement "unacceptable." The remarks sent shockwaves through European capitals and raised questions about US commitments to its allies.',
  'threat', '2025-01-07', 'https://www.bbc.com', 'BBC News', 5
),
(
  'Trump Declares NATO "Obsolete", Says Europe Never Helps USA',
  'Trump renewed attacks on NATO, calling it outdated and claiming European members never fulfill Article 5 obligations.',
  'During a speech in Washington, Trump stated that NATO was "essentially useless" and that European nations had "never once helped the United States when we needed it." He questioned whether the US should remain in the alliance at all, sending allied governments scrambling to respond.',
  'nato', '2025-01-15', 'https://www.reuters.com', 'Reuters', 4
),
(
  'US Strikes Iran — Trump Declares "Total Victory"',
  'Following US airstrikes on Iranian nuclear facilities, Trump declared a complete and total victory over Iran.',
  'The US military conducted targeted airstrikes on three Iranian nuclear facilities. Trump appeared on Truth Social minutes later declaring total victory. No Iranian response had yet occurred at time of posting. Defense officials later clarified that battle damage assessment was still ongoing.',
  'victory', '2025-03-01', 'https://www.nytimes.com', 'NY Times', 5
),
(
  'Trump Asks NATO to Help Contain Iranian Retaliation',
  'Days after calling NATO useless, Trump formally requested NATO allies provide military support following Iran strikes.',
  'The White House sent formal requests to NATO member states asking for naval and air support in the Persian Gulf, citing Article 5 collective defense provisions — the same provisions Trump had weeks earlier called meaningless. European allies expressed surprise at the request given recent remarks.',
  'nato', '2025-03-05', 'https://www.politico.com', 'Politico', 5
),
(
  'Trump Announces 25% Tariff on All Canadian Imports',
  'Trump signed an executive order imposing sweeping tariffs on Canadian goods, calling Canada "an economic enemy."',
  'The tariffs cover all Canadian imports including auto parts, lumber, and dairy. Canadian PM announced retaliatory tariffs immediately. Markets dropped 2.3% on the news. Auto industry analysts warned of significant price increases for US consumers within months.',
  'economic', '2025-02-01', 'https://www.wsj.com', 'Wall Street Journal', 4
);

INSERT INTO promises (text, category, date_made, status, notes, source_url) VALUES
('End the war in Ukraine within 24 hours of taking office', 'foreign', '2024-09-25', 'broken', 'Made repeatedly on the campaign trail. War continues months into presidency.', 'https://www.bbc.com'),
('Deport all undocumented immigrants on day one', 'immigration', '2024-10-10', 'reversed', 'Later clarified to "prioritize criminals first" — a significant walk-back of the original promise.', 'https://www.nytimes.com'),
('Bring down grocery prices immediately', 'economy', '2024-08-15', 'broken', 'Grocery inflation continued to rise in Q1 2025 following tariff announcements.', 'https://www.reuters.com'),
('Withdraw US from the Paris Climate Agreement', 'domestic', '2024-11-01', 'kept', 'Executive order signed on day one of presidency.', 'https://www.politico.com'),
('Declassify JFK assassination documents', 'domestic', '2024-09-01', 'kept', 'Documents released in full in February 2025.', 'https://www.reuters.com'),
('Eliminate the Department of Education', 'domestic', '2024-10-20', 'pending', 'Executive order signed but faces congressional and legal challenges.', 'https://www.wsj.com'),
('Build a wall and make Mexico pay for it', 'immigration', '2024-08-01', 'broken', 'Construction restarted but Mexico has made no payments.', 'https://www.bbc.com');

-- Seed the NATO contradiction
INSERT INTO contradictions (event_id_a, event_id_b, description)
SELECT
  (SELECT id FROM events WHERE title LIKE '%NATO%Obsolete%' LIMIT 1),
  (SELECT id FROM events WHERE title LIKE '%NATO to Help%' LIMIT 1),
  'Called NATO useless and said Europe never helps the US — then formally invoked NATO to request European military assistance just weeks later.'
WHERE
  (SELECT id FROM events WHERE title LIKE '%NATO%Obsolete%' LIMIT 1) IS NOT NULL
  AND (SELECT id FROM events WHERE title LIKE '%NATO to Help%' LIMIT 1) IS NOT NULL;

-- Seed reactions
INSERT INTO reactions (event_id, type, count)
SELECT id, 'absurd',       floor(random() * 200 + 50)::int  FROM events
UNION ALL
SELECT id, 'outrageous',   floor(random() * 300 + 100)::int FROM events
UNION ALL
SELECT id, 'unbelievable', floor(random() * 150 + 30)::int  FROM events
UNION ALL
SELECT id, 'classic',      floor(random() * 250 + 80)::int  FROM events;
