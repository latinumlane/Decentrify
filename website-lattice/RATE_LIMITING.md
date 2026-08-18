# Abuse protection and rate limiting

The public site is static. Its only write surface is the two Netlify Forms
(`contact` and `homepage-contact`). Netlify applies its server-side form spam
filter before a submission is delivered, and both forms have honeypot fields.

For a production launch, enable these Netlify controls in the site dashboard:

1. **Forms → Spam filters:** enable Akismet (if available for the account) and
   review the spam submission folder.
2. **Forms → Notifications:** set a low notification threshold so a burst can
   be caught quickly without forwarding every malicious submission.
3. **Site configuration → Access & security:** leave Netlify's managed DDoS
   protection enabled. This protects the static delivery layer; it is separate
   from application-form filtering.

If a strict per-IP submission limit is required (for example, five contact
submissions per 15 minutes), put the form endpoint behind a stateful edge
service such as Cloudflare WAF/Rate Limiting or an authenticated serverless
handler backed by a durable store. A client-side limiter is deliberately not
used: it can be bypassed and would provide only false reassurance.
