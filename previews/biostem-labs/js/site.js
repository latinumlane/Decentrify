// js/site.js — BioStem Labs v3 shared runtime
// No dependencies, no build step. Loaded after js/data.js on every page.

// The UI's system-font stack is fully usable before DM Sans arrives. Do not
// make first paint wait on the third-party Google Fonts stylesheet.
document.querySelectorAll('link[data-font-stylesheet]').forEach(link => { link.media = 'all'; });

/* Supabase sends email-link visitors to the Site URL (the homepage) whenever
   the requested redirect isn't on its allowlist, so any page can receive a
   confirmation, reset, or expired-link fragment. Only the account page can
   finish those flows; hand the fragment over before anything renders. */
(() => {
  if (/\/account\.html$/.test(location.pathname)) return;
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (!hash.has('access_token') && !hash.has('error_code')) return;
  const recovery = hash.get('type') === 'recovery' ? '?recovery=1' : '';
  location.replace(`/account.html${recovery}${location.hash}`);
})();

/* ══════════════════════════  CONFIG  ══════════════════════════
   PLACEHOLDERS — confirm real values with the client before launch.
   These drive the cart's progress bar and the PDP delivery estimate. */
const CONFIG = {
  freeShipThreshold: 200,      // TODO confirm — BioStem's live site shows a free-shipping unlock
  priorityShippingFee: 15,     // Flat rate for carts below the free-shipping threshold
  samplePackThreshold: 350,    // TODO confirm — live site shows a "FREE Sample Pack" unlock
  shipDaysMin: 2,              // Next-business-day dispatch plus priority transit
  shipDaysMax: 3,
};

