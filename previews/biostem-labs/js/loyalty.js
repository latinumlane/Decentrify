// js/loyalty.js — BioStem Rewards: points, referrals, and the redemption ladder
//
// Single source of truth for the program's arithmetic. The rewards page, the
// PDP earn line, and the cart all read from here, so the numbers a customer is
// quoted in one place can never disagree with another.
//
// PROTOTYPE: balances and referral codes live in localStorage. A real loyalty
// program needs accounts, a server-side ledger, and order-completion webhooks —
// see LOYALTY-ECONOMICS.md before any of this goes live.

const LOYALTY = {
  name: 'BioStem Rewards',

  /* ── Earning ── */
  earnPerDollar: 1,            // 1 point per $1 spent
  earnOn: 'paid',              // 'paid' = points accrue on what the customer
                               // actually pays, after discounts. 'list' would
                               // accrue on pre-discount value — far more expensive.

  /* ── Redemption ── */
  pointsPerDollar: 30,         // 30 points = $1  →  3.33% back
  redeemLadder: [300, 750, 1500, 3000],
  minRedeem: 300,

  // null = points never expire (as specced). An expiry window is the single
  // biggest lever on program cost — breakage is pure recovered margin, and
  // 12–18 months is the category norm. See LOYALTY-ECONOMICS.md §Breakage.
  pointsExpiryMonths: null,

  /* ── Referrals ── */
  referralSignupPoints: 300,   // to the referrer, per qualified referral
  referralRevenueShare: 0.05,  // 5% of the referred customer's order value,
                               // credited to the referrer as points
  referralFriendDiscount: 0.10,// what the referred friend gets on their first order

  // 'signup'     — credit the 300 as soon as the friend registers (as specced)
  // 'first-order'— credit only after their first completed, non-refunded order
  // 'first-order' is the fraud-resistant option. See LOYALTY-ECONOMICS.md §Fraud.
  referralBonusTrigger: 'signup',

  codePrefix: 'BSL',

  /* ── First-order welcome code ──
     Lives here, not in promo.js, so the ad landing pages — which never load the
     welcome modal — can still redeem a code a visitor arrived with.
     COMMERCIAL: confirm the code exists in the real checkout before launch. */
  welcomeCode: 'RESEARCH10',
  welcomePercent: 10,
};

/* ══════════════════════════  ARITHMETIC  ══════════════════════════ */

/** Points earned on a dollar amount. Always rounded down — never over-promise. */
const pointsFor = d => Math.floor(Math.max(0, d) * LOYALTY.earnPerDollar);

/** Redemption value of a point balance, in dollars. */
const pointsToDollars = p => Math.max(0, p) / LOYALTY.pointsPerDollar;

/** Effective cash-back rate of the earn/redeem pair, as a share of spend. */
const earnRate = () => LOYALTY.earnPerDollar / LOYALTY.pointsPerDollar;

/** Points a referrer receives from one referred order. */
const referralPointsFor = orderTotal =>
  Math.floor(orderTotal * LOYALTY.referralRevenueShare * LOYALTY.pointsPerDollar);

/** The redemption ladder, resolved to dollars. */
const redeemTiers = () => LOYALTY.redeemLadder.map(p => ({ points: p, value: pointsToDollars(p) }));

/** Largest tier a balance can currently cover, or null. */
const tierFor = pts => redeemTiers().filter(t => pts >= t.points).pop() || null;

/** Points still needed to reach the next tier, or null once the ladder is topped. */
function nextTier(pts) {
  const t = redeemTiers().find(x => x.points > pts);
  return t ? { ...t, short: t.points - pts } : null;
}

/* ══════════════════════════  REFERRAL CODE  ══════════════════════════
   Prototype only. A real code must be issued and uniqueness-checked server-side
   at account creation — a client-generated code cannot be trusted or enforced. */
function referralCode() {
  const key = 'biostem_refcode_v1';
  let c = null;
  try { c = localStorage.getItem(key); } catch {}
  if (!c) {
    const A = 'ACDEFHJKLMNPRTUVWXY3479';   // no easily-confused glyphs
    c = LOYALTY.codePrefix + '-' + Array.from({ length: 6 },
      () => A[Math.floor(Math.random() * A.length)]).join('');
    try { localStorage.setItem(key, c); } catch {}
  }
  return c;
}

/* ══════════════════════════  PROTOTYPE LEDGER  ══════════════════════════ */
const Rewards = {
  key: 'biostem_rewards_v1',

  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || { points: 0, log: [] }; }
    catch { return { points: 0, log: [] }; }
  },
  write(v) { try { localStorage.setItem(this.key, JSON.stringify(v)); } catch {} this.paint(); },
  balance() { return this.read().points; },

  /** kind: 'order' | 'referral-signup' | 'referral-share' | 'redeem' */
  credit(points, kind, note) {
    const s = this.read();
    s.points = Math.max(0, s.points + points);
    s.log.unshift({ points, kind, note: note || '', at: Date.now() });
    s.log = s.log.slice(0, 25);
    this.write(s);
    return s.points;
  },

  paint() {
    const n = this.balance();
    document.querySelectorAll('[data-points-balance]').forEach(e => { e.textContent = n.toLocaleString(); });
    document.querySelectorAll('[data-points-value]').forEach(e => { e.textContent = money(pointsToDollars(n)); });
  },
};

