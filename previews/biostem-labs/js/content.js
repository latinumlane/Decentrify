// js/content.js — editorial copy, shared across pages.
// Claims here are limited to ones BioStem Labs already makes on its own site:
// ≥99% purity guarantee, cGMP-compliant / ISO-certified facility, third-party
// testing, COA on every vial, manufactured in the USA, next-business-day priority shipping,
// 24-business-hour response, RUO / 21+ / DEA-CSA positioning.
// No review counts, customer numbers, or lab partner names are asserted —
// those need client confirmation before they go on a live page.

/* Products shown in the supplied hero photograph. Keep these in the same order
   as the vials from left to right in assets/biostemhero.webp. */
const HERO_CARD_SLUGS = ['cjc-1295-ipamorelin-blend', 'glutathione', 'selank'];

const HERO_STATS = [
  { icon: 'flask',  title: 'Lot-specific documentation', sub: 'Review the published certificate' },
  { icon: 'shield', title: 'Third-party analysis',     sub: 'When a certificate is available' },
  { icon: 'truck',  title: 'Next-business-day dispatch', sub: 'Priority shipping on every order' },
];

const TRUST_STRIP = [
  { icon: 'check',  label: 'Lot-specific documentation' },
  { icon: 'shield', label: 'Third-party tested' },
  { icon: 'doc',    label: 'Published COA records' },
  { icon: 'truck',  label: 'Next-Day Shipping' },
  { icon: 'flag',   label: 'Made in the USA' },
  { icon: 'lock',   label: 'For research use only' },
];

const STANDARD = [
  { icon: 'flask', title: 'Reported analytical results',
    body: 'Review the published certificate of analysis for the specific lot and component before relying on a reported result.' },
  { icon: 'shield', title: 'Independent analysis',
    body: 'Available certificates identify the testing laboratory and reported lot results.' },
  { icon: 'doc', title: 'Batch-specific documentation',
    body: 'A certificate of analysis is generated per lot — not per product line — so the paperwork matches the exact vial in your hand.' },
  { icon: 'truck', title: 'Next-business-day fulfilment',
    body: 'Orders are picked, packed, and dispatched on the next business day with priority shipping.' },
];

const DOCS = [
  { icon: 'doc', title: 'Certificate of analysis',
    body: 'Published analytical results for the specific lot printed on your vial label. Review the certificate before relying on a lot.' },
  { icon: 'search', title: 'Lot traceability',
    body: 'Published lot codes resolve back to their available analytical record.' },
  { icon: 'beaker', title: 'Reconstitution guidance',
    body: 'Solvent, volume, and concentration notes appropriate to the compound — bacteriostatic water or acetic acid.' },
  { icon: 'clock', title: 'Storage specification',
    body: 'Lyophilized and reconstituted storage conditions and expected stability window.' },
];

const SHIPPING = [
  { icon: 'clock', title: 'Next-business-day processing',
    body: 'Orders are prepared and dispatched on the next business day with priority shipping.' },
  { icon: 'truck', title: 'Tracked delivery',
    body: 'A tracking number is issued the moment your order is handed to the carrier.' },
  { icon: 'shield', title: 'Protective packaging',
    body: 'Vials ship in rigid, light-shielded packaging chosen to protect lyophilized product in transit.' },
  { icon: 'lock', title: 'Discreet, compliant',
    body: 'Plain outer packaging. Research-use-only labelling applied at the vial, per compliance requirements.' },
];