/* ══════════════════════════  ICONS  ══════════════════════════ */
const I = {
  flask:  '<path d="M9 3h6M10 3v6.2L4.6 18A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M7.5 15h9"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  truck:  '<path d="M14 17V5H2v12h2"/><path d="M14 9h4l4 4v4h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>',
  doc:    '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h4"/>',
  atom:   '<circle cx="12" cy="12" r="2"/><path d="M12 2a10 16 0 0 0 0 20a10 16 0 0 0 0-20Z"/><path d="M20.7 7a16 10 0 0 1-17.4 10A16 10 0 0 1 20.7 7Z"/>',
  brain:  '<path d="M9.5 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3 3 0 0 0 6 17a3 3 0 0 0 3.5 3V3Z"/><path d="M14.5 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3 3 0 0 1 18 17a3 3 0 0 1-3.5 3V3Z"/>',
  spark:  '<path d="m12 2 2.3 6.3L21 10.5l-6 4 1.5 7-4.5-3.6L7.5 21.5 9 14.5l-6-4 6.7-2.2Z"/>',
  renew:  '<path d="M20 11a8 8 0 0 0-14.8-4L3 9"/><path d="M3 4v5h5"/><path d="M4 13a8 8 0 0 0 14.8 4L21 15"/><path d="M21 20v-5h-5"/>',
  drop:   '<path d="M12 2.7 6.7 9a7.5 7.5 0 1 0 10.6 0Z"/>',
  beaker: '<path d="M6 3h12M9 3v7l-5 8a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8V3"/><path d="M6.5 15h11"/>',
  check:  '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>',
  flag:   '<path d="M5 22V3"/><path d="M5 4c3-1.6 5.5-1.6 7.5 0s4.5 1.6 6.5 0v9c-2 1.6-4.5 1.6-6.5 0s-4.5-1.6-7.5 0"/>',
  clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cart:   '<circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/><path d="M2 2h2.6l2.7 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L22 6H5.2"/>',
  menu:   '<path d="M3 6h18M3 12h18M3 18h18"/>',
  x:      '<path d="M6 6 18 18M18 6 6 18"/>',
  alert:  '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 17.4A2 2 0 0 0 4.1 20.4h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  lock:   '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  arrow:  '<path d="M5 12h13M13 6l6 6-6 6"/>',
  globe:  '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z"/>',
  coin:   '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2a3 3 0 0 0-5 2.2c0 3 5 1.6 5 4.2a3 3 0 0 1-5 1.4"/><path d="M12 7v1.4M12 16.6V18"/>',
  gift:   '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9S10.5 3 8 3a2.5 2.5 0 0 0 0 6M12 9s1.5-6 4-6a2.5 2.5 0 0 1 0 6"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  users:  '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16.5 5.2a3.4 3.4 0 0 1 0 5.6M18 14.4A6.5 6.5 0 0 1 21.5 20"/>',
};
const CATEGORY_LIBRARY_ICONS = {
  cat_autorenew: 'autorenew', cat_water_drop: 'water_drop', cat_hub: 'hub',
  cat_psychology: 'psychology', cat_hourglass: 'hourglass_empty', cat_science: 'science',
};
const CATEGORY_LIBRARY_PATHS = {"autorenew":"<path d=\"M204-318q-22-38-33-78t-11-82q0-134 93-228t227-94h7l-64-64 56-56 160 160-160 160-56-56 64-64h-7q-100 0-170 70.5T240-478q0 26 6 51t18 49l-60 60ZM481-40 321-200l160-160 56 56-64 64h7q100 0 170-70.5T720-482q0-26-6-51t-18-49l60-60q22 38 33 78t11 82q0 134-93 228t-227 94h-7l64 64-56 56Z\"/>","water_drop":"<path d=\"M491-200q12-1 20.5-9.5T520-230q0-14-9-22.5t-23-7.5q-41 3-87-22.5T343-375q-2-11-10.5-18t-19.5-7q-14 0-23 10.5t-6 24.5q17 91 80 130t127 35Zm-239.5 26Q160-268 160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80q-137 0-228.5-94ZM652-230.5Q720-301 720-408q0-73-60.5-165T480-774Q361-665 300.5-573T240-408q0 107 68 177.5T480-160q104 0 172-70.5ZM480-480Z\"/>","hub":"<path d=\"M155-75q-35-35-35-85t35-85q35-35 85-35 14 0 26 3t23 8l57-71q-28-31-39-70t-5-78l-81-27q-17 25-43 40t-58 15q-50 0-85-35T0-580q0-50 35-85t85-35q50 0 85 35t35 85v8l81 28q20-36 53.5-61t75.5-32v-87q-39-11-64.5-42.5T360-840q0-50 35-85t85-35q50 0 85 35t35 85q0 42-26 73.5T510-724v87q42 7 75.5 32t53.5 61l81-28v-8q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-32 0-58.5-15T739-515l-81 27q6 39-5 77.5T614-340l57 70q11-5 23-7.5t26-2.5q50 0 85 35t35 85q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-20 6.5-38.5T624-232l-57-71q-41 23-87.5 23T392-303l-56 71q11 15 17.5 33.5T360-160q0 50-35 85t-85 35q-50 0-85-35Zm-35-465q17 0 28.5-11.5T160-580q0-17-11.5-28.5T120-620q-17 0-28.5 11.5T80-580q0 17 11.5 28.5T120-540Zm148.5 408.5Q280-143 280-160t-11.5-28.5Q257-200 240-200t-28.5 11.5Q200-177 200-160t11.5 28.5Q223-120 240-120t28.5-11.5Zm240-680Q520-823 520-840t-11.5-28.5Q497-880 480-880t-28.5 11.5Q440-857 440-840t11.5 28.5Q463-800 480-800t28.5-11.5ZM480-360q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm268.5 228.5Q760-143 760-160t-11.5-28.5Q737-200 720-200t-28.5 11.5Q680-177 680-160t11.5 28.5Q703-120 720-120t28.5-11.5Zm120-420Q880-563 880-580t-11.5-28.5Q857-620 840-620t-28.5 11.5Q800-597 800-580t11.5 28.5Q823-540 840-540t28.5-11.5ZM480-840ZM120-580Zm360 120Zm360-120ZM240-160Zm480 0Z\"/>","psychology":"<path d=\"M240-80v-172q-57-52-88.5-121.5T120-520q0-150 105-255t255-105q125 0 221.5 73.5T827-615l52 205q5 19-7 34.5T840-360h-80v120q0 33-23.5 56.5T680-160h-80v80h-80v-160h160v-200h108l-38-155q-23-91-98-148t-172-57q-116 0-198 81t-82 197q0 60 24.5 114t69.5 96l26 24v208h-80Zm254-360Zm-54 80h80l6-50q8-3 14.5-7t11.5-9l46 20 40-68-40-30q2-8 2-16t-2-16l40-30-40-68-46 20q-5-5-11.5-9t-14.5-7l-6-50h-80l-6 50q-8 3-14.5 7t-11.5 9l-46-20-40 68 40 30q-2 8-2 16t2 16l-40 30 40 68 46-20q5 5 11.5 9t14.5 7l6 50Zm-2.5-117.5Q420-495 420-520t17.5-42.5Q455-580 480-580t42.5 17.5Q540-545 540-520t-17.5 42.5Q505-460 480-460t-42.5-17.5Z\"/>","hourglass_empty":"<path d=\"M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120Zm273-407q47-47 47-113v-120H320v120q0 66 47 113t113 47q66 0 113-47ZM160-80v-80h80v-120q0-61 28.5-114.5T348-480q-51-32-79.5-85.5T240-680v-120h-80v-80h640v80h-80v120q0 61-28.5 114.5T612-480q51 32 79.5 85.5T720-280v120h80v80H160Z\"/>","science":"<path d=\"M200-120q-51 0-72.5-45.5T138-250l222-270v-240h-40q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760h-40v240l222 270q32 39 10.5 84.5T760-120H200Zm0-80h560L520-492v-268h-80v268L200-200Zm280-280Z\"/>"};
const ico = (n, cls = '') =>
  CATEGORY_LIBRARY_ICONS[n]
    ? `<svg class="${cls}" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">${CATEGORY_LIBRARY_PATHS[CATEGORY_LIBRARY_ICONS[n]]}</svg>`
    : `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;

const CAT_ICON = {
  'regeneration': 'cat_autorenew',
  'glp-amylin-analogs': 'drop',
  'ghrh-ghrp': 'atom',
  'neuro-research': 'brain',
  'longevity-research': 'flask',
  'signaling-defense-other': 'beaker',
};

/* ══════════════════════════  BRAND MARK  ══════════════════════════
   Reconstruction of the BioStem Labs helix lockup (double sine + 5 base-pair rungs). */
function brandMark(light = false) {
  const a = light ? '#ffffff' : '#1C2128';
  const b = light ? 'rgba(255,255,255,0.28)' : 'rgba(28,33,40,0.28)';
  const s1 = light ? 'rgba(255,255,255,0.55)' : 'rgba(28,33,40,0.55)';
  const s2 = light ? 'rgba(255,255,255,0.18)' : 'rgba(28,33,40,0.18)';
  const yTop = [5, 11, 17, 11, 5], yBot = [31, 25, 19, 25, 31];
  const rungs = [{ x: 8, o: .55 }, { x: 18, o: .3 }, { x: 28, o: .18 }, { x: 38, o: .3 }, { x: 48, o: .55 }]
    .map((r, i) => {
      const st = r.o > .4 ? s1 : s2;
      return `<line x1="${r.x}" y1="${yTop[i]}" x2="${r.x}" y2="${yBot[i]}" stroke="${st}" stroke-width="0.8"/>
              <circle cx="${r.x}" cy="${yTop[i]}" r="2" fill="${a}"/>
              <circle cx="${r.x}" cy="${yBot[i]}" r="2" fill="${b}"/>`;
    }).join('');
  return `<svg class="brand__mark" viewBox="0 0 54 36" fill="none" aria-hidden="true">
    <path d="M2 11 C8 5,14 5,18 11 C22 17,28 17,34 11 C40 5,46 5,52 11" stroke="${a}" stroke-width="1.5"/>
    <path d="M2 25 C8 31,14 31,18 25 C22 19,28 19,34 25 C40 31,46 31,52 25" stroke="${b}" stroke-width="1.5"/>
    ${rungs}</svg>`;
}
function brandLockup(light = false) {
  const logo = light ? 'whitelogo.webp' : 'multilogo.webp';
  return `<span class="brand ${light ? 'brand--light' : ''}"><img class="brand__mark" src="${ASSET_BASE}assets/${logo}" alt=""></span>`;
}

/* ══════════════════════════  GENERATED VIAL  ══════════════════════════
   Only 3 SKUs have real photography. Every other product renders this
   brand-accurate vector vial so the catalog reads as one system.
   Replace by populating `image` in js/data.js as real shots are shot. */
function vialSVG(p) {
  const name = p.name.toUpperCase();
  // Split long names across two label lines
  let l1 = name, l2 = '';
  if (name.length > 11) {
    const parts = name.split(/[\/ ]/);
    if (parts.length > 1) {
      let acc = '';
      for (const w of parts) {
        if ((acc + w).length <= 11) acc += (acc ? (name.includes('/') ? '/' : ' ') : '') + w;
        else break;
      }
      l1 = acc || parts[0];
      l2 = name.slice(l1.length).replace(/^[\/ ]/, '');
    } else { l1 = name.slice(0, 11); l2 = name.slice(11); }
  }
  const fs1 = l1.length > 9 ? 13 : 16;
  const uid = 'v' + Math.random().toString(36).slice(2, 8);

  return `<svg viewBox="0 0 200 262" role="img" aria-label="${p.name} research vial">
  <defs>
    <linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#B9C2C7"/><stop offset=".18" stop-color="#FAFBFB"/>
      <stop offset=".5" stop-color="#E3E8EA"/><stop offset=".82" stop-color="#FAFBFB"/>
      <stop offset="1" stop-color="#AFB9BF"/>
    </linearGradient>
    <linearGradient id="c${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#8C979E"/><stop offset=".2" stop-color="#F4F6F7"/>
      <stop offset=".45" stop-color="#C3CBD0"/><stop offset=".72" stop-color="#F0F3F4"/>
      <stop offset="1" stop-color="#8C979E"/>
    </linearGradient>
    <linearGradient id="l${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#20252B"/><stop offset=".22" stop-color="#3A424A"/>
      <stop offset=".62" stop-color="#272D34"/><stop offset="1" stop-color="#171B20"/>
    </linearGradient>
  </defs>

  <ellipse cx="100" cy="250" rx="52" ry="7" fill="#1C2128" opacity=".10"/>

  <!-- glass body -->
  <path d="M52 62 h96 v168 a14 14 0 0 1-14 14 H66 a14 14 0 0 1-14-14 Z" fill="url(#g${uid})"/>
  <path d="M52 62 h96 v168 a14 14 0 0 1-14 14 H66 a14 14 0 0 1-14-14 Z" fill="none" stroke="#9BA5AC" stroke-width="1"/>
  <!-- neck + crimp cap -->
  <path d="M76 30 h48 v20 l10 12 H66 l10-12 Z" fill="url(#g${uid})" stroke="#9BA5AC" stroke-width="1"/>
  <rect x="68" y="12" width="64" height="30" rx="5" fill="url(#c${uid})" stroke="#7E888F" stroke-width="1"/>
  <rect x="76" y="17" width="48" height="4" rx="2" fill="#fff" opacity=".55"/>
  <ellipse cx="100" cy="14" rx="32" ry="5" fill="#DDE3E6" stroke="#7E888F" stroke-width="1"/>

  <!-- label -->
  <rect x="52" y="86" width="96" height="118" fill="#F6F7F8"/>
  <rect x="52" y="104" width="96" height="82" fill="url(#l${uid})"/>

  <!-- logo band -->
  <g transform="translate(72 90) scale(0.36)">
    <path d="M2 11 C8 5,14 5,18 11 C22 17,28 17,34 11 C40 5,46 5,52 11" stroke="#1C2128" stroke-width="2.6" fill="none"/>
    <path d="M2 25 C8 31,14 31,18 25 C22 19,28 19,34 25 C40 31,46 31,52 25" stroke="#889299" stroke-width="2.6" fill="none"/>
  </g>
  <text x="118" y="99" font-family="Times New Roman, serif" font-size="8.5" letter-spacing="1.1" fill="#1C2128">BIOSTEM</text>

  <!-- product name -->
  <text x="100" y="${l2 ? 126 : 132}" text-anchor="middle" font-family="DM Sans, sans-serif"
        font-size="${fs1}" font-weight="700" letter-spacing="-.4" fill="#fff">${l1}</text>
  ${l2 ? `<text x="100" y="142" text-anchor="middle" font-family="DM Sans, sans-serif"
        font-size="${fs1}" font-weight="700" letter-spacing="-.4" fill="#fff">${l2}</text>` : ''}

  <!-- dose pill -->
  <rect x="${100 - (sz.length * 4 + 14) / 2}" y="${l2 ? 150 : 142}" width="${sz.length * 4 + 14}" height="15" rx="7.5" fill="#fff"/>
  <text x="100" y="${l2 ? 161 : 153}" text-anchor="middle" font-family="DM Sans, sans-serif"
        font-size="9.5" font-weight="700" fill="#1C2128"></text>

  <text x="100" y="${l2 ? 176 : 170}" text-anchor="middle" font-family="DM Sans, sans-serif"
        font-size="5.7" letter-spacing=".18" fill="#C7CED4">LYOPHILIZED · PURITY &gt;99%</text>

  <!-- footer band -->
  <text x="100" y="194" text-anchor="middle" font-family="DM Sans, sans-serif"
        font-size="6" letter-spacing=".3" fill="#5B646C">Store at 20C · Keep dry</text>
  <text x="100" y="201.5" text-anchor="middle" font-family="DM Sans, sans-serif"
        font-size="6.2" font-weight="700" fill="#1C2128">FOR RESEARCH USE ONLY</text>

  <!-- glass highlights -->
  <rect x="60" y="70" width="7" height="166" rx="3.5" fill="#fff" opacity=".5"/>
  <rect x="137" y="70" width="4" height="166" rx="2" fill="#fff" opacity=".3"/>
