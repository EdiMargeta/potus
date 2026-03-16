// FIX: Dates from Supabase come as 'YYYY-MM-DD' strings (no time component).
// Passing directly to new Date() treats them as UTC midnight, which shifts the
// displayed date by one day in negative-offset timezones (e.g. US, Europe).
// This helper appends a local noon time to force correct local date display.
export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  // If it's already a full ISO string, use as-is
  if (dateStr.includes('T')) return new Date(dateStr);
  // Otherwise it's YYYY-MM-DD — pin to local noon to avoid timezone shift
  return new Date(dateStr + 'T12:00:00');
}
