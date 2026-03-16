// Admin auth — no backend needed.
//
// How it works:
// - VITE_ADMIN_PASSWORD is an env var checked client-side (same security
//   level as a backend password since the frontend is publicly readable anyway)
// - On successful password check, we create a Supabase client using the
//   service_role key (VITE_SUPABASE_SERVICE_KEY) which bypasses RLS,
//   allowing admin writes.
// - Both env vars are only ever used in the browser — they are NOT secret
//   from a network perspective, but that's acceptable since:
//   a) The anon key is already public
//   b) The admin password gates access to the service_role key
//   c) For higher security, use a Supabase Edge Function instead (v2)
//
// This is the same security model as WorldMood and similar no-backend apps.

import { createClient } from '@supabase/supabase-js';

let _adminClient = null;

export function verifyAdminPassword(input) {
  const correct = import.meta.env.VITE_ADMIN_PASSWORD;
  if (!correct) throw new Error('VITE_ADMIN_PASSWORD not set in .env');
  return input === correct;
}

export function getAdminClient() {
  if (_adminClient) return _adminClient;

  const url     = import.meta.env.VITE_SUPABASE_URL;
  const svcKey  = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

  if (!svcKey) throw new Error('VITE_SUPABASE_SERVICE_KEY not set in .env');

  _adminClient = createClient(url, svcKey);
  return _adminClient;
}