</svg>`;
}

/* Path prefix from the current page back to the site root. Pages in a
   subdirectory (the /bundles/ landing pages) set this to '../' so shared
   components — the cart drawer especially — emit correct image paths. */
let ASSET_BASE = '';
const setAssetBase = b => { ASSET_BASE = b || ''; };

/* ═══════════════════════ RESEARCH ACCESS GATE ═══════════════════════
   A first-visit acknowledgement. This is intentionally blocking: visitors
   must affirm their intended research use before browsing the catalog.
   It is a browser acknowledgement, not an identity or compliance check. */
const ResearchVerification = {
  key: 'biostem_research_verified_v3',
  el: null,

  showJoinSuccess() {
    const notice = document.createElement('div');
    notice.className = 'research-gate-success';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.innerHTML = '<span aria-hidden="true">✓</span><p><b>Thank you for joining!</b> Code <strong>RESEARCH10</strong> automatically applied at checkout for 10% off.</p>';
    document.body.appendChild(notice);
    requestAnimationFrame(() => notice.classList.add('is-visible'));
    window.setTimeout(() => {
      notice.classList.remove('is-visible');
      window.setTimeout(() => notice.remove(), 220);
    }, 7000);
  },

  accepted() {
    try {
      if (localStorage.getItem(this.key) === '1') return true;
    } catch {}
    return document.cookie.split(';').some(value => value.trim() === `${this.key}=1`);
  },

  mount() {
    if (this.accepted() || document.getElementById('researchVerification')) return;
    const gate = document.createElement('div');
    gate.className = 'research-gate';
    gate.id = 'researchVerification';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'researchVerificationTitle');
    gate.innerHTML = `
      <div class="research-gate__scrim"></div>
      <section class="research-gate__box">
        <img class="research-gate__brand" src="assets/multilogo.webp" alt="BioStem Labs">
        <span class="research-gate__eyebrow">Research access</span>
        <h1 id="researchVerificationTitle">BioStem Labs Verification</h1>
        <p>BioStem Labs serves independent and qualified researchers, research institutions, and laboratories conducting legitimate in-vitro laboratory work.</p>
        <form id="researchVerificationForm">
          <label class="research-gate__check" for="researchVerificationQualified">
            <input id="researchVerificationQualified" type="checkbox" required>
            <span>I am <b>21 years of age or older</b> and an <b>independent or qualified researcher</b> purchasing for <b>in-vitro laboratory research only.</b></span>
          </label>
          <label class="research-gate__check" for="researchVerificationUse">
            <input id="researchVerificationUse" type="checkbox" required>
            <span>I understand these products are <b>not for human or veterinary use, diagnostic use, therapeutic use, or consumption of any kind.</b></span>
          </label>
          <div class="research-gate__email">
            <label for="researchVerificationEmail">Optional: get 10% off your first order</label>
            <input id="researchVerificationEmail" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@lab.com">
            <span>Leave blank to skip. By adding your email, you agree to receive BioStem research updates; unsubscribe any time. One use per customer.</span>
          </div>
          <p class="research-gate__message" id="researchVerificationMessage" role="status" aria-live="polite"></p>
          <button class="btn btn--primary btn--block" id="researchVerificationContinue" type="submit" disabled>Enter BioStem Labs</button>
        </form>
        <p class="research-gate__fine">By proceeding, you certify that the statements above are true and accurate and acknowledge that all products are sold exclusively for lawful laboratory research.</p>
      </section>`;
    document.body.appendChild(gate);
    this.el = gate;
    document.body.classList.add('research-gate-open');

    const checks = [...gate.querySelectorAll('input[required]')];
    const button = gate.querySelector('#researchVerificationContinue');
    const update = () => { button.disabled = !checks.every(check => check.checked); };
    checks.forEach(check => check.addEventListener('change', update));
    gate.querySelector('#researchVerificationForm').addEventListener('submit', async event => {
      event.preventDefault();
      if (!checks.every(check => check.checked)) return;
      const emailInput = gate.querySelector('#researchVerificationEmail');
      const message = gate.querySelector('#researchVerificationMessage');
      const email = emailInput.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        message.textContent = 'Enter a valid email, or leave it blank to skip.';
        message.classList.add('is-error');
        emailInput.focus();
        return;
      }
      button.disabled = true;
      let claimed = false;
      if (email) {
        try {
          const response = await fetch('/api/subscribe', {
            method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, consent: true, source: 'direct_url_gate' }),
          });
          claimed = response.ok;
        } catch {}
      }
      try { localStorage.setItem(this.key, '1'); } catch {}
      window.BioStemTrack?.('access_gate_passed');
      if (claimed) {
        // Apply the same welcome offer used by the access subdomain without
        // requiring the visitor to re-enter it at checkout.
        if (typeof Redemptions !== 'undefined') Redemptions.issue(LOYALTY.welcomeCode, email);
        if (typeof Customer !== 'undefined') Customer.setEmail(email);
        if (typeof PromoStore !== 'undefined') PromoStore.settle('joined', email);
        if (typeof Cart !== 'undefined') Cart.applyCode(LOYALTY.welcomeCode);
        window.BioStemTrack?.('direct_gate_email_captured');
      }
      if (location.hostname === 'www.biostemlabs.com' || location.hostname === 'biostemlabs.com') {
        document.cookie = `${this.key}=1; Domain=.biostemlabs.com; Path=/; Max-Age=2592000; Secure; SameSite=Lax`;
      }
      document.body.classList.remove('research-gate-open');
      gate.remove();
      this.el = null;
      if (claimed) this.showJoinSuccess();
    });
    document.addEventListener('keydown', event => {
      if (!this.el || event.key !== 'Tab') return;
      const focusable = [...this.el.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')]
        .filter(item => !item.disabled && item.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }, true);
    checks[0].focus({ preventScroll: true });
  },
};

/** Product artwork: real photo when we have one, generated vial otherwise. */
function productArt(p) {
  return p.image
    ? `<img src="${ASSET_BASE}${p.image}" alt="${p.name} research vial" loading="lazy" width="939" height="939">`
    : vialSVG(p);
}

/* ══════════════════════════  HELPERS  ══════════════════════════ */
/* Round at every money boundary, not just on display: these values feed the free-
   shipping thresholds, the points calculation, and the stored order record. */
const cents = n => Math.round(n * 100) / 100;
const money = n => '$' + Number(n).toFixed(2);
/* One vial size per product, so this is just the price. Kept for the shop sort. */
const fromPrice = p => Math.min(...p.sizes.map(s => s.price));
const bySlug = s => PRODUCTS.find(p => p.slug === s);
const qs = k => new URLSearchParams(location.search).get(k);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ══════════════════════════  FUNNEL ANALYTICS  ══════════════════════════
   Vercel Web Analytics custom events. Keep this deliberately privacy-safe:
   no email, address, referral/promo value, order number, invoice ID, or other
   customer/payment identifier is ever sent. The two-property cap also keeps
   the events compatible with Vercel Pro's standard custom-event allowance. */
function trackFunnel(name, properties = {}) {
  if (typeof window === 'undefined' || !name) return;
  const data = {};
  Object.entries(properties).slice(0, 2).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'string') data[key] = value.slice(0, 80);
    else if (typeof value === 'number' && Number.isFinite(value)) data[key] = cents(value);
    else if (typeof value === 'boolean') data[key] = value;
  });
  // Make events safe on local/static previews too. The Vercel script drains
  // vaq after it loads in production.
  window.va = window.va || function (...args) { (window.vaq = window.vaq || []).push(args); };
  window.va('event', Object.keys(data).length ? { name, data } : { name });
}

function funnelCartProperties(lines = Cart.lines()) {
  return {
    item_count: lines.reduce((total, line) => total + line.qty, 0),
    cart_value: cents(lines.reduce((total, line) => total + line.total, 0) - Cart.discount()),
  };
}

function promoType(code) {
  if (!code) return 'none';
  if (code.code === 'RESEARCH10') return 'welcome';
  return code.code.startsWith('BSA-') ? 'ambassador' : 'referral_or_promo';
}

function deliveryWindow() {
  const fmt = d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
  const add = n => { const d = new Date(); let c = 0; while (c < n) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) c++; } return d; };
  return `${fmt(add(CONFIG.shipDaysMin))} – ${fmt(add(CONFIG.shipDaysMax))}`;
}

/* ══════════════════════════  CART  ══════════════════════════ */
const Cart = {
  key: 'biostem_cart_v3',
  read() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  write(v) { localStorage.setItem(this.key, JSON.stringify(v)); this.paint(); },
  // `off` is the bundle discount rate (0–1) the line was quoted at, so the cart
  // charges exactly what the product page displayed.
  add(slug, sku, qty = 1, off = 0, stack = null) {
    window.BioStemTrack?.('add_to_cart');
    const c = this.read();
    const hit = c.find(l => l.sku === sku && (l.off || 0) === off && (l.stack || null) === stack);
    hit ? (hit.qty += qty) : c.push({ slug, sku, qty, off, stack });
    this.write(c);
    trackFunnel('add_to_cart', { sku, quantity: qty });
    this.open();
  },
  lineId: l => `${l.sku}::${l.off || 0}::${l.stack || 'standard'}`,
  remove(id) {
    const line = this.lines().find(candidate => candidate.id === id);
    this.write(this.read().filter(l => Cart.lineId(l) !== id));
    if (line) trackFunnel('remove_from_cart', { sku: line.s.sku, quantity: line.qty });
  },
  lines() {
    return this.read().map(l => {
      const p = bySlug(l.slug); if (!p) return null;
      const s = p.sizes.find(x => x.sku === l.sku) || p.sizes[0];
      // Round the discounted unit amount to cents before multiplying. This is
      // the same calculation used by secure checkout and prevents a one-cent
      // mismatch between stack cards, cart totals, and the hosted invoice.
      const unit = cents(s.price * (1 - (l.off || 0)));
      return { ...l, p, s, unit, id: Cart.lineId(l), total: unit * l.qty };
    }).filter(Boolean);
  },
  checkoutLines() {
    // Carts created before secure stack checkout stored only `off: 0.20`.
    // Convert complete legacy configurations to their canonical stack slugs so
    // their already-quoted price continues to match the secure invoice.
    const source = this.read().map(line => ({ ...line }));
    if (typeof BUNDLES_LP !== 'undefined') {
      const legacy = source.filter(line => !line.stack && line.off === BUNDLE_DISCOUNT);
      BUNDLES_LP.forEach(bundle => {
        const components = bundle.items.map(item => item.sku);
        const count = Math.min(...components.map(sku => legacy.filter(line => line.sku === sku).reduce((n, line) => n + line.qty, 0)));
        if (!Number.isFinite(count) || count < 1) return;
        components.forEach(sku => {
          let remaining = count;
          for (const line of legacy.filter(candidate => candidate.sku === sku)) {
            const used = Math.min(line.qty, remaining);
            if (!used) continue;
            line.qty -= used;
            remaining -= used;
            source.push({ ...line, qty: used, stack: bundle.slug });
          }
        });
      });
    }
    return source.filter(line => line.qty > 0).map(line => ({ sku: line.sku, qty: line.qty, stack: line.stack || null }));
  },
  count() { return this.read().reduce((n, l) => n + l.qty, 0); },
  subtotal() { return cents(this.lines().reduce((n, l) => n + l.total, 0)); },

  /* ── Order-level discount code ──────────────────────────────────────
     Stacks on top of the per-line bundle discount, and multiplicatively:
     a 20% stack with a 10% code pays 0.8 × 0.9 = 72% of list, not 70%.
     That's how real carts sequence it, and it's the cheaper of the two. */
  codeKey: 'biostem_code_v3',
  code() {
    let raw = null;
    try { raw = localStorage.getItem(this.codeKey); } catch {}
    return typeof resolveCode === 'function' ? resolveCode(raw) : null;
  },
  applyCode(raw) {
    const hit = typeof resolveCode === 'function' ? resolveCode(raw) : null;
    if (!hit) return { ok: false, reason: 'unknown' };

    // One first-order discount per email. Prototype check only — the real
    // constraint is a unique index on (code, normalised email) server-side.
    const email = typeof Customer !== 'undefined' ? Customer.email() : null;
    if (email && typeof Redemptions !== 'undefined' && Redemptions.isRedeemed(hit.code, email)) {
      return { ok: false, reason: 'used' };
    }
    try { localStorage.setItem(this.codeKey, hit.code); } catch {}
    this.paint();
    trackFunnel('promo_applied', { promo_type: promoType(hit), cart_value: this.total() });
    return { ok: true, code: hit };
  },
  clearCode() { try { localStorage.removeItem(this.codeKey); } catch {} this.paint(); },
  clear() {
    try {
      localStorage.removeItem(this.key);
      localStorage.removeItem(this.codeKey);
    } catch {}
    this.close();
    this.paint();
  },
  discount() { const c = this.code(); return c ? cents(this.subtotal() * c.off) : 0; },
  total() { return cents(this.subtotal() - this.discount()); },
  shipping() { return this.count() && this.total() < CONFIG.freeShipThreshold ? CONFIG.priorityShippingFee : 0; },
  grandTotal() { return cents(this.total() + this.shipping()); },
  open() {
    document.getElementById('cartDrawer')?.classList.add('is-open');
    document.getElementById('scrim')?.classList.add('is-open');
    if (typeof Checkout !== 'undefined') Checkout.showCart();
    if (this.count()) trackFunnel('view_cart', funnelCartProperties());
  },
  close() {
    document.getElementById('cartDrawer')?.classList.remove('is-open');
    document.getElementById('scrim')?.classList.remove('is-open');
    if (typeof Checkout !== 'undefined') Checkout.showCart();
  },

  paint() {
    const n = this.count();
    document.querySelectorAll('[data-cart-count]').forEach(e => { e.textContent = n; e.classList.toggle('hide', !n); });
    const body = document.getElementById('cartBody');
    if (!body) return;
    const lines = this.lines(), sub = this.subtotal();

    body.innerHTML = lines.length ? lines.map(l => `
      <div class="litem">
        <div class="litem__thumb">${productArt(l.p)}</div>
        <div class="litem__meta">
          <b>${esc(l.p.name)}</b>
          <span>Qty ${l.qty} · <span style="font-family:var(--mono)">${esc(l.s.sku)}</span>${
            l.off ? ` · <b style="color:var(--accent)">−${Math.round(l.off * 100)}%</b>` : ''}</span>
        </div>
        <div class="litem__price">${money(l.total)}</div>
        <button class="litem__x" data-rm="${esc(l.id)}" aria-label="Remove ${esc(l.p.name)}">&times;</button>
      </div>`).join('')
      : `<p style="color:var(--ink-4);font-size:14px;text-align:center;padding:40px 0">Your cart is empty.</p>`;

    /* Reconstitution prompt. Lyophilized powder needs a diluent; ordering the peptide
       without one means a vial that cannot be worked with. Say it here, once, where it
       is still cheap to fix — not in the FAQ after the box arrives. */
    if (lines.length && typeof missingSolvents === 'function') {
      const need = missingSolvents(lines);
      body.insertAdjacentHTML('beforeend', need.map(sv => {
        const sp = bySlug(sv.slug);
        if (!sp) return '';
        const z = sp.sizes[0];
        return `
        <div class="recon">
          <div class="recon__head">${ico('drop')}<b>Reconstitution required</b></div>
          <p class="recon__body">${esc(sv.forProducts.join(', '))} ${sv.forProducts.length > 1 ? 'ship' : 'ships'}
            as lyophilized powder and ${sv.forProducts.length > 1 ? 'need' : 'needs'} ${esc(sv.label)}.
            There is none in your cart.</p>
          <button class="recon__add" data-solvent="${esc(z.sku)}" data-slug="${esc(sp.slug)}">
            Add ${esc(sp.name)}� ${money(z.price)}</button>
          <a class="recon__skip" href="product.html?p=${esc(sp.slug)}">View details</a>
        </div>`;
      }).join(''));
    }

    const code = this.code(), off = this.discount(), total = this.total(), shipping = this.shipping(), grandTotal = this.grandTotal();

    // Thresholds are measured on what the customer actually pays.
    const T = CONFIG.freeShipThreshold, S = CONFIG.samplePackThreshold;
    const bar = document.getElementById('freeBar');
    if (bar) {
      let msg, pct;
      if (total >= S) { msg = 'Free shipping <b>+</b> free sample pack unlocked.'; pct = 100; }
      else if (total >= T) { msg = `Free shipping unlocked. Add <b>${money(S - total)}</b> for a free sample pack.`; pct = 100 * total / S; }
      else { msg = `Add <b>${money(T - total)}</b> to unlock free shipping.`; pct = 100 * total / T; }
      bar.innerHTML = `${msg}<div class="free-bar__track"><div class="free-bar__fill" style="width:${Math.min(100, pct)}%"></div></div>`;
      bar.classList.toggle('hide', !lines.length);
    }

    const codeEl = document.getElementById('cartCode');
    if (codeEl) {
      codeEl.innerHTML = code
        ? `<div class="cart-code__on">${ico('check')}
             <span><b>${esc(code.code)}</b> applied — ${esc(code.label)}</span>
             <button type="button" id="codeOff" aria-label="Remove discount code">&times;</button>
           </div>`
        : `<form class="cart-code__form" id="codeForm">
             <input id="codeIn" placeholder="Discount or referral code" aria-label="Discount or referral code">
             <button type="submit">Apply</button>
           </form><p class="cart-code__err hide" id="codeErr">That code isn't recognised.</p>`;
    }

    const sums = document.getElementById('cartSums');
    if (sums) {
      sums.innerHTML = `
        <div class="drawer__row"><span>Subtotal</span><span>${money(sub)}</span></div>
        ${code ? `<div class="drawer__row drawer__row--off">
          <span>Discount (${Math.round(code.off * 100)}%)</span><span>&minus;${money(off)}</span></div>` : ''}
        <div class="drawer__row"><span>Priority shipping</span><span>${shipping ? money(shipping) : 'Free'}</span></div>
        <div class="drawer__total"><span>Total</span><span id="cartTotal">${money(grandTotal)}</span></div>`;
    }

    // Points accrue on what is actually paid — see LOYALTY.earnOn.
    const earn = document.getElementById('cartEarn');
    if (earn && typeof earnLine === 'function') earn.innerHTML = earnLine(total, 'earn-line earn-line--cart');

    document.getElementById('cartFoot')?.classList.toggle('hide', !lines.length);
    // Anything showing a cart-dependent price can redraw off this.
    document.dispatchEvent(new CustomEvent('cart:change'));
  }
};

