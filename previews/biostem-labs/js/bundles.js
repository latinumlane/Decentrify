// js/bundles.js — ad-destination bundle definitions
//
// Every component references a REAL SKU from js/data.js at its real catalog
// price. `listTotal` is computed at runtime from those prices — never hardcoded —
// so the "separately vs bundled" maths can't drift from the catalog.
// BUNDLE_DISCOUNT is the current commercial stack discount.

const BUNDLE_DISCOUNT = 0.15;

const BUNDLES_LP = [
  {
    slug: 'recovery-stack',
    url: 'bundles/recovery-stack.html',
    name: 'The Recovery Stack',
    kicker: 'Tissue repair & structural research',
    categorySlug: 'regeneration',
    useCategory: 'regeneration',
    // Ad-side targeting notes for whoever builds the campaigns
    adAngle: 'Researchers sourcing tissue-repair compounds across 3+ vendors',
    searchIntent: 'bpc-157 tb-500 stack, tissue repair peptide bundle, GHK-Cu',
    headline: 'Four repair-pathway compounds.<br>One lot-matched order.',
    sub: 'The compounds most requested for tissue-repair and structural-recovery research — bundled, batch-documented, and shipped together instead of chased across three suppliers.',
    promise: 'Every vial ships with its own lot code and certificate of analysis.',
    pathways: [
      ['Angiogenic signalling', 'BPC-157 and TB-500 are the two most-cited compounds in tissue-repair literature; the blend is studied for vascular and structural repair pathways together.'],
      ['Collagen & matrix remodelling', 'GHK-Cu is investigated for collagen synthesis, matrix remodelling, and wound-contraction models.'],
      ['Inflammatory signalling', 'KPV is studied for NF-κB pathway modulation in inflammatory and gastrointestinal research models.'],
    ],
    items: [
      { sku: 'BPCTB-10', why: 'The core repair pair, pre-blended at a 1:1 ratio' },
      { sku: 'GHKCU-50', why: 'Collagen and matrix-remodelling research' },
      { sku: 'KPV-10',   why: 'Inflammatory-pathway signalling' },
      { sku: 'BACW-10',  why: 'Solvent for reconstituting the stack' },
    ],
    faq: [
      ['Why the blend instead of separate BPC-157 and TB-500 vials?',
       'The blend puts both compounds in a single lot, so one certificate of analysis covers the pair and there is no batch-to-batch variance between them. Separate vials are available in the catalog if your protocol requires independent handling.'],
      ['Is one vial of bacteriostatic water enough for all three compounds?',
       'The stack ships with one vial of bacteriostatic water. Reconstitution volume depends on the concentration your protocol calls for — order additional solvent from the catalog if your run needs more. Reconstitution guidance is on each product page under Storage & handling.'],
      ['Can I substitute a size or compound?',
       'The bundle price is set for this exact configuration. For a different combination or larger research quantities, contact us and we will quote it directly.'],
    ],
  },
  {
    slug: 'metabolic-stack',
    url: 'bundles/metabolic-stack.html',
    name: 'The Metabolic Stack',
    kicker: 'Incretin & mitochondrial research',
    categorySlug: 'glp-amylin-analogs',
    useCategory: 'glp-amylin-analogs',
    adAngle: 'Metabolic-research buyers comparing GLP analog suppliers on purity documentation',
    searchIntent: 'GLP research peptide, semaglutide research, tirzepatide research, MOTS-c',
    headline: 'The metabolic research stack,<br>documented lot by lot.',
    sub: 'A single-pathway agonist, a dual-pathway agonist, and a mitochondrial-derived peptide — set up for side-by-side comparison, supplied from one facility with one paper trail.',
    promise: 'Guaranteed ≥99% purity with third-party analysis tied to your lot code.',
    pathways: [
      ['Incretin signalling', 'Peptide S is studied for single-pathway GLP receptor activity across metabolic signalling, glucose regulation, and appetite-modulation research.'],
      ['Dual-pathway agonism', 'Peptide T acts on two incretin receptors, and is most often studied side by side with a single-pathway agonist rather than alone.'],
      ['Mitochondrial regulation', 'MOTS-c is a mitochondrial-derived peptide researched for metabolic homeostasis and substrate-utilisation models.'],
    ],
    items: [
      { sku: 'SEMA-10',   why: 'Single-pathway incretin receptor agonist' },
      { sku: 'TIRZ-10',   why: 'Dual-pathway agonist for comparative models' },
      { sku: 'MOTSC-10', why: 'Mitochondrial-derived metabolic signalling' },
      { sku: 'BACW-10',  why: 'Solvent for the full stack' },
    ],
    faq: [
      ['Why are these named Peptide S and Peptide T rather than the compound names?',
       'Compounds in this category are listed under research designations. The specification, SKU, molecular formula, and lot documentation on each product page identify exactly what you are ordering.'],
      ['Which size should a new research program start with?',
       'Each compound is stocked in a single vial size. For quantities beyond the listed range, contact us and we will quote it directly.'],
      ['Are these compounds controlled substances?',
       'No. None of our products are controlled substances under the Controlled Substances Act. Purchasers remain responsible for compliance with all applicable federal, state, and local law.'],
    ],
  },
  {
    slug: 'cognitive-stack',
    url: 'bundles/cognitive-stack.html',
    name: 'The Cognitive Stack',
    kicker: 'Neuro & cellular-energy research',
    categorySlug: 'neuro-research',
    useCategory: 'neuro-research',
    adAngle: 'Neuro-research buyers who currently split orders between a peptide vendor and an NAD+ supplier',
    searchIntent: 'semax selank stack, NAD+ research, nootropic peptide supplier COA',
    headline: 'Two neuropeptides and NAD+,<br>from one verified facility.',
    sub: 'Semax, Selank, and NAD+ are almost always ordered from three different places. Here they arrive in one box, from one cGMP-compliant facility, each with its own certificate of analysis.',
    promise: 'A lot-specific certificate of analysis on all three compounds, not just the peptides.',
    pathways: [
      ['Neurotrophic signalling', 'Semax is studied for BDNF-related neurotrophic and neuroprotective pathways in cognitive research models.'],
      ['Anxiolytic pathway research', 'Selank is investigated for GABAergic and anxiolytic signalling alongside cognitive endpoints.'],
      ['Cellular energy metabolism', 'NAD+ is central to redox and mitochondrial-energy research, and is commonly run as a parallel arm to neuropeptide work.'],
    ],
    items: [
      { sku: 'SEMAX-10',  why: 'Neurotrophic and neuroprotective pathway research' },
      { sku: 'SELANK-5',  why: 'Anxiolytic and cognitive signalling models' },
      { sku: 'NAD-500',   why: 'Cellular-energy and redox research, 500mg' },
      { sku: 'BACW-10',   why: 'Solvent for the full stack' },
    ],
    faq: [
      ['Why include NAD+ with two neuropeptides?',
       'Cellular-energy metabolism is a common parallel arm in cognitive research design, and NAD+ is usually sourced separately from peptide suppliers. Including it removes a second vendor and a second shipment from the process.'],
      ['Do Semax and Selank need different solvents?',
       'No. Both reconstitute in bacteriostatic water, as does NAD+. A vial of bacteriostatic water is included. Compound-specific guidance is on each product page.'],
      ['Can I see the COA before ordering?',
       'Yes. Every lot resolves through the COA lookup using the code printed on the vial label. Contact us if you need batch documentation in advance of an order.'],
    ],
  },
];

