// js/data.js — BioStem Labs catalog
// PRICES AND SIZES corrected 2026-08-24 from screenshots of the live logged-in
// shop page. The live catalog sells ONE vial size per product — the multi-size
// ladder previously here came from a stale JS chunk baked into biostemlabs.com
// and did not match the real catalog on any price. See PRICING-AUDIT.md.
// `sizeTBC: true` marks a vial size the screenshots could not confirm.
// PRICES: the previously marked-up catalog received a further +10%, ceilinged
// to the next .99, on 2026-08-30. These deliberately DO NOT match
// biostemlabs.com — the markup is intentional. PRICING-AUDIT.md holds the
// source and pricing history.
// `tags` (Joint Repair, Muscle Building, Libido, Hair Growth, Anxiety Relief…)
// were REMOVED 2026-08-24. They categorised research compounds by therapeutic
// outcome, which is the exact claim an RUO catalog cannot make. Products are now
// grouped only by `category` — a pharmacological class, not a promised result —
// and each carries `purpose`: what the compound is commonly acquired to study.
// Describe the research. Never the outcome.
// Source: extracted from the live biostemlabs.com product payload, then trimmed on
// 2026-08-23 to the SKUs BioStem actually sells. 37 SKUs from a separate catalogue
// were removed — the full 55-SKU set is archived in js/_archive/data.full55.js.
// CJC-1295/Ipamorelin Blend was ADDED from client artwork; it was absent from the
// scraped payload. Its price carries priceTBC:true and needs confirming.
// `image` is set only where real product photography exists; all other products
// render a generated SVG vial. Photography supplied by the client 2026-08-23. `coa_url` is empty on every SKU upstream — the COA
// UI reads js/coa-data.js, which ships with clearly-labelled SAMPLE lots only.

const CATEGORIES = [
  {
    "name": "Regenerative Research",
    "slug": "regeneration"
  },
  {
    "name": "GLP / Amylin Analogs",
    "slug": "glp-amylin-analogs"
  },
  {
    "name": "GHRH / GHRP",
    "slug": "ghrh-ghrp"
  },
  {
    "name": "Neuro Research",
    "slug": "neuro-research"
  },
  {
    "name": "Longevity Research",
    "slug": "longevity-research"
  },
  {
    "name": "Solvents / Signaling",
    "slug": "signaling-defense-other"
  }
];