/* ══════════════════════════  DISPLAY  ══════════════════════════ */

/** "Earns 157 points — $5.23 toward a future order" */
function earnLine(dollars, cls = 'earn-line') {
  const pts = pointsFor(dollars);
  if (pts <= 0) return '';
  return `<span class="${cls}">${ico('coin')}
    <span>Earns <b>${pts.toLocaleString()} points</b>
    <small>${money(pointsToDollars(pts))} toward a future order</small></span></span>`;
}

/* ══════════════════════════  IDENTITY  ══════════════════════════
   Who the browser thinks it is. Written by the welcome modal on signup, read by
   the cart so a code can be checked against the email that claimed it — including
   on the /bundles/ landing pages, which never load promo.js. */
const Customer = {
  key: 'biostem_customer_v1',
  email() { try { return localStorage.getItem(this.key) || null; } catch { return null; } },
  setEmail(e) { try { localStorage.setItem(this.key, normalizeEmail(e)); } catch {} },
};

/** Fold the aliases that make one inbox look like many.
    Gmail ignores dots and everything after '+', so a@b.com, a.b@gmail.com and
    a+1@gmail.com are the same mailbox. Normalise before storing OR comparing —
    the server must apply the identical rule or the unique index is bypassable. */
function normalizeEmail(raw) {
  const e = String(raw || '').trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 1) return e;
  let local = e.slice(0, at), domain = e.slice(at + 1);
  local = local.split('+')[0];
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }
  return local + '@' + domain;
}

/* ══════════════════════════  REDEMPTION LEDGER  ══════════════════════════
   One first-order discount per email, enforced by (code, normalised email).

   PROTOTYPE ONLY. This is a localStorage map, which the customer can clear.
   It demonstrates the rule and keeps the UI honest; it does not enforce it.
   Real enforcement is a UNIQUE INDEX in the database — the schema is in
   LOYALTY-ECONOMICS.md §Discount codes. Client-side checks are a courtesy
   message, never a control. */
const Redemptions = {
  key: 'biostem_redemptions_v1',

  /* Issued and redeemed are DIFFERENT events and must not share a ledger.
     Issuing is "this email has been given the code" — it stops a second code
     being handed to the same mailbox. Redeeming is "this email has spent it on
     an order" — it stops the code being used twice. Collapsing the two makes
     issuing a code immediately invalidate it. */
  read() {
    try { const v = JSON.parse(localStorage.getItem(this.key)); return v && v.issued ? v : { issued: {}, redeemed: {} }; }
    catch { return { issued: {}, redeemed: {} }; }
  },
  write(v) { try { localStorage.setItem(this.key, JSON.stringify(v)); } catch {} },

  _has(bucket, code, email) {
    const e = normalizeEmail(email);
    return !!e && (this.read()[bucket][String(code).toUpperCase()] || []).includes(e);
  },
  _add(bucket, code, email) {
    const e = normalizeEmail(email); if (!e) return false;
    const k = String(code).toUpperCase(), all = this.read();
    all[bucket][k] = all[bucket][k] || [];
    if (all[bucket][k].includes(e)) return false;
    all[bucket][k].push(e);
    this.write(all);
    return true;
  },

  isIssued(code, email)   { return this._has('issued', code, email); },
  isRedeemed(code, email) { return this._has('redeemed', code, email); },
  /** Hand the code to an email. False if that mailbox already has it. */
  issue(code, email)      { return this._add('issued', code, email); },
  /** Spend it on an order. False if that mailbox already spent it. */
  redeem(code, email)     { return this._add('redeemed', code, email); },
};

/* ══════════════════════════  DISCOUNT CODES  ══════════════════════════
   The live welcome code resolves here and on the server. It stacks on top of
   the per-line stack discount. Referral and ambassador codes stay disabled
   until their issued-code and redemption ledgers are server-backed. */
function resolveCode(raw) {
  const c = String(raw || '').trim().toUpperCase();
  if (!c) return null;

  if (c === String(LOYALTY.welcomeCode).toUpperCase()) {
    return { code: LOYALTY.welcomeCode, off: LOYALTY.welcomePercent / 100,
             label: `${LOYALTY.welcomePercent}% off your first order` };
  }
  // Referral ownership and one-use eligibility are verified by secure checkout.
  // This only lets a captured code appear in the cart before that server check.
  if (/^[A-Z][A-Z0-9-]{3,23}$/.test(c)) {
    return { code: c, off: LOYALTY.referralFriendDiscount, label: '10% referral offer' };
  }
  // Referral and ambassador codes need a server-issued ledger before they can
  // be redeemed at payment. Do not quote client-shaped codes in the cart: a
  // browser-only pattern check would let anyone make up a discount.
  return null;
}
