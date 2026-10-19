// js/coa-data.js — REAL certificate records, transcribed from the client-supplied PDFs
// in coa/ on 2026-08-23 and 2026-09-08. Every value below was read off the document itself.
//
// Lab for all 13: Vanguard Laboratory, Olympia WA · ISO 17025:2017 · A2LA #6377.01.01
//
// `amount` is what the CERTIFICATE states — which does not always match a catalog
// size (see COA-AUDIT.md). It is shown verbatim rather than coerced to a SKU size.
// `note` surfaces a caveat directly in the UI where one exists; `partial` marks a
// certificate that covers only one component of a blended product.

const COA_LAB = {
  name: 'Vanguard Laboratory',
  address: 'Olympia, WA',
  accreditation: 'ISO 17025:2017 · A2LA #6377.01.01',
};

const COA_RECORDS = {
  'aod-9604': [{
    amount: 'Bulk powder', lot: 'ULP-20656', labId: 'V251215-19 002', tested: '2026-01-14',
    purity: '>99.80% ±0.18%', identity: 'Matches standard', assay: null,
    file: 'coa/aod-9604.pdf',
  }],
  'ghk-cu': [{
    amount: '10 mg', lot: 'GH0001', labId: 'V251088-28 085', tested: '2026-05-01',
    purity: '>99.80% ±0.18%', identity: null, assay: '10.50 mg',
    extra: ['Sterility USP <61>: Pass — no growth', 'Endotoxins (LAL): Pass — <0.05 EU/mg'],
    file: 'coa/ghk-cu.pdf',
  }],
  'kpv': [{
    amount: '10 mg', lot: 'CA0001', labId: 'V251008-22 02', tested: null,
    purity: '>99.80% ±0.18%', identity: null, assay: '11.80 mg',
    file: 'coa/kpv.pdf',
  }],
  'mots-c': [{
    amount: '10 mg', lot: 'MC0001', labId: 'V251208-22 028', tested: null,
    purity: '98.77% ±0.18%', identity: null, assay: '11.54 mg',
    extra: ['Sterility USP <61>: Pass — no growth', 'Endotoxins (LAL): Pass — <0.05 EU/mg'],
    file: 'coa/mots-c.pdf',
  }],
  'nad-plus': [{
    amount: '500 mg', lot: 'ULP-48881', labId: 'V251104-5 001', tested: '2026-01-20',
    purity: '99.18% ±0.18% (NAD+)', identity: null, assay: null,
    extra: ['Chromatographic purity (total): >99.80% ±0.18%'],
    file: 'coa/nad-plus.pdf',
  }],
  'glutathione': [{
    amount: '600 mg', lot: 'ULP-54961', labId: 'V260209-8', tested: '2026-02-27',
    purity: '>99.80% ±0.18%', identity: null, assay: '197 mg',
    extra: ['Certificate quantity: 600 mg'],
    file: 'coa/glutathione.pdf',
  }],
  'pt-141': [{
    amount: '10 mg', lot: '1001', labId: 'V200212-0 055', tested: '2026-10-02',
    purity: '>99.80% ±0.18%', identity: null, assay: '10.33 mg',
    file: 'coa/pt-141.pdf',
  }],
  'selank': [{
    amount: '10 mg', lot: 'ULP-42313', labId: 'V260327-17 001', tested: '2026-04-10',
    purity: '>99.50% ±0.18%', identity: null, assay: '4.19 mg',
    note: 'Assay reads 4.19 mg against a 10 mg certificate; the catalog SKU is 5 mg. Query with the lab before relying on this lot.',
    file: 'coa/selank.pdf',
  }],
  'semax': [{
    amount: '10 mg', lot: 'SX0001', labId: 'V851008-25 057', tested: null,
    purity: '99.42% ±0.18%', identity: null, assay: '11.14 mg',
    extra: ['Sterility USP <61>: Pass — no growth', 'Endotoxins (LAL): Pass — <0.05 EU/mg'],
    file: 'coa/semax.pdf',
  }],
  'sermorelin': [{
    amount: '10 mg', lot: 'CA0001', labId: 'V251008-22 002', tested: '2026-09-03',
    purity: '>99.80% ±0.18%', identity: null, assay: '10.62 mg',
    note: 'Lot CA0001 also appears on the KPV certificate. Confirm lot traceability before publishing.',
    file: 'coa/sermorelin.pdf',
  }],
  'thymosin-alpha-1': [{
    amount: '10 mg', lot: 'ULP-49230', labId: 'V260326-22006', tested: '2026-04-10',
    purity: '99.21% ±0.18%', identity: null, assay: '9.68 mg',
    extra: ['Thymosin Alpha-1 quantity: 4.98 mg', 'Thymulin quantity: 7.17 mg'],
    file: 'coa/thymosin-alpha-1.pdf',
  }],
  'tesamorelin': [{
    amount: '10 mg', lot: 'CA0201', labId: 'V251008-22 002', tested: null,
    purity: '99.06% ±0.18%', identity: null, assay: '11.80 mg',
    extra: ['Sterility USP <61>: Pass — no growth'],
    file: 'coa/tesamorelin.pdf',
  }],
  'tirzepatide': [{
    amount: '10 mg', lot: 'SG0001', labId: 'V550904-14 001', tested: null,
    purity: '99.46% ±0.18%', identity: null, assay: '10.00 mg',
    extra: ['Sterility USP <61>: Pass', 'Endotoxins (LAL): <0.05 EU/mg'],
    file: 'coa/tirzepatide-peptide-t.pdf',
  }],
  'retatrutide': [{
    amount: '10 mg', lot: 'ULP-48832', labId: 'V251007-19001', tested: '2025-10-17',
    purity: '99.79% ±0.18%', identity: null, assay: '9.20 mg',
    file: 'coa/retatrutide.pdf',
  }],
  'semaglutide': [{
    amount: '10 mg', lot: 'ULP-48814E', labId: 'V260605-30 012', tested: '2026-06-15',
    purity: '>99.80% ±0.18%', identity: null, assay: '10.02 mg',
    file: 'coa/semaglutide.pdf',
  }],

  // ── Component-only certificates ──────────────────────────────────────
  // These two certify a SINGLE compound, while the SKU they belong to is a blend.
  // Surfaced because partial documentation beats none — but labelled precisely so
  // nobody mistakes them for whole-product certificates.
  'bpc-157-tb-500-blend': [{
    amount: '10 mg', lot: 'BP1001', labId: 'V251024-13 007', tested: null,
    purity: '>99.80% ±0.18%', identity: null, assay: '10.72 mg',
    partial: 'BPC-157 component only',
    file: 'coa/bpc-157.pdf',
  }],
  'cjc-1295-ipamorelin-blend': [{
    amount: '10 mg', lot: 'CJ0001', labId: 'V251024-13 006', tested: null,
    purity: '99.49% ±0.18%', identity: null, assay: '11.70 mg',
    partial: 'CJC-1295 component only',
    note: 'Covers the CJC-1295 component. No certificate was supplied for the Ipamorelin component of this blend.',
    file: 'coa/cjc-1295.pdf',
  }],
};

/** All certificate records for a product slug. */
const coaFor = slug => COA_RECORDS[slug] || [];
const hasCoa = slug => (COA_RECORDS[slug] || []).length > 0;

// Back-compat for the lot lookup, which indexes flat rows.
const COA_LOTS = Object.fromEntries(
  Object.entries(COA_RECORDS).map(([slug, recs]) => [slug, recs.map(r => ({
    size: r.amount, lot: r.lot, sku: '', sample: false, file: r.file,
    purity: r.purity, tested: r.tested, partial: null,
  }))])
);