const FAQ = [
  { q: 'What does “for research use only” actually mean here?',
    a: 'Every product BioStem Labs sells is intended strictly for in-vitro laboratory, analytical, and development work. Nothing in the catalog is approved by the FDA, and nothing is intended for human or animal consumption, medical diagnosis, or therapeutic use. Purchasers represent that they are legitimate researchers aged 21 or over.' },
  { q: 'How is quality documented?',
    a: 'Available certificates of analysis identify the reported results for their listed lots. Review the certificate and its scope before relying on a particular lot or blend.' },
  { q: 'How do I find the COA for the vial I received?',
    a: 'Use the lot code printed on the vial label. Enter it in the COA lookup and the matching batch record will resolve, along with the size and SKU it belongs to.' },
  { q: 'When will my order ship?',
    a: 'Orders are picked, packed, and dispatched on the next business day with priority shipping. A tracking number is issued as soon as the carrier takes possession.' },
  { q: 'What is your refund policy?',
    a: 'All sales are final. BioStem Labs does not process refunds. Please verify your order and shipping details before completing checkout.' },
  { q: 'How should compounds be stored?',
    a: 'Lyophilized product should be kept dry and stored per the vial label. Once reconstituted, storage conditions and stability windows are compound-specific — the guidance is listed on each product page under Storage.' },
  { q: 'Which solvent should I use for reconstitution?',
    a: 'Most lyophilized peptides in the catalog reconstitute in bacteriostatic water. A subset require an acidic solvent, for which we stock 0.6% acetic acid. The correct solvent is noted on each product page.' },
  { q: 'Are any of these compounds controlled substances?',
    a: 'No. None of our products are controlled substances under the Controlled Substances Act. Purchasers remain solely responsible for compliance with all applicable federal, state, and local laws governing research chemicals.' },
  { q: 'How quickly does BioStem respond to enquiries?',
    a: 'Researcher enquiries are answered within 24 hours on business days.' },
];

/* ── COA components ──────────────────────────────────────────────────
   Real certificate data now lives in js/coa-data.js. These render it, and always
   give a direct link to the PDF — no lookup step in between. */

const COA_DISCLAIMER_EXEMPT = new Set(['bac-water', 'acetic-acid']);

/** Small inline "View COA" button. Falls back to a muted state when none exists. */
function coaButton(slug, base = '') {
  const recs = coaFor(slug);
  if (!recs.length) {
    if (COA_DISCLAIMER_EXEMPT.has(slug)) return '';
    return `<span class="coa-btn coa-btn--none">${ico('doc')}COA on request</span>`;
  }
  const r = recs[0];
  return `<a class="coa-btn" href="${base}${r.file}" target="_blank" rel="noopener"
             title="Certificate of analysis — lot ${esc(r.lot)}">
    ${ico('doc')}View COA<span class="coa-btn__lot">Lot ${esc(r.lot)}</span></a>`;
}

/** Full certificate panel for a product. */
function coaPanel(p, base = '') {
  const recs = coaFor(p.slug);
  if (!recs.length) {
    if (COA_DISCLAIMER_EXEMPT.has(p.slug)) return '';
    return `<div class="notice">${ico('alert')}
      <span><b>No certificate published for this SKU yet.</b> Batch documentation for
      ${esc(p.name)} is available on request — <a href="${base}contact.html"
      style="color:var(--accent);font-weight:700">ask us</a> and we'll send the current lot record.</span>
    </div>`;
  }
  return recs.map(r => `
  <div class="coa-card">
    <div class="coa-card__head">
      <div>
        <h3>Certificate of analysis${r.partial ? ` — ${esc(r.partial)}` : ''}</h3>
        <p>${esc(p.name)} · ${esc(r.amount)} · Lot ${esc(r.lot)}</p>
      </div>
      ${ico('doc', '')}
    </div>
    <div class="coa-rows">
      <div class="coa-row"><dt>Purity</dt><dd>${esc(r.purity || '—')}</dd></div>
      <div class="coa-row"><dt>${r.identity ? 'Identity' : 'Assay'}</dt>
        <dd>${esc(r.identity || r.assay || '—')}</dd></div>
      <div class="coa-row"><dt>Lab ID</dt><dd style="font-size:13px">${esc(r.labId || '—')}</dd></div>
      <div class="coa-row"><dt>Date reported</dt>
        <dd style="font-size:14px">${r.tested ? esc(r.tested) : '<span style="color:var(--ink-4)">Not stated</span>'}</dd></div>
    </div>
    ${r.extra ? `<div class="coa-extra">${r.extra.map(e => `<span>${ico('check')}${esc(e)}</span>`).join('')}</div>` : ''}
    ${r.note ? `<div class="notice" style="margin:14px 0 0"><span><b>Documentation notice.</b> ${esc(r.note)}</span></div>` : ''}
    <div class="coa-card__foot">
      <div class="coa-card__file">
        ${ico('doc')}
        <span><b>${esc(r.file.split('/').pop())}</b>
        <span>${esc(COA_LAB.name)} · ${esc(COA_LAB.accreditation)}</span></span>
      </div>
      <a class="btn btn--primary btn--sq" href="${base}${r.file}" target="_blank" rel="noopener"
         style="padding:11px 20px;font-size:13px">Open certificate </a>
    </div>
  </div>
  `).join('');
}