const PRODUCTS = [
  {
    "id": "2",
    "name": "BPC-157/TB-500 Blend",
    "slug": "bpc-157-tb-500-blend",
    "category": "Regenerative Research",
    "categorySlug": "regeneration",
    "description": "A synergistic blend combining BPC-157 and TB-500 for studying tissue repair and regeneration pathways.",
    "sizes": [
      {
        "label": "10/10mg",
        "price": 108.99,
        "sku": "BPCTB-10",
        "sizeTBC": true
      }
    ],
    "image": "assets/bpc-157-tb-500.jpg",
    "inStock": true,
    "featured": true,
    "coa_url": "",
    "subtitle": "Synergistic blend combining BPC-157 and TB-500",
    "hasPhoto": true,
    "purpose": "Commonly acquired for tissue-repair research. Used in angiogenesis, granulation-tissue, fibroblast-migration, and tendon and ligament model work."
  },
  {
    "id": "6",
    "name": "GHK-Cu",
    "slug": "ghk-cu",
    "category": "Regenerative Research",
    "categorySlug": "regeneration",
    "description": "A copper-binding tripeptide studied for collagen synthesis, skin remodeling, and wound contraction.",
    "sizes": [
      {
        "label": "50mg",
        "price": 60.99,
        "sku": "GHKCU-50",
        "sizeTBC": true
      }
    ],
    "image": "assets/ghk-cu.jpg",
    "inStock": true,
    "featured": true,
    "coa_url": "",
    "subtitle": "Copper-binding tripeptide",
    "hasPhoto": true,
    "purpose": "Commonly acquired for extracellular-matrix and dermal research. Used in studies of copper transport, collagen and decorin expression, and fibroblast culture."
  },
  {
    "id": "7",
    "name": "KPV",
    "slug": "kpv",
    "category": "Regenerative Research",
    "categorySlug": "regeneration",
    "description": "An alpha-MSH-derived tripeptide investigated for anti-inflammatory signaling via NF-kB pathway modulation.",
    "sizes": [
      {
        "label": "10mg",
        "price": 54.99,
        "sku": "KPV-10"
      }
    ],
    "image": "assets/kpv.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Alpha-MSH-derived tripeptide",
    "hasPhoto": true,
    "purpose": "Commonly acquired for inflammatory-signalling research. Used in melanocortin-pathway, NF-κB, and intestinal epithelial model work."
  },
  {
    "id": "10",
    "name": "Thymosin alpha-1",
    "slug": "thymosin-alpha-1",
    "category": "Regenerative Research",
    "categorySlug": "regeneration",
    "description": "A thymic peptide researched for immune modulation, T-cell maturation, and vaccine adjuvant activity.",
    "sizes": [
      {
        "label": "10mg",
        "price": 79.99,
        "sku": "TA1-10"
      }
    ],
    "image": "assets/thymosin-alpha-1.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Thymic peptide",
    "hasPhoto": true,
    "purpose": "Commonly acquired for immunology research. Used in studies of Toll-like receptor signalling, dendritic-cell maturation, and T-cell differentiation."
  },
  {
    "id": "11",
    "name": "AOD9604",
    "slug": "aod-9604",
    "category": "Regenerative Research",
    "categorySlug": "regeneration",
    "description": "A modified fragment of human growth hormone studied for lipolytic activity without affecting IGF-1.",
    "sizes": [
      {
        "label": "5mg",
        "price": 54.99,
        "sku": "AOD-5",
        "sizeTBC": true
      }
    ],
    "image": "assets/aod-9604.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Modified fragment of human growth hormone",
    "hasPhoto": true,
    "purpose": "Commonly acquired for adipose-tissue research. Used to study lipolytic signalling separately from the growth-promoting activity of the intact growth-hormone molecule."
  },
  {
    "id": "18",
    "name": "Peptide R",
    "slug": "retatrutide",
    "category": "GLP / Amylin Analogs",
    "categorySlug": "glp-amylin-analogs",
    "description": "A triple agonist (GLP-1/GIP/glucagon) investigated for multi-receptor metabolic pathway research.",
    "sizes": [
      {
        "label": "10mg",
        "price": 84.99,
        "sku": "RETA-10"
      }
    ],
    "image": "assets/retatrutide.jpg",
    "inStock": true,
    "featured": true,
    "coa_url": "",
    "subtitle": "Triple agonist (GLP-1/GIP/glucagon)",
    "hasPhoto": true,
    "purpose": "Commonly acquired for multi-receptor incretin research. Used in studies of simultaneous GLP-1, GIP, and glucagon receptor engagement."
  },
  {
    "id": "20",
    "name": "Peptide S",
    "slug": "semaglutide",
    "category": "GLP / Amylin Analogs",
    "categorySlug": "glp-amylin-analogs",
    "description": "A GLP-1 receptor agonist studied for glucose metabolism, appetite regulation, and metabolic signaling.",
    "sizes": [
      {
        "label": "10mg",
        "price": 54.99,
        "sku": "SEMA-10"
      }
    ],
    "image": "assets/semaglutide.jpg",
    "inStock": true,
    "featured": true,
    "coa_url": "",
    "subtitle": "GLP-1 receptor agonist",
    "hasPhoto": true,
    "purpose": "Commonly acquired for incretin-pathway research. Used in studies of GLP-1 receptor signalling, glucose-dependent insulin secretion, and gastric emptying."
  },
  {
    "id": "21",
    "name": "Peptide T",
    "slug": "tirzepatide",
    "category": "GLP / Amylin Analogs",
    "categorySlug": "glp-amylin-analogs",
    "description": "A dual GIP/GLP-1 receptor agonist researched for glucose-dependent insulinotropic effects.",
    "sizes": [
      {
        "label": "10mg",
        "price": 60.99,
        "sku": "TIRZ-10",
        "sizeTBC": true
      }
    ],
    "image": "assets/tirzepatide.jpg",
    "inStock": true,
    "featured": true,
    "coa_url": "",
    "subtitle": "Dual GIP/GLP-1 receptor agonist",
    "hasPhoto": true,
    "purpose": "Commonly acquired for dual-incretin research. Used to compare combined GIP and GLP-1 receptor engagement against GLP-1 receptor agonism alone."
  },
  {
    "id": "26",
    "name": "Sermorelin",
    "slug": "sermorelin",
    "category": "GHRH / GHRP",
    "categorySlug": "ghrh-ghrp",
    "description": "A GHRH(1-29) analog researched for pulsatile growth hormone secretion.",
    "sizes": [
      {
        "label": "5mg",
        "price": 54.99,
        "sku": "SERMO-5"
      }
    ],
    "image": "assets/sermorelin.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "GHRH(1-29)",
    "hasPhoto": true,
    "purpose": "Commonly acquired for growth-hormone axis research. Used in studies of pituitary somatotroph stimulation and the pulsatile character of endogenous secretion."
  },
  {
    "id": "56",
    "name": "CJC-1295 (without DAC) + Ipamorelin",
    "slug": "cjc-1295-ipamorelin-blend",
    "category": "GHRH / GHRP",
    "categorySlug": "ghrh-ghrp",
    "description": "A blend pairing CJC-1295 with Ipamorelin for studying growth-hormone-releasing pathways and secretagogue signalling together.",
    "sizes": [
      {
        "label": "10mg",
        "price": 79.99,
        "sku": "CJCIPA-10"
      }
    ],
    "image": "assets/cjc-1295-ipamorelin-blend.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Blend pairing CJC-1295 with Ipamorelin",
    "hasPhoto": true,
    "purpose": "Commonly acquired for growth-hormone axis research. This pairing lets investigators engage the GHRH receptor and the ghrelin receptor within one protocol."
  },
  {
    "id": "33",
    "name": "Selank",
    "slug": "selank",
    "category": "Neuro Research",
    "categorySlug": "neuro-research",
    "description": "A synthetic tuftsin analog investigated for anxiolytic activity, immune modulation, and neurotransmitter regulation.",
    "sizes": [
      {
        "label": "5mg",
        "price": 52.99,
        "sku": "SELANK-5",
        "sizeTBC": true
      }
    ],
    "image": "assets/selank.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Synthetic tuftsin",
    "hasPhoto": true,
    "purpose": "Commonly acquired for neuropharmacology research. Used in studies of GABAergic gene expression, hippocampal synaptic activity, and BDNF signalling."
  },
  {
    "id": "34",
    "name": "Semax",
    "slug": "semax",
    "category": "Neuro Research",
    "categorySlug": "neuro-research",
    "description": "A synthetic heptapeptide ACTH analog studied for neuroprotection, cognitive enhancement, and BDNF modulation.",
    "sizes": [
      {
        "label": "10mg",
        "price": 42.99,
        "sku": "SEMAX-10"
      }
    ],
    "image": "assets/semax.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Synthetic heptapeptide ACTH",
    "hasPhoto": true,
    "purpose": "Commonly acquired for neuropharmacology research. Used in studies of neurotrophin and BDNF expression and in ischemia models."
  },
  {
    "id": "35",
    "name": "NAD+",
    "slug": "nad-plus",
    "category": "Neuro Research",
    "categorySlug": "neuro-research",
    "description": "Nicotinamide adenine dinucleotide studied for NAD+ biosynthesis and sirtuin-mediated signaling.",
    "sizes": [
      {
        "label": "10mg",
        "price": 72.99,
        "sku": "NAD-500"
      }
    ],
    "image": "assets/nad-plus.jpg",
    "inStock": true,
    "featured": true,
    "coa_url": "",
    "subtitle": "Nicotinamide adenine dinucleotide",
    "hasPhoto": true,
    "purpose": "Commonly acquired for cellular-metabolism research. Used in studies of redox reactions, the salvage biosynthesis pathway, and NAD⁺-consuming enzymes including the sirtuins and PARPs."
  },
  {
    "id": "42",
    "name": "MOTS-C",
    "slug": "mots-c",
    "category": "Longevity Research",
    "categorySlug": "longevity-research",
    "description": "A mitochondrial-derived peptide investigated for AMPK activation and exercise-mimetic effects.",
    "sizes": [
      {
        "label": "10mg",
        "price": 54.99,
        "sku": "MOTSC-10"
      }
    ],
    "image": "assets/mots-c.jpg",
    "inStock": true,
    "featured": true,
    "coa_url": "",
    "subtitle": "Mitochondrial-derived peptide",
    "hasPhoto": true,
    "purpose": "Commonly acquired for mitochondrial research. Used in studies of AMPK activation, the folate–methionine cycle, and mitochondrial-to-nuclear signalling."
  },
  {
    "id": "51",
    "name": "PT-141",
    "slug": "pt-141",
    "category": "Solvents / Signaling",
    "categorySlug": "signaling-defense-other",
    "description": "A melanocortin receptor agonist investigated for CNS signaling and MC4R activation.",
    "sizes": [
      {
        "label": "10mg",
        "price": 48.99,
        "sku": "PT141-10",
        "sizeTBC": true
      }
    ],
    "image": "assets/pt-141.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Melanocortin receptor agonist",
    "hasPhoto": true,
    "purpose": "Commonly acquired for melanocortin-receptor research. Used in studies of central MC4R signalling."
  },
  {
    "id": "52",
    "name": "Bacteriostatic Water",
    "slug": "bac-water",
    "category": "Solvents / Signaling",
    "categorySlug": "signaling-defense-other",
    "description": "Bacteriostatic water (0.9% benzyl alcohol) for reconstituting lyophilized peptides.",
    "sizes": [
      {
        "label": "10ml",
        "price": 16.99,
        "sku": "BACW-10",
        "sizeTBC": true
      }
    ],
    "image": "assets/bacwater.webp",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Sterile diluent, 0.9% benzyl alcohol",
    "hasPhoto": true,
    "purpose": "Laboratory solvent, not a research compound. Used to reconstitute lyophilized peptides for handling and storage.",
    "solvent": true
  },
  {
    "id": "53",
    "name": "Acetic Acid Solution 1%",
    "slug": "acetic-acid",
    "category": "Solvents / Signaling",
    "categorySlug": "signaling-defense-other",
    "description": "Sterile acetic acid solution for reconstituting peptides that require acidic solvents.",
    "sizes": [
      {
        "label": "10ml",
        "price": 16.99,
        "sku": "AA06-10",
        "sizeTBC": true
      }
    ],
    "image": "assets/acetic-acid.webp",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Acidic diluent for reconstitution",
    "hasPhoto": true,
    "purpose": "Laboratory solvent, not a research compound. Used to reconstitute peptides that require an acidic diluent.",
    "solvent": true
  },
  {
    "id": "54",
    "name": "Glutathione",
    "slug": "glutathione",
    "category": "Solvents / Signaling",
    "categorySlug": "signaling-defense-other",
    "description": "A tripeptide antioxidant studied for cellular redox balance and detoxification pathways.",
    "sizes": [
      {
        "label": "10mg",
        "price": 40.99,
        "sku": "GLUT-600"
      }
    ],
    "image": "assets/glutathione.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Tripeptide antioxidant",
    "hasPhoto": true,
    "purpose": "Commonly acquired for redox-biology research. Used in studies of the GSH/GSSG couple, glutathione peroxidase and S-transferase enzymes, and mitochondrial redox homeostasis."
  },
  {
    "id": "55",
    "name": "Tesamorelin",
    "slug": "tesamorelin",
    "category": "Solvents / Signaling",
    "categorySlug": "signaling-defense-other",
    "description": "A stabilized GHRH analog investigated for growth hormone axis stimulation.",
    "sizes": [
      {
        "label": "10mg",
        "price": 79.99,
        "sku": "TESA-10"
      }
    ],
    "image": "assets/tesamorelin.jpg",
    "inStock": true,
    "featured": false,
    "coa_url": "",
    "subtitle": "Stabilized GHRH",
    "hasPhoto": true,
    "purpose": "Commonly acquired for growth-hormone axis research. Used in studies of the GH–IGF-1 axis and adipose tissue."
  }
];