const bundleBySlug = s => BUNDLES_LP.find(b => b.slug === s);

/** Resolve a bundle's SKUs against the live catalog and compute its economics. */
function bundleLines(b) {
  return b.items.map(it => {
    for (const p of PRODUCTS) {
      const size = p.sizes.find(s => s.sku === it.sku);
      if (size) return { ...it, p, size };
    }
    return null;
  }).filter(Boolean);
}
/** Stack card in the product-grid system. One renderer, used by the homepage,
    the shop page, and anywhere else a stack needs to sit in a `.grid`. */
function stackCard(b, base = '') {
  const t = catTheme(b.categorySlug), m = bundleMath(b);
  return `<a class="card" href="${base}${b.url}" style="${catVars(b.categorySlug)}">
    <div class="card__media card__media--stack">
      <span class="card__flag" style="background:${t.ink}">Save ${money(m.saving)}</span>
      <div class="card__stack">
        ${m.lines.map(l => `<span>${productArt(l.p)}</span>`).join('')}
      </div>
    </div>
    <div class="card__body">
      <span class="card__cat">${esc(b.kicker)}</span>
      <span class="card__name" style="font-size:19px">${esc(b.name)}</span>
      <span class="card__sub">${m.lines.length} components · ${m.lines.map(l => esc(l.p.name)).join(' · ')}</span>
      <span class="card__foot">
        <span class="card__price">${money(m.price)}<small style="text-decoration:line-through">${money(m.listTotal)}</small></span>
        <span class="card__go">View stack</span>
      </span>
    </div></a>`;
}