/** Homepage / quality-page showcase — uses a product that actually has a certificate. */
function sampleCoaCard(product) {
  const p = product || PRODUCTS.find(x => hasCoa(x.slug)) || PRODUCTS[0];
  if (!p) return '';
  return coaPanel(p);
}

/* ── Compound-specific handling guidance ──────────────────────────── */
const ACID_SOLVENT = ['glutathione', 'cerebrolysin'];

/* ── Reconstitution ───────────────────────────────────────────────────
   Lyophilized powder is not usable until it is reconstituted. A researcher who
   orders a peptide and no diluent receives a vial they cannot open work with,
   and finds out days later — so the cart says so before checkout rather than
   the FAQ saying so afterwards. Purely factual: which diluent, not how much. */
const SOLVENTS = {
  'bac-water':   { slug: 'bac-water',   label: 'Bacteriostatic water (0.9% benzyl alcohol)' },
  'acetic-acid': { slug: 'acetic-acid', label: 'Acetic acid solution (acidic diluent required)' },
};

/** The solvent a product needs, or null when it needs none (solvents themselves,
    oral formats, and anything shipped as a ready-made solution). */
function solventFor(p) {
  if (!p || p.solvent) return null;
  if (/Tablets|Capsule/i.test(p.name)) return null;
  return SOLVENTS[ACID_SOLVENT.includes(p.slug) ? 'acetic-acid' : 'bac-water'];
}

/** Solvents needed by the cart's contents that the cart does not already contain. */
function missingSolvents(lines) {
  const have = new Set(lines.map(l => l.p.slug));
  const need = new Map();
  lines.forEach(l => {
    const sv = solventFor(l.p);
    if (!sv || have.has(sv.slug)) return;
    if (!need.has(sv.slug)) need.set(sv.slug, { ...sv, forProducts: [] });
    need.get(sv.slug).forProducts.push(l.p.name);
  });
  return [...need.values()];
}
function storageFor(p) {
  const acid = ACID_SOLVENT.includes(p.slug);
  const isSolvent = p.categorySlug === 'signaling-defense-other' &&
                    /water|acetic/i.test(p.name);
  if (isSolvent) {
    return [
      ['Form', 'Sterile solution, ready to use'],
      ['Storage', 'Room temperature, away from direct light'],
      ['Use', 'Reconstitution of lyophilized research compounds'],
      ['Note', 'Check the seal before first draw. Discard if the solution is not clear.'],
    ];
  }
  return [
    ['Form', p.name.includes('Tablets') ? 'Oral tablet, research format' : 'Lyophilized powder'],
    ['Lyophilized storage', 'Keep dry and sealed. Store per the vial label; protect from light.'],
    ['Solvent', acid ? SOLVENTS['acetic-acid'].label : SOLVENTS['bac-water'].label],
    ['Reconstituted storage', 'Refrigerate after reconstitution. Do not shake — swirl to dissolve.'],
    ['Handling', 'Allow the vial to reach room temperature before opening to limit condensation.'],
  ];
}
