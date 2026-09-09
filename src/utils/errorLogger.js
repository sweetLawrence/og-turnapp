/**
 * Minimal error logger — sends a row to Supabase via the REST API.
 * No dependency on supabase-js, just fetch. Never throws: any failure
 * here is swallowed so logging can never itself break the page.
 *
 * NOTE: intentionally does NOT use navigator.sendBeacon. Supabase's
 * PostgREST returns `Access-Control-Allow-Origin: *`, and sendBeacon
 * sends as a credentialed cross-origin request in some browsers —
 * wildcard + credentials is disallowed by the CORS spec, so the
 * browser blocks it outright. Plain fetch (credentials omitted by
 * default for cross-origin requests) does not hit this problem, and
 * since loadEvent's error path calls navigate('/') — a client-side
 * React Router transition, not a real page unload — there's no risk
 * of the request being cut off, so sendBeacon's unload-survival
 * benefit isn't needed here anyway.
 */
const SUPABASE_URL = 'https://daiizojjrouvhtrdgtzb.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWl6b2pqcm91dmh0cmRndHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mjg3ODIsImV4cCI6MjEwMzQwNDc4Mn0.7wrDoZC1cv5-JqANZSZAeNDH3LRAIpHxiD-vfWp6EI4'

export function logClientError({ eventId, error, extra } = {}) {
  try {
    const row = {
      event_id: eventId != null ? String(eventId) : null,
      error_name: error?.name || null,
      error_message: error?.message || String(error) || null,
      status_code: error?.response?.status ?? null,
      is_network_error: error ? !error?.response : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      page_url: typeof location !== 'undefined' ? location.href : null,
      extra: extra ? JSON.stringify(extra) : null
    }

    fetch(`${SUPABASE_URL}/rest/v1/client_error_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row),
      keepalive: true
      // credentials intentionally left at default ('same-origin'), so
      // no cookies are sent cross-origin and Supabase's wildcard CORS
      // header is accepted by the browser.
    }).catch(() => {
      // Swallow silently — logging must never surface an error to the user.
    })
  } catch (e) {
    // Logging must never throw.
  }
}