/* ══════════════════════════  CHECKOUT UPSELL  ══════════════════════════ */
const CheckoutUpsell = {
  sku: 'NAD-500',
  discount: 0.15,

  begin() {
    if (Cart.read().some(line => line.sku === this.sku)) return location.assign('/checkout.html');
    const product = bySlug('nad-plus');
    const size = product?.sizes.find(candidate => candidate.sku === this.sku);
    if (!product || !size) return location.assign('/checkout.html');

    const discounted = cents(size.price * (1 - this.discount));
    document.body.insertAdjacentHTML('beforeend', `
      <div class="checkout-upsell" role="dialog" aria-modal="true" aria-labelledby="checkoutUpsellTitle">
        <button class="checkout-upsell__scrim" type="button" aria-label="Continue without adding NAD+"></button>
        <section class="checkout-upsell__card">
          <button class="checkout-upsell__close" type="button" aria-label="Continue without adding NAD+">&times;</button>
          <span class="eyebrow">Checkout offer</span>
          <img src="${esc(product.image)}" alt="${esc(product.name)}">
          <h2 id="checkoutUpsellTitle">Add NAD+ and save 15%</h2>
          <p>Add NAD+ 10 mg to this order for <b>${money(discounted)}</b> <s>${money(size.price)}</s>.</p>
          <div class="checkout-upsell__actions">
            <button class="btn btn--primary btn--sq" type="button" data-upsell-add>Add NAD+ for ${money(discounted)}</button>
            <button class="checkout-upsell__continue" type="button" data-upsell-continue>Continue to checkout</button>
          </div>
        </section>
      </div>`);
    const modal = document.querySelector('.checkout-upsell');
    const dismiss = () => {
      document.removeEventListener('keydown', onKeydown);
      document.body.classList.remove('checkout-upsell-open');
      modal?.remove();
    };
    const proceed = () => { dismiss(); location.assign('/checkout.html'); };
    const onKeydown = event => { if (event.key === 'Escape') proceed(); };
    document.body.classList.add('checkout-upsell-open');
    modal.querySelector('.checkout-upsell__scrim').addEventListener('click', proceed);
    modal.querySelector('.checkout-upsell__close').addEventListener('click', proceed);
    modal.querySelector('[data-upsell-continue]').addEventListener('click', proceed);
    modal.querySelector('[data-upsell-add]').addEventListener('click', () => {
      dismiss();
      Cart.add(product.slug, size.sku, 1, this.discount);
      trackFunnel('checkout_upsell_added', { sku: size.sku, discount_percent: this.discount * 100 });
    });
    document.addEventListener('keydown', onKeydown);
    modal.querySelector('[data-upsell-add]').focus();
    trackFunnel('checkout_upsell_shown', { sku: size.sku, discount_percent: this.discount * 100 });
  },
};

