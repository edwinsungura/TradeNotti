/**
 * Email-list sync for waitlist signups.
 *
 * Provider-agnostic and fully optional: with no env configured this is a no-op,
 * so the waitlist works on day one and you can connect a provider later by
 * setting env vars only — no code change.
 *
 * Select a provider with EMAIL_PROVIDER:
 *   - "mailchimp" — MAILCHIMP_API_KEY (e.g. "abc...-us21"), MAILCHIMP_AUDIENCE_ID
 *   - "convertkit" — CONVERTKIT_API_KEY, CONVERTKIT_FORM_ID
 *   - "webhook"    — EMAIL_WEBHOOK_URL (receives a JSON POST of the signup)
 *
 * Every call is best-effort: failures are logged, never thrown, and bounded by
 * a short timeout so a slow provider can't stall the signup response.
 */

export type EmailSignup = {
  email: string;
  refCode: string;
  referredBy: string | null;
  source: string | null;
};

const TIMEOUT_MS = 4000;

async function postJSON(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

async function syncMailchimp(s: EmailSignup): Promise<void> {
  const key = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!key || !audienceId) {
    console.warn("[email-list] mailchimp selected but API key / audience id missing");
    return;
  }
  // Datacenter is the suffix of the API key, e.g. "...-us21".
  const dc = key.split("-")[1];
  if (!dc) {
    console.warn("[email-list] mailchimp API key has no datacenter suffix");
    return;
  }
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`;
  const res = await postJSON(
    url,
    {
      email_address: s.email,
      status: "subscribed",
      tags: ["waitlist"],
      merge_fields: { REFCODE: s.refCode, REFBY: s.referredBy ?? "", SOURCE: s.source ?? "" },
    },
    { Authorization: `Basic ${Buffer.from(`any:${key}`).toString("base64")}` },
  );
  // 400 with "Member Exists" is an expected, harmless re-submit.
  if (!res.ok && res.status !== 400) {
    console.error(`[email-list] mailchimp ${res.status}: ${await res.text()}`);
  }
}

async function syncConvertKit(s: EmailSignup): Promise<void> {
  const key = process.env.CONVERTKIT_API_KEY;
  const formId = process.env.CONVERTKIT_FORM_ID;
  if (!key || !formId) {
    console.warn("[email-list] convertkit selected but API key / form id missing");
    return;
  }
  const res = await postJSON(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
    api_key: key,
    email: s.email,
    fields: { ref_code: s.refCode, referred_by: s.referredBy ?? "", source: s.source ?? "" },
  });
  if (!res.ok) {
    console.error(`[email-list] convertkit ${res.status}: ${await res.text()}`);
  }
}

async function syncWebhook(s: EmailSignup): Promise<void> {
  const url = process.env.EMAIL_WEBHOOK_URL;
  if (!url) {
    console.warn("[email-list] webhook selected but EMAIL_WEBHOOK_URL missing");
    return;
  }
  const secret = process.env.EMAIL_WEBHOOK_SECRET;
  const res = await postJSON(
    url,
    { event: "waitlist.signup", ...s },
    secret ? { Authorization: `Bearer ${secret}` } : {},
  );
  if (!res.ok) {
    console.error(`[email-list] webhook ${res.status}: ${await res.text()}`);
  }
}

export async function subscribeToEmailList(signup: EmailSignup): Promise<void> {
  const provider = (process.env.EMAIL_PROVIDER ?? "").toLowerCase().trim();
  if (!provider || provider === "none") return; // not configured — no-op

  try {
    switch (provider) {
      case "mailchimp":
        await syncMailchimp(signup);
        break;
      case "convertkit":
        await syncConvertKit(signup);
        break;
      case "webhook":
        await syncWebhook(signup);
        break;
      default:
        console.warn(`[email-list] unknown EMAIL_PROVIDER "${provider}"`);
    }
  } catch (err) {
    // Includes AbortError on timeout — never break the signup over this.
    console.error("[email-list] sync failed:", err);
  }
}
