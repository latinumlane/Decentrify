// js/taxonomy.js — category + research-use colour system
//
// Muted clinical hues, not candy. Every `ink` value clears WCAG AA (4.5:1) on
// white AND on its own `tint`, so the same token works for text, chips, and
// filled backgrounds. Category identity is carried by hue; the base brand
// accent (--accent) stays reserved for site chrome and CTAs.

const CATEGORY_THEME = {
  'regeneration':            { ink: '#0B6B52', tint: '#E2F2ED', name: 'Regenerative Research', short: 'Regen',     icon: 'cat_autorenew'  },
  'glp-amylin-analogs':      { ink: '#8A5A0B', tint: '#FBF0DA', name: 'GLP / Amylin Analogs', short: 'GLP',       icon: 'cat_water_drop' },
  'ghrh-ghrp':               { ink: '#3A4BA8', tint: '#E7EAF9', name: 'GHRH / GHRP',        short: 'GHRH',      icon: 'cat_hub'        },
  'neuro-research':          { ink: '#6D3AA8', tint: '#F0E8FA', name: 'Neuro Research',    short: 'Neuro',     icon: 'cat_psychology'  },
  'longevity-research':      { ink: '#1A6491', tint: '#E2EFF7', name: 'Longevity Research', short: 'Longevity', icon: 'cat_hourglass'   },
  'signaling-defense-other': { ink: '#4A5A68', tint: '#ECF0F3', name: 'Solvents / Signaling', short: 'Solvents', icon: 'cat_science' },
};
/* CATEGORY_THEME is the ONLY source of a category's display name. `CATEGORIES` and
   each product's `category` string in js/data.js are normalised against it at load —
   they had already drifted three ways ("Longevity" vs "Longevity Research",
   "Signaling / Other" vs "Signaling / Defense / Other") before this was added. */
if (typeof CATEGORIES !== 'undefined') {
  CATEGORIES.forEach(c => { const t = CATEGORY_THEME[c.slug]; if (t) c.name = t.name; });
}
if (typeof PRODUCTS !== 'undefined') {
  PRODUCTS.forEach(p => { const t = CATEGORY_THEME[p.categorySlug]; if (t) p.category = t.name; });
}

const catTheme = slug => CATEGORY_THEME[slug] ||
  { ink: '#4A5A68', tint: '#ECF0F3', name: 'Research', short: 'Research', icon: 'beaker' };

/* ── Research groupings ────────────────────────────────────────────────
   The catalog is grouped ONLY by category — a pharmacological class, which is a
   fact about the molecule. The previous "use family" system (Repair & Recovery,
   Metabolic, Cognitive & Mood, Skin & Aesthetic, Hormonal…) was removed on
   2026-08-24: it sorted research compounds by promised therapeutic outcome, and
   the free-text tags feeding it read "Muscle Building", "Libido", "Hair Growth",
   "Anxiety Relief". On a research-use-only catalog that is a claim, not a filter.

   Nothing in this file may describe a result. Class in, class out. */

/** Every product in a category. */
const productsInCategory = slug => PRODUCTS.filter(p => p.categorySlug === slug);

/* ── Research interests ───────────────────────────────────────────────
   What a researcher says they work on at signup. One entry per real category, so
   a selection always resolves to actual stock, and the labels name pathways and
   compound classes rather than conditions or outcomes. `stack` points at the
   bundle covering the same class; null where none genuinely fits. */
const RESEARCH_GOALS = [
  { key: 'regeneration',            label: 'Regeneration & repair pathways',  stack: 'recovery-stack'  },
  { key: 'glp-amylin-analogs',      label: 'Incretin & metabolic pathways',   stack: 'metabolic-stack' },
  { key: 'ghrh-ghrp',               label: 'Growth-hormone axis',             stack: null              },
  { key: 'neuro-research',          label: 'Neurological & cognitive pathways', stack: 'cognitive-stack' },
  { key: 'longevity-research',      label: 'Mitochondrial & longevity pathways', stack: null           },
  { key: 'signaling-defense-other', label: 'Signalling & other pathways',     stack: null              },
  { key: 'browsing',                label: 'Just looking',                    stack: null              },
];
const goalByKey = k => RESEARCH_GOALS.find(g => g.key === k) || null;

/** Only offer interests the catalog can actually answer, so no selection lands on
    an empty shelf. Derived, not hand-pruned. "Just looking" always stays, always last. */
function availableGoals() {
  const real = RESEARCH_GOALS.filter(g =>
    g.key !== 'browsing' && (productsInCategory(g.key).length > 0 || g.stack));
  return [...real, goalByKey('browsing')];
}

/** Inline style bundle for anything that should carry a category's identity. */
const catVars = slug => {
  const t = catTheme(slug);
  return `--c-ink:${t.ink};--c-tint:${t.tint}`;
};