/* ══════════════════════════  SECURE CHECKOUT DETAILS  ══════════════════════════ */
const Checkout = {
  profile: undefined,
  loading: false,
  active: false,

  showCart() {
    this.active = false;
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    drawer.classList.remove('is-checking-out');
    const title = document.getElementById('cartTitle');
    if (title) title.textContent = 'Your cart';
    this.render();
  },

  async begin() {
    this.active = true;
    trackFunnel('begin_checkout', funnelCartProperties());
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    drawer.classList.add('is-checking-out');
    const title = document.getElementById('cartTitle');
    if (title) title.textContent = 'Checkout';
    this.render();
    await this.load();
  },

  async load() {
    if (this.profile !== undefined || this.loading) return;
    this.loading = true;
    this.render();
    try {
      const response = await fetch('/api/checkout', { credentials: 'same-origin' });
      this.profile = response.ok ? await response.json() : { authenticated: false, account: null, address: null };
    } catch {
      this.profile = { authenticated: false, account: null, address: null };
    } finally {
      this.loading = false;
      this.render();
    }
  },

  render() {
    const host = document.getElementById('cartCheckoutDetails');
    if (!host) return;
    if (!this.active) {
      host.innerHTML = `
        <button class="btn btn--primary btn--block btn--sq" type="button" id="cartCheckoutStart">Checkout</button>
        <p class="cart-checkout__hint">Enter shipping information in the next step.</p>`;
      document.getElementById('cartCheckoutStart').addEventListener('click', () => {
        trackFunnel('begin_checkout', funnelCartProperties());
        CheckoutUpsell.begin();
      });
      return;
    }
    if (this.profile === undefined) {
      host.innerHTML = '<p class="cart-checkout__status">Loading secure checkout…</p>';
      return;
    }
    const profile = this.profile || {};
    const account = profile.account || {};
    const address = profile.address || {};
    const signedIn = profile.authenticated === true;
    const value = (key, fallback = '') => esc(address[key] || fallback || '');
    host.innerHTML = `
      <form id="cartCheckoutForm" novalidate>
        <button class="cart-checkout__back" type="button" id="cartCheckoutBack"> Back to cart</button>
        <div style="margin:8px 0 14px;font-size:12px;color:var(--ink-4)">
          ${signedIn
            ? `Signed in as <b style="color:var(--ink-2)">${esc(account.email)}</b>. Your order confirmation will go there.`
            : `Checking out as a guest? <a href="account.html?next=checkout" style="color:var(--accent);font-weight:700">Sign in</a> to use a saved address.`}
        </div>
        ${signedIn ? '' : `<label class="sr" for="cartCheckoutEmail">Order email</label>
          <input type="email" id="cartCheckoutEmail" autocomplete="email" placeholder="Email for this order" required>`}
        <p style="font-size:12px;color:var(--ink-3);font-weight:700;margin:14px 0 8px">Shipping information</p>
        <label class="sr" for="shipName">Recipient name</label>
        <input id="shipName" autocomplete="shipping name" placeholder="Recipient name" value="${value('recipient_name', account.name)}" required>
        <label class="sr" for="shipLine1">Address line 1</label>
        <input id="shipLine1" autocomplete="shipping address-line1" placeholder="Address line 1" value="${value('line1')}" required style="margin-top:8px">
        <label class="sr" for="shipLine2">Address line 2</label>
        <input id="shipLine2" autocomplete="shipping address-line2" placeholder="Apartment, suite, etc. (optional)" value="${value('line2')}" style="margin-top:8px">
        <div style="display:grid;grid-template-columns:1.4fr .7fr;gap:8px;margin-top:8px">
          <label class="sr" for="shipCity">City</label><input id="shipCity" autocomplete="shipping address-level2" placeholder="City" value="${value('city')}" required>
          <label class="sr" for="shipState">State</label><input id="shipState" autocomplete="shipping address-level1" placeholder="State" value="${value('region')}" required>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
          <label class="sr" for="shipZip">ZIP code</label><input id="shipZip" autocomplete="shipping postal-code" placeholder="ZIP code" value="${value('postal_code')}" required>
          <label class="sr" for="shipPhone">Phone</label><input id="shipPhone" type="tel" autocomplete="shipping tel" placeholder="Phone (optional)" value="${value('phone', account.phone)}">
        </div>
        <input id="shipCountry" type="hidden" value="US">
        ${signedIn ? `<label style="display:flex;gap:8px;align-items:flex-start;font-size:12px;color:var(--ink-3);margin-top:12px;cursor:pointer"><input id="saveShipping" type="checkbox" checked style="width:auto;margin-top:2px">Save this address to my account for faster checkout</label>` : ''}
        <p class="cart-checkout__status hide" id="cartCheckoutStatus" role="status"></p>
        <button class="btn btn--primary btn--block btn--sq" type="submit" id="cartCheckout" style="margin-top:14px">Continue to secure checkout</button>
      </form>`;
    document.getElementById('cartCheckoutBack').addEventListener('click', () => this.showCart());
    document.getElementById('cartCheckoutForm').addEventListener('submit', event => this.submit(event));
  },

  async submit(event) {
    event.preventDefault();
    const button = document.getElementById('cartCheckout');
    const status = document.getElementById('cartCheckoutStatus');
    const show = message => { status.textContent = message; status.classList.remove('hide'); };
    const signedIn = this.profile?.authenticated === true;
    const email = signedIn ? this.profile.account.email : document.getElementById('cartCheckoutEmail').value.trim();
    const shipping = {
      recipientName: document.getElementById('shipName').value.trim(), line1: document.getElementById('shipLine1').value.trim(),
      line2: document.getElementById('shipLine2').value.trim(), city: document.getElementById('shipCity').value.trim(),
      region: document.getElementById('shipState').value.trim(), postalCode: document.getElementById('shipZip').value.trim(),
      countryCode: 'US', phone: document.getElementById('shipPhone').value.trim(),
    };
    if (!email) { trackFunnel('checkout_error', { stage: 'shipping', reason: 'email' }); document.getElementById('cartCheckoutEmail')?.focus(); return show('Enter the email address for this order.'); }
    if (!shipping.recipientName || !shipping.line1 || !shipping.city || !shipping.region || !shipping.postalCode) { trackFunnel('checkout_error', { stage: 'shipping', reason: 'address' }); return show('Complete the shipping address before continuing.'); }
    button.disabled = true; button.textContent = 'Preparing secure checkout…'; status.classList.add('hide');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ email, shipping, saveShipping: signedIn ? document.getElementById('saveShipping').checked : false, code: Cart.code()?.code || null, lines: Cart.checkoutLines() }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || 'Checkout is unavailable right now.');
      try { sessionStorage.setItem('biostem_payment_redirect', JSON.stringify({ at: Date.now(), ...funnelCartProperties() })); } catch {}
      trackFunnel('payment_redirect', funnelCartProperties());
      location.assign(result.checkoutUrl);
    } catch (error) {
      trackFunnel('checkout_error', { stage: 'payment', reason: 'unavailable' });
      show(error.message || 'Checkout is unavailable right now.');
      button.disabled = false; button.textContent = 'Continue to secure checkout';
    }
  },
};

/* ═══════════════════════ SESSION / CART BOUNDARY ═══════════════════════
   The cart is deliberately local so it survives ordinary page navigation, but
   it must not survive the account session that created it. The server can
   expire or revoke a session without the account page ever being opened, so
   keep a small non-sensitive marker and reconcile it on every shared page. */