/** Every stack this product is a component of. */
const stacksWith = slug => BUNDLES_LP.filter(b => bundleLines(b).some(l => l.p.slug === slug));

/** Cross-sell block for a product page: the stack it belongs to, what the rest
    of it is, and what buying it together saves. */
function stackCrossSell(p, base = '') {
  const b = stacksWith(p.slug)[0];
  if (!b) return '';
  const m = bundleMath(b);
  const t = catTheme(b.categorySlug);
  const others = m.lines.filter(l => l.p.slug !== p.slug);

  return `<section class="xsell" style="${catVars(b.categorySlug)}">
    <div class="xsell__l">
      <span class="xsell__kick">${ico(t.icon)}Also in ${esc(b.name)}</span>
      <h3 class="xsell__h">Buy ${esc(b.name)} and save ${money(m.saving)}</h3>
      <p class="xsell__p">
        ${esc(p.name)} is one of ${m.lines.length} components in this stack.
        Together they run ${money(m.price)} instead of ${money(m.listTotal)} —
        ${m.pct}% off, one shipment, one document trail.
      </p>
      <div class="xsell__with">
        <span>Ships with</span>
        ${others.map(l => `<a href="${base}product.html?p=${l.p.slug}">${esc(l.p.name)}</a>`).join('')}
      </div>
    </div>
    <div class="xsell__r">
      <div class="xsell__art">
        ${m.lines.map(l => `<span class="${l.p.slug === p.slug ? 'is-this' : ''}">${productArt(l.p)}</span>`).join('')}
      </div>
      <div class="xsell__price">
        <b>${money(m.price)}</b><small>${money(m.listTotal)}</small>
        <span class="xsell__save">Save ${money(m.saving)}</span>
      </div>
      <div class="xsell__cta">
        <button class="btn btn--primary btn--sq" id="xsellAdd">Add the stack to cart</button>
        <a class="btn btn--ghost btn--sq" href="${base}${b.url}">See what's inside</a>
      </div>
    </div>
  </section>`;
}

/** Wire the cross-sell's add button. Call after the block is in the DOM. */
function bindStackCrossSell(p) {
  const b = stacksWith(p.slug)[0];
  document.getElementById('xsellAdd')?.addEventListener('click', () => b && addBundleToCart(b));
}

/** Add every component of a bundle to the cart at the bundle discount.
    One place, so the landing page and the welcome modal can never diverge on
    what "the stack" means or what it costs. */
function addBundleToCart(b) {
  const m = bundleMath(b);
  m.lines.forEach(l => Cart.add(l.p.slug, l.size.sku, 1, BUNDLE_DISCOUNT, b.slug));
  return m;
}

function bundleMath(b) {
  const lines = bundleLines(b);
  const listTotal = lines.reduce((n, l) => n + l.size.price, 0);
  // Checkout charges an individually rounded discounted price for each vial;
  // calculate bundle cards the same way so the offer never differs by a cent.
  const price = lines.reduce((n, l) => n + Math.round(l.size.price * (1 - BUNDLE_DISCOUNT) * 100) / 100, 0);
  return { lines, listTotal, price, saving: Math.round((listTotal - price) * 100) / 100,
           pct: Math.round(BUNDLE_DISCOUNT * 100) };
}