const AuthCartSync = {
  key: 'biostem_authenticated_user_v1',
  lastCheck: 0,
  inFlight: null,

  marker() {
    try { return localStorage.getItem(this.key); } catch { return null; }
  },

  remember(account) {
    if (!account?.id) return;
    try { localStorage.setItem(this.key, account.id); } catch {}
  },

  clearMarker() {
    try { localStorage.removeItem(this.key); } catch {}
  },

  async check(force = false) {
    const now = Date.now();
    if (!force && (this.inFlight || now - this.lastCheck < 30000)) return this.inFlight;
    this.lastCheck = now;
    this.inFlight = fetch('/api/auth/session', { credentials: 'same-origin' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return null;
        return data.account || null;
      })
      .then(account => {
        if (account?.id) {
          this.remember(account);
          return account;
        }
        // Only clear when this browser previously had an authenticated session.
        // Anonymous visitors should retain a normal shopping cart.
        if (this.marker()) {
          this.clearMarker();
          Cart.clear();
        }
        return null;
      })
      .catch(() => null)
      .finally(() => { this.inFlight = null; });
    return this.inFlight;
  },
};

// No authenticated account exists in this static package, so skip the live
// session reconciliation request entirely.
AuthCartSync.check = async () => null;

// Run on pages that do not mount the shared navigation (notably checkout.html).
AuthCartSync.check();

// Product views are captured after product.html has selected and rendered its
// requested product. This tracks genuine detail-page interest, not card
// impressions while browsing a collection.
addEventListener('load', () => {
  if (!location.pathname.endsWith('/product.html')) return;
  const product = bySlug(qs('p'));
  if (!product) return;
  trackFunnel('view_product', { sku: product.sizes[0]?.sku || product.slug, category: product.categorySlug });
});

/* ══════════════════════════  CHROME (nav / footer / drawer)  ══════════════════════════ */
const NAV = [
  ['index.html', 'Home'], ['shop.html', 'Shop'], ['bundles.html', 'Stacks'], ['coa.html', 'Documentation'],
  ['rewards.html', 'Rewards'], ['about.html', 'About'],
  ['faq.html', 'FAQ'], ['contact.html', 'Contact'],
];

// Referral links are captured by a server-set HttpOnly cookie before account
// creation. The browser only forwards a code from the URL; the server resolves
// ownership and the signup route writes the durable attribution record.
function captureReferralFromUrl() {
  const params = new URLSearchParams(location.search);
  // Ambassador links include both values. `ref` is the attribution key; the
  // campaign fallback keeps a correctly tagged affiliate link attributable if
  // a platform strips only the ref parameter during a redirect.
  const code = params.get('ref') || (
    params.get('utm_source') === 'ambassador' && params.get('utm_medium') === 'referral'
      ? params.get('utm_campaign') : null
  );
  if (!code || !/^[A-Z][A-Z0-9-]{3,23}$/i.test(code)) return;
  fetch('/api/referral/capture', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({ code }),
  }).catch(() => {});
}

function mountChrome() {
  const here = location.pathname.split('/').pop() || 'index.html';

  document.getElementById('siteHeader').innerHTML = `
    <div class="announce">
      <a class="announce__full" href="account.html?new=1">Refer a friend and earn up to 10% of their order! &nbsp;·&nbsp; Free shipping on orders of $200 or more</a>
      <a class="announce__short" href="account.html?new=1">Refer a friend� earn up to 10%! &nbsp;·&nbsp; Free shipping $200+</a>
    </div>
    <nav class="nav"><div class="wrap nav__in">
      <a href="index.html" aria-label="BioStem Labs home">${brandLockup()}</a>
      <div class="nav__links" id="navLinks">
        ${NAV.map(([h, l]) => `<a href="${h}" class="${h === here ? 'is-active' : ''}">${l}</a>`).join('')}
      </div>
      <div class="nav__actions">
        <button class="icon-btn icon-btn--opt" id="siteSearchOpen" aria-label="Search site" aria-expanded="false">${ico('search')}</button>
        <a class="icon-btn icon-btn--opt" href="account.html" aria-label="Researcher account">${ico('user')}</a>
        <button class="icon-btn cart-btn" id="cartOpen" aria-label="Open cart">
          ${ico('cart')}<span class="cart-count hide" data-cart-count>0</span>
        </button>
        <button class="icon-btn nav__burger" id="burger" aria-label="Menu" aria-expanded="false">${ico('menu')}</button>
      </div>
    </div></nav>
    <div class="site-search" id="siteSearch" hidden>
      <div class="site-search__panel" role="dialog" aria-modal="true" aria-label="Search BioStem Labs">
        <div class="site-search__field">${ico('search')}<input id="siteSearchInput" type="search" placeholder="Search compounds, stacks, COAs, and site information" autocomplete="off"><button type="button" id="siteSearchClose" aria-label="Close search">${ico('x')}</button></div>
        <div class="site-search__results" id="siteSearchResults" aria-live="polite"></div>
      </div>
    </div>`;

  document.getElementById('siteFooter').innerHTML = `
    <footer class="foot"><div class="wrap">
      <div class="foot__top">
        <div>
          ${brandLockup(true)}
          <p class="foot__blurb">Research compounds with published lot documentation where available. Precision. Documentation. Consistency.</p>
          <div class="foot__social" aria-label="Follow BioStem Labs">
            <a href="https://www.instagram.com/biostem_labs/" target="_blank" rel="noopener noreferrer" aria-label="BioStem Labs on Instagram"><img src="/assets/social-instagram.svg" alt=""></a>
            <a href="https://www.tiktok.com/@biostem.labs" target="_blank" rel="noopener noreferrer" aria-label="BioStem Labs on TikTok"><img src="/assets/social-tiktok.svg" alt=""></a>
            <a href="https://www.linkedin.com/company/biostem-labs" target="_blank" rel="noopener noreferrer" aria-label="BioStem Labs on LinkedIn"><img src="/assets/social-linkedin.svg" alt=""></a>
          </div>
        </div>
        <div><h2>Catalog</h2><ul>
          <li><a href="bundles.html">Research stacks</a></li>
          ${CATEGORIES.map(c => `<li><a href="shop.html?cat=${c.slug}">${catTheme(c.slug).name}</a></li>`).join('')}
        </ul></div>
        <div><h2>Documentation</h2><ul>
          <li><a href="coa.html">COA lookup</a></li><li><a href="about.html#quality">Quality &amp; testing</a></li>
          <li><a href="about.html#handling">Storage &amp; handling</a></li><li><a href="faq.html">FAQ</a></li>
        </ul></div>
        <div><h2>Company</h2><ul>
          <li><a href="rewards.html">Rewards &amp; referrals</a></li>
          <li><a href="account.html">My account</a></li>
          <li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li>
          <li><a href="faq.html#shipping">Shipping</a></li><li><a href="legal.html">Terms &amp; privacy</a></li>
        </ul></div>
      </div>
      <div class="foot__legal">
        <p><b>FOR RESEARCH USE ONLY.</b> All products sold by BioStem Labs are intended strictly for research, laboratory, analytical, and development purposes only. Not for human consumption. Not intended for medical, therapeutic, or diagnostic use. Statements have not been evaluated by the FDA. By purchasing, customers acknowledge all products are for legitimate research purposes only.</p>
        <p><b>DEA / CSA COMPLIANCE.</b> None of our products are controlled substances under the Controlled Substances Act. Purchasers are solely responsible for compliance with all applicable federal, state, and local laws governing the purchase and use of research chemicals.</p>
        <p><b>AGE RESTRICTION.</b> You must be at least 21 years of age to register and purchase from BioStem Labs. All sales are final.</p>
      </div>
      <div class="foot__bar">
        <span>&copy; 2026 BioStem Labs. All Rights Reserved.</span>
        <span>Published lot documentation &nbsp;·&nbsp; For research use only</span>
      </div>
    </div></footer>

    <div class="scrim" id="scrim"></div>
    <aside class="drawer" id="cartDrawer" aria-label="Cart">
      <div class="drawer__head">
        <h3 id="cartTitle">Your cart</h3>
        <button class="icon-btn" id="cartClose" aria-label="Close cart">${ico('x')}</button>
      </div>
      <div class="drawer__body" id="cartBody"></div>
      <div class="drawer__foot hide" id="cartFoot">
        <div class="free-bar" id="freeBar"></div>
        <div class="cart-code" id="cartCode"></div>
        <div class="cart-sums" id="cartSums"></div>
        <div id="cartEarn"></div>
        <div class="cart-checkout"><div id="cartCheckoutDetails"></div>
          <p style="font-size:11px;color:var(--ink-4);text-align:center">Secure checkout is hosted by our payment partner. Card and supported crypto methods vary by region.</p></div>
      </div>
    </aside>`;

  // These are root-relative in the production site; keep them local here.
  document.querySelectorAll('.foot__social img').forEach(img => {
    img.src = img.getAttribute('src').replace(/^\/+/, '');
  });

  // wiring
  document.getElementById('burger')?.addEventListener('click', e => {
    const l = document.getElementById('navLinks');
    const open = l.classList.toggle('is-open');
    e.currentTarget.setAttribute('aria-expanded', open);
  });
  document.getElementById('cartOpen')?.addEventListener('click', () => Cart.open());
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-card-add]');
    if (!button) return;
    event.preventDefault();
    Cart.add(button.dataset.slug, button.dataset.sku, 1, 0);
  });
  mountSiteSearch();
  document.getElementById('cartClose')?.addEventListener('click', () => Cart.close());
  document.getElementById('scrim')?.addEventListener('click', () => Cart.close());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') Cart.close(); });
  document.getElementById('cartBody')?.addEventListener('click', e => {
    const b = e.target.closest('[data-rm]'); if (b) { Cart.remove(b.dataset.rm); return; }
    // Solvent prompt: adds the diluent the cart is missing. Delegated, because the
    // prompt is re-rendered on every paint.
    const sv = e.target.closest('[data-solvent]');
    if (sv) Cart.add(sv.dataset.slug, sv.dataset.solvent, 1, 0);
  });
  // The code row is re-rendered on every paint, so listen on the container.
  document.getElementById('cartCode')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('codeIn');
    const res = Cart.applyCode(input.value);
    if (!res.ok) {
      const err = document.getElementById('codeErr');
      if (err) {
        err.textContent = res.reason === 'used'
          ? 'That code has already been used on this email.'
          : "That code isn't recognised.";
        err.classList.remove('hide');
      }
      input.focus();
    }
  });
  document.getElementById('cartCode')?.addEventListener('click', e => {
    if (e.target.id === 'codeOff') Cart.clearCode();
  });
  // A visitor arriving on ?ref=CODE is attributed before they touch anything.
  if (typeof captureAttribution === 'function') captureAttribution();
  captureReferralFromUrl();

  Cart.paint();
  AuthCartSync.check();
  window.addEventListener('pageshow', () => AuthCartSync.check(true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') AuthCartSync.check(true);
  });
  window.setInterval(() => AuthCartSync.check(), 60000);
  if (typeof Rewards !== 'undefined') Rewards.paint();
  observeReveals();

  // First-session welcome offer. Guarded so pages that don't load promo.js
  // (and the /bundles/ landing pages, which never call mountChrome) are unaffected.
  if (typeof mountPromo === 'function') mountPromo();
}

function mountSiteSearch() {
  const host = document.getElementById('siteSearch'), input = document.getElementById('siteSearchInput'), results = document.getElementById('siteSearchResults'), open = document.getElementById('siteSearchOpen');
  if (!host || !input || !results || !open) return;
  const pages = [
    ['Quality & testing', 'How BioStem tests and documents catalog materials', 'about.html#quality'], ['COA lookup', 'Find a certificate of analysis by lot code', 'coa.html'], ['Research rewards', 'Points, referrals, and Ambassador program', 'rewards.html'], ['Research stacks', 'Curated multi-component collections', 'bundles.html'], ['FAQ', 'Shipping, documentation, and research-use questions', 'faq.html'], ['Contact', 'Researcher support and documentation enquiries', 'contact.html']
  ];
  const items = [...(typeof PRODUCTS !== 'undefined' ? PRODUCTS.filter(p => p.inStock).map(p => [p.name, `${p.subtitle} · ${p.category}`, `product.html?p=${p.slug}`]) : []), ...(typeof BUNDLES_LP !== 'undefined' ? BUNDLES_LP.map(b => [b.name, b.kicker || 'Research collection', b.url]) : []), ...pages];
  const close = () => { host.hidden = true; open.setAttribute('aria-expanded', 'false'); };
  const render = () => { const q = input.value.trim().toLowerCase(); const matches = q ? items.filter(item => item.join(' ').toLowerCase().includes(q)).slice(0, 7) : items.slice(0, 6); results.innerHTML = `<p class="site-search__label">${q ? 'Suggested results' : 'Explore BioStem Labs'}</p>${matches.length ? matches.map(([name, detail, href]) => `<a href="${href}"><b>${esc(name)}</b><span>${esc(detail)}</span>${ico('arrow')}</a>`).join('') : '<p class="site-search__empty">No matching pages or materials. Try a compound, stack, COA, or topic.</p>'}`; };
  open.addEventListener('click', () => { host.hidden = false; open.setAttribute('aria-expanded', 'true'); render(); input.focus(); });
  document.getElementById('siteSearchClose')?.addEventListener('click', close);
  input.addEventListener('input', render);
  host.addEventListener('click', e => { if (e.target === host) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !host.hidden) close(); });
}

function observeReveals() {
  const els = [...document.querySelectorAll('.reveal:not(.is-in)')];
  if (!els.length) return;
  const show = e => e.classList.add('is-in');

  if (!('IntersectionObserver' in window)) { els.forEach(show); return; }

  const io = new IntersectionObserver(ents => {
    ents.forEach(en => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  els.forEach(e => io.observe(e));

  // Failsafe: IntersectionObserver callbacks are suspended while a tab is
  // backgrounded, and anything above the fold must never be left at opacity 0.
  // Reveal whatever is already in view immediately, and hard-release the rest
  // shortly after load so a stalled observer can never hide content.
  const inView = e => {
    const r = e.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  };
  els.filter(inView).forEach(e => { show(e); io.unobserve(e); });
  setTimeout(() => els.forEach(e => { if (!e.classList.contains('is-in')) { show(e); io.unobserve(e); } }), 2500);
}

/* ══════════════════════════  PRODUCT CARD  ══════════════════════════ */
function productCard(p) {
  const t = catTheme(p.categorySlug);
  const size = p.sizes[0];
  return `<article class="card card--product" style="${catVars(p.categorySlug)}">
    <a class="card__link" href="product.html?p=${p.slug}" aria-label="View ${esc(p.name)}">
      <div class="card__media">${productArt(p)}</div>
      <div class="card__body">
        <span class="card__cat">${esc(t.name)}</span>
        <span class="card__name">${esc(p.name)}</span>
        <span class="card__sub">${esc(p.subtitle)}</span>
        <span class="card__coa${typeof hasCoa === 'function' && hasCoa(p.slug) ? '' : ' card__coa--empty'}">
          ${typeof hasCoa === 'function' && hasCoa(p.slug) ? `${ico('doc')}COA available` : '&nbsp;'}
        </span>
      </div>
    </a>
    <div class="card__foot">
      <a class="card__go" href="product.html?p=${p.slug}">View</a>
      <span class="card__price">${money(size.price)}</span>
      <button class="card__add" type="button" data-card-add data-slug="${esc(p.slug)}" data-sku="${esc(size.sku)}" aria-label="Add ${esc(p.name)} to cart">${ico('plus')}</button>
    </div>
  </article>`;
}

/* Search metadata for the client-rendered catalog and category pages. */
function applySearchMetadata() {
  const origin = 'https://www.biostemlabs.com';
  const path = location.pathname === '/' || /\/index\.html$/i.test(location.pathname) ? '/' : location.pathname;
  const query = new URLSearchParams(location.search);
  const product = /\/product\.html$/i.test(path) && typeof bySlug === 'function' ? bySlug(query.get('p')) : null;
  const category = /\/shop\.html$/i.test(path) && typeof CATEGORIES !== 'undefined' ? CATEGORIES.find(c => c.slug === query.get('cat')) : null;
  let canonicalPath = path;
  if (product) canonicalPath += '?p=' + encodeURIComponent(product.slug);
  const canonical = origin + canonicalPath;

  if (product) {
    document.title = `${product.name} Research Compound | BioStem Labs`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `${product.name}: ${product.description} Research use only.`.slice(0, 155);
  } else if (category) {
    document.title = `${category.name} Research Catalog | BioStem Labs`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `Browse BioStem Labs ${category.name.toLowerCase()} compounds with third-party testing and lot-specific certificates of analysis.`;
  } else if (path === '/') {
    document.title = 'Research-Grade Peptides | BioStem Labs';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'Research-grade peptides with third-party testing, lot-specific certificates of analysis, and next-business-day priority shipping. For research use only.';
  } else if (/\/rewards\.html$/i.test(path)) {
    document.title = 'Research Rewards & Referrals | BioStem Labs';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'Earn BioStem Rewards points on research orders and referrals, then redeem them across the catalog. For research use only.';
  }

  const description = document.querySelector('meta[name="description"]')?.content || '';
  const image = product?.image ? origin + '/' + product.image : origin + '/assets/biostemhero.webp';
  const set = (selector, attribute, value) => {
    let el = document.head.querySelector(selector);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attribute, selector.match(/="([^"]+)/)?.[1] || ''); document.head.append(el); }
    el.content = value;
  };
  let canonicalLink = document.head.querySelector('link[rel="canonical"]');
  if (!canonicalLink) { canonicalLink = document.createElement('link'); canonicalLink.rel = 'canonical'; document.head.append(canonicalLink); }
  canonicalLink.href = canonical;
  set('meta[property="og:type"]', 'property', product ? 'product' : 'website');
  set('meta[property="og:title"]', 'property', document.title);
  set('meta[property="og:description"]', 'property', description);
  set('meta[property="og:url"]', 'property', canonical);
  set('meta[property="og:image"]', 'property', image);
  set('meta[name="twitter:card"]', 'name', 'summary_large_image');
  set('meta[name="twitter:title"]', 'name', document.title);
  set('meta[name="twitter:description"]', 'name', description);
  set('meta[name="twitter:image"]', 'name', image);

  const schema = product ? {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name, description, image, url: canonical,
    brand: { '@type': 'Brand', name: 'BioStem Labs' }, category: product.category,
    offers: { '@type': 'Offer', priceCurrency: 'USD', price: product.sizes[0].price, availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: canonical },
  } : {
    '@context': 'https://schema.org', '@type': path === '/' ? 'WebSite' : 'WebPage', name: document.title, description, url: canonical,
    publisher: { '@type': 'Organization', name: 'BioStem Labs', url: origin },
  };
  let jsonLd = document.getElementById('searchStructuredData');
  if (!jsonLd) { jsonLd = document.createElement('script'); jsonLd.type = 'application/ld+json'; jsonLd.id = 'searchStructuredData'; document.head.append(jsonLd); }
  jsonLd.textContent = JSON.stringify(schema);
}

document.addEventListener('DOMContentLoaded', applySearchMetadata);
// This static portfolio package does not show the live site's access gate or
// send optional email submissions to an unavailable API.



/* ═══════════════════════  MAILING-LIST SECTION  ═══════════════════════
   Homepage: replaces #newsletterSlot. Elsewhere: sits directly above the
   footer. Skipped where it would compete with the page's own job — checkout,
   admin, and the account pages, where visitors are already signing up. */
function mountNewsletter() {
  if (document.getElementById('newsletter')) return;
  if (document.body.matches('.checkout-page, .admin-page')) return;
  if (/\/accounts?\.html$/.test(location.pathname)) return;
  const slot = document.getElementById('newsletterSlot');
  const anchor = slot || document.getElementById('siteFooter') || document.querySelector('footer.foot');
  if (!anchor) return;
  const source = slot ? 'newsletter_home' : 'newsletter_footer';

  anchor.insertAdjacentHTML('beforebegin', `
    <section class="newsletter${slot ? '' : ' newsletter--prefoot'}" id="newsletter" aria-labelledby="newsletterTitle">
      <div class="wrap"><div class="newsletter__card">
        <div class="newsletter__copy">
          <span class="eyebrow">Research list</span>
          <h2 class="h2" id="newsletterTitle">Stay ahead of every release</h2>
          <p class="lede">New compounds, restock notices, and batch documentation updates, sent only when there's something worth knowing.</p>
        </div>
        <form class="newsletter__form" id="newsletterForm" novalidate>
          <div class="newsletter__row">
            <label class="sr" for="newsletterEmail">Email address</label>
            <input id="newsletterEmail" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@lab.com" required>
            <button class="btn btn--primary" type="submit">Subscribe</button>
          </div>
          <input class="newsletter__hp" name="companyWebsite" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
          <p class="newsletter__msg" role="status" aria-live="polite"></p>
          <p class="newsletter__fine">Unsubscribe any time. See our <a href="${ASSET_BASE}legal.html">terms &amp; privacy</a>.</p>
        </form>
      </div></div>
    </section>`);
  slot?.remove();

  const form = document.getElementById('newsletterForm');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const input = form.elements.email, button = form.querySelector('button[type="submit"]');
    const msg = form.querySelector('.newsletter__msg');
    const email = input.value.trim();
    msg.className = 'newsletter__msg';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      msg.textContent = 'Enter a valid email address.';
      msg.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    button.disabled = true;
    button.textContent = 'Subscribing…';
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true, source, companyWebsite: form.elements.companyWebsite.value }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not add you right now. Please try again.');
      form.innerHTML = `<p class="newsletter__done">${ico('check')}<span><b>You're on the list.</b> Watch your inbox for the next release.</span></p>`;
      // Just subscribed: don't interrupt with the welcome modal this session.
      if (typeof PromoStore !== 'undefined') PromoStore.markShown();
      if (typeof Promo !== 'undefined' && !Promo.isOpen?.()) Promo.disarm?.();
    } catch (error) {
      msg.textContent = error.message;
      msg.classList.add('is-error');
      button.disabled = false;
      button.textContent = 'Subscribe';
    }
  });
}
document.addEventListener('DOMContentLoaded', mountNewsletter);

/* ═══════════════════════  HERO RECOVERY STACK  ═══════════════════════ */
function mountHeroRecoveryStack(id, base = '') {
  const el = document.getElementById(id);
  if (!el) return;
  const stack = typeof bundleBySlug === 'function' ? bundleBySlug('recovery-stack') : null;
  const math = stack && typeof bundleMath === 'function' ? bundleMath(stack) : null;
  if (!stack || !math) { el.remove(); return; }
  const products = math.lines.filter(line => line.p.categorySlug !== 'signaling-defense-other').slice(0, 3);
  el.innerHTML = `<a class="hero__stack-card" href="${base}${stack.url}" style="${catVars(stack.categorySlug)}">
    <span class="hero__stack-card__top"><b>Purchase the Recovery Stack</b><span>Save ${money(math.saving)}</span></span>
    <span class="hero__stack-card__foot">
      <span class="hero__stack-card__products">${products.map(line => esc(line.p.name)).join(' · ')}</span>
      <b>${money(math.price)}</b><span aria-hidden="true"></span>
    </span>
  </a>`;
}

/* ═══════════════════════  MOBILE STICKY BUY BAR  ═══════════════════════
   On a phone the product page's Add-to-cart sits ~1,200px down — roughly two
   screens — and the .buy block it lives in is 235px tall, so making that block
   itself sticky would eat a third of the viewport. Instead a slim bar appears
   once the real button scrolls out of view and forwards taps straight to it,
   so there is still exactly one add-to-cart code path.

   Progressive enhancement, and deliberately lives here rather than in the page
   template: every product page loads this file by src, including the
   prerendered ones, so it needs no regeneration to take effect. */
function mountStickyBuy() {
  const add = document.getElementById('add');
  const buy = add && add.closest('.buy');
  if (!add || !buy) return;
  if (!window.matchMedia('(max-width: 900px)').matches) return;
  if (document.querySelector('.buybar')) return;

  const bar = document.createElement('div');
  bar.className = 'buybar';
  bar.hidden = true;
  const label = document.createElement('span');
  label.className = 'buybar__label';
  const button = document.createElement('button');
  button.className = 'btn btn--primary btn--sq buybar__btn';
  button.type = 'button';
  bar.append(label, button);

  // Mirror the live button's text, which carries the running total and updates
  // as the bundle selection changes.
  const sync = () => {
    const total = add.querySelector('#btnTotal');
    label.textContent = document.querySelector('.pdp__title')?.textContent.trim() || '';
    button.textContent = total ? `Add to cart — ${total.textContent}` : 'Add to cart';
  };
  sync();
  new MutationObserver(sync).observe(add, { childList: true, subtree: true, characterData: true });

  // Forward rather than re-implement: the real handler owns cart state.
  button.addEventListener('click', () => add.click());

  document.body.appendChild(bar);

  // Show only once the reader has scrolled past the real button. A plain
  // scroll check rather than IntersectionObserver: this is one element, the
  // read is cheap behind rAF, and it can't be defeated by an observer that
  // never fires. (observeReveals already carries a timeout for the same
  // reason.) Passive listeners keep scrolling smooth on touch.
  let queued = false;
  const update = () => {
    queued = false;
    const r = add.getBoundingClientRect();
    // Hidden while the button is still visible, or still below the fold.
    bar.hidden = r.bottom > 0 && r.top < window.innerHeight || r.top >= window.innerHeight;
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  // The PDP renders its markup in an inline script after this file loads, so
  // defer a tick rather than racing it.
  setTimeout(mountStickyBuy, 0);
});

/* ═══════════════════════  MEASURED CHROME HEIGHT  ═══════════════════════
   --chrome-h is the height the hero subtracts from the viewport to fill
   exactly one screen. It was a hard-coded 103px, which is only correct while
   the announcement bar stays on one line — at 320px it wraps and the real
   chrome is ~175px, so the hero overshot the fold by the difference.
   Measuring it keeps the hero honest on every device instead of one. */
function syncChromeHeight() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  // The hero's own offset from the top of the document *is* the chrome height,
  // so measure that rather than summing header parts — the announcement bar is
  // nested inside the header and summing them double-counts it.
  const h = hero.getBoundingClientRect().top + window.scrollY;
  if (h > 0 && h < window.innerHeight) {
    document.documentElement.style.setProperty('--chrome-h', Math.round(h) + 'px');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  syncChromeHeight();
  // The header is injected by mountChrome and web fonts can reflow the
  // announcement bar, so re-measure once things have settled.
  setTimeout(syncChromeHeight, 0);
  if (document.fonts?.ready) document.fonts.ready.then(syncChromeHeight);
  addEventListener('resize', syncChromeHeight, { passive: true });
  addEventListener('orientationchange', syncChromeHeight);
});

/* ═══════════════════════  STICKY HERO CTA (mobile)  ═══════════════════════
   The hero's own button stays in normal flow — that is what keeps it from
   landing on the product tiles on narrow screens, which is what the fixed
   version used to do. This bar takes over only once that button has scrolled
   off the top, and stands down again when the footer arrives, so it never
   covers the footer the way the old always-on fixed CTA did. */
function mountStickyHeroCta() {
  const cta = document.querySelector('.hero__cta .btn--primary');
  if (!cta) return;
  if (!window.matchMedia('(max-width: 900px)').matches) return;
  if (document.querySelector('.ctabar')) return;

  const bar = document.createElement('div');
  bar.className = 'ctabar';
  bar.hidden = true;

  const link = document.createElement('a');
  link.className = 'btn btn--primary btn--sq ctabar__btn';
  link.href = cta.getAttribute('href') || 'shop.html';
  link.textContent = cta.textContent.trim();
  bar.appendChild(link);
  document.body.appendChild(bar);

  const footer = document.querySelector('footer, .foot, #siteFooter');

  let queued = false;
  const update = () => {
    queued = false;
    const r = cta.getBoundingClientRect();
    const scrolledPastCta = r.bottom <= 0;
    const footerInView = footer
      ? footer.getBoundingClientRect().top <= window.innerHeight
      : false;
    bar.hidden = !scrolledPastCta || footerInView;
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();
}

document.addEventListener('DOMContentLoaded', () => setTimeout(mountStickyHeroCta, 0));
