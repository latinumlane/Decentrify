/* assets/mcmarden.js — McMARDEN · NOIR · presentation layer.
   Ported from the static build. Commerce (cart, add-to-bag, set
   pricing, product data) has been removed and lives in
   mcmarden-commerce.js, which talks to Shopify instead of
   localStorage. Everything here is pure presentation and is
   deliberately identical to the static site. */

/* ════════════ 0b. JS FLAG ════════════
   Set before anything else. Every "hidden until revealed" style is scoped
   to `.js`, so if this file fails to load the content is simply visible
   rather than stuck off-screen. */

document.documentElement.classList.add("js");

/* ════════════ 0c. NOIR → COLOUR ════════════
   Every image on the site starts desaturated and bleeds into colour when
   it reaches the viewport — so the effect keeps happening as you move
   down the page rather than firing once at the top.

   Exposed as window.__noir so imagery built later (cascade plates, the
   sticky preview viewers, quick view) can join the same treatment. */

const noir = (() => {
  const paint = (img) => { img.dataset.colorized = "true"; };

  if (!("IntersectionObserver" in window)) {
    const all = (root = document) => root.querySelectorAll("img").forEach(paint);
    return { observe: paint, observeAll: all };
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      // Small stagger so a grid of images doesn't turn as one block.
      setTimeout(() => paint(e.target), 40 + Math.random() * 260);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

  return {
    observe: (img) => io.observe(img),
    observeAll: (root = document) => root.querySelectorAll("img").forEach(i => io.observe(i))
  };
})();
window.__noir = noir;

/* ════════════ 0d. TYPEWRITER ════════════
   Shared by the loader and the hero headline. Returns a token-checked
   promise so a run still in flight can be abandoned. */

const wait = (ms) => new Promise(r => setTimeout(r, ms));

let typeJob = 0;
const cancelTyping = () => { typeJob++; };

async function typewriter(el, text, { erase = false, base = 34, jitter = 26 } = {}) {
  if (!el) return false;
  const mine = ++typeJob;
  el.dataset.caret = "typing";

  if (erase) {
    let cur = el.textContent;
    while (cur.length && typeJob === mine) {
      cur = cur.slice(0, -1);
      el.textContent = cur;
      await wait(14);
    }
  } else {
    el.textContent = "";
  }

  for (let k = 0; k < text.length && typeJob === mine; k++) {
    el.textContent = text.slice(0, k + 1);
    // A touch of jitter reads as a hand rather than a metronome.
    await wait(text[k] === " " ? base * 0.7 : base + Math.random() * jitter);
  }
  if (typeJob === mine) delete el.dataset.caret;
  return typeJob === mine;
}

/* ════════════ 0e. HAS THE INTRO ALREADY PLAYED? ════════════
   The typed opening is a first-impression, not a toll booth. It runs
   once per browsing session; coming back to the home page from anywhere
   else in the site goes straight in.

   sessionStorage (not localStorage) so a genuinely new visit still gets
   it, and wrapped because Safari private mode throws on access. */

const INTRO_KEY = "mcmarden.intro.seen";

/* `?intro` (or #intro) forces the opening to play again — the session
   flag otherwise makes it un-reviewable without clearing storage by
   hand, which reads as "the loader is broken". */
const introForced = /(^|[?&])intro\b/.test(location.search) || location.hash === "#intro";
if (introForced) { try { sessionStorage.removeItem(INTRO_KEY); } catch {} }

const introSeen = introForced ? false : (() => {
  try { return sessionStorage.getItem(INTRO_KEY) === "1"; } catch { return false; }
})();
const markIntroSeen = () => {
  try { sessionStorage.setItem(INTRO_KEY, "1"); } catch { /* private mode */ }
};

/* ════════════ 1. LOADER ════════════
   The house story is typed out while the page loads. The loader clears
   once BOTH the window has loaded and the line has finished — or when
   the failsafe fires, whichever comes first. Content is never held
   behind this longer than the failsafe. */

(() => {
  const loader = document.querySelector(".loader");
  const line   = document.querySelector("[data-loader-type]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
               || introSeen;

  let colorTimer, typed = false, loaded = false, finished = false;

  const done = () => {
    if (finished) return;
    finished = true;
    cancelTyping();
    if (line) { line.textContent = STORY; delete line.dataset.caret; }
    document.body.setAttribute("data-loaded", "true");
    // Marked here, not only from the homepage hero's own intro gate —
    // the hero (and its markIntroSeen call) only exists on the homepage
    // template, so a session that starts on any other page never set
    // this flag and replayed the full typed loader on every single page
    // load. Marking it as soon as THIS loader clears, on every page,
    // means only the first page visited in a session ever types it out.
    markIntroSeen();
    // Hold the noir a beat after the loader clears, then start watching —
    // whatever is already on screen begins bleeding to colour first.
    clearTimeout(colorTimer);
    colorTimer = setTimeout(() => noir.observeAll(), 500);
    document.dispatchEvent(new CustomEvent("mcm:loaded"));
  };

  const STORY = line ? line.textContent.trim() : "";
  // A beat on the finished line before the sheet starts to go, so the
  // handover reads as a dissolve rather than a cut.
  const maybeDone = () => { if (typed && loaded) setTimeout(done, 750); };

  const onLoad = () => { loaded = true; maybeDone(); };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad);

  if (!loader || !line || reduced) {
    typed = true;
    if (reduced) {
      // The 300ms settle is only meaningful when a sheet is actually on
      // screen to be dissolved. On a second page in the session the head
      // script has already hidden it outright, so waiting here would just
      // hold the page's own reveal back for no visible reason.
      const introDone = document.documentElement.classList.contains("intro-done");
      if (introDone) done();
      else setTimeout(done, 300);
    }
  } else {
    typewriter(line, STORY, { base: 19, jitter: 16 })
      .then(() => { typed = true; maybeDone(); });
  }

  // Failsafe — never gate content behind a loader that stalls. Sits well
  // clear of the longest honest run (type ~4.5s + the settling beat).
  setTimeout(done, 9500);
})();

/* ════════════ 2. AMBIENT CHROME — clock ════════════ */

(() => {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  const tick = () => {
    const now = new Date();
    const opts = { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
    el.textContent = new Intl.DateTimeFormat("en-US", opts).format(now) + " PST";
  };
  tick(); setInterval(tick, 1000);
})();

/* ════════════ 3. HEADER STATE — scrolled ════════════
   data-mode is the RESTING colour and is owned entirely by
   sections/mcmarden-header.liquid's start_mode setting — this script
   never touches it. A previous version of this module tried to also
   track whether a hero photograph was still behind the bar and flip
   data-mode live, keyed off a data-start-mode attribute — but that
   attribute was never actually emitted in the markup, so the whole
   branch silently never ran. Removed rather than fixed: nothing on the
   site depends on data-mode changing after load, and the CSS override
   for "scrolled while resting light" is now an explicit compound
   selector (.header[data-mode="light"][data-scrolled="true"] in
   mcmarden.css) rather than something this script needs to arbitrate. */

(() => {
  const header = document.querySelector(".header");
  if (!header) return;
  // The switch point is owned by sections/mcmarden-header.liquid
  // (data-switch-at) so it is tunable from the customizer rather than buried
  // here. Read once: this module is not re-run on shopify:section:load, so a
  // change in the theme editor needs a preview refresh to take effect.
  const switchAt = parseInt(header.dataset.switchAt, 10);
  const SWITCH_AT = Number.isNaN(switchAt) ? 8 : switchAt;
  const update = () => {
    header.dataset.scrolled = window.scrollY > SWITCH_AT ? "true" : "false";
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();

/* ════════════ 4. MOBILE NAV ════════════ */

(() => {
  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.querySelector(".mobile-nav");
  if (!toggle || !drawer) return;

  // State lives on aria-expanded — the burger/cross is drawn from it, so
  // the button's own label is never rewritten.
  const set = (open) => {
    drawer.dataset.open = open ? "true" : "false";
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
  drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.dataset.open === "true") set(false);
  });
})();

/* ════════════ 5. SCROLL REVEAL ════════════ */

(() => {
  const SEL = ".rise, .reveal, [data-reveal]";

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(SEL).forEach(i => i.classList.add("in-view"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });

  // `.reveal` is observed directly so a masked headline reveals itself
  // wherever it appears, without needing a `.rise` wrapper around it.
  // The data-obs flag makes this safe to call repeatedly — which it is,
  // because the theme editor injects sections over AJAX and never fires
  // DOMContentLoaded again. Without the re-run, a section added live sits
  // at opacity 0 forever.
  const wire = (root = document) => {
    root.querySelectorAll(SEL).forEach(i => {
      if (i.dataset.obs === "1") return;
      i.dataset.obs = "1";
      io.observe(i);
    });
  };

  wire();
  document.addEventListener("shopify:section:load", (e) => wire(e.target || document));
  document.addEventListener("shopify:section:reorder", () => wire());
  window.__noirReveal = { wire };
})();

/* ════════════ 6. HERO — look stack + 3D parallax ════════════
   One rAF loop drives both axes of parallax:

     · pointer  — damped toward the cursor, driving translate AND a real
                  rotateX/rotateY against the stack's perspective, which
                  is what reads as depth rather than as a slide
     · scroll   — the plate rises slower than the page as the hero leaves

   The plate is pre-scaled 1.26 in CSS so none of this exposes an edge.
   Pointer parallax is desktop-only; scroll parallax runs everywhere. */

(() => {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  requestAnimationFrame(() => setTimeout(() => hero.dataset.in = "true", 60));

  const looks = [...hero.querySelectorAll(".hero__look")];
  const label = document.querySelector("[data-look-label]");
  const next  = document.querySelector("[data-hero-next]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- headline ----
     The lead word is fixed: "Fashion" is set upright and heavy and stays
     put across every look. Only the italic phrase after it is erased and
     retyped, so the sentence re-reads itself rather than rebuilding. */
  const LEAD = "Fashion";
  const COPY = [
    "as a language.",
    "as an exploration.",
    "as a medium."
  ];

  const type = document.querySelector("[data-type]");
  const lead = document.querySelector("[data-type-lead]");

  // Retypes only the phrase; the lead is left alone.
  const writeHeadline = (n) => {
    cancelTyping();
    return typewriter(type, COPY[n] || COPY[0], { erase: true, base: 40, jitter: 24 });
  };

  const setHeadline = (n) => {
    if (lead) { lead.textContent = LEAD; delete lead.dataset.caret; }
    if (type) { type.textContent = COPY[n] || COPY[0]; delete type.dataset.caret; }
  };

  /* ---- look stack ---- */
  let i = 0;
  const show = (n, { retype = true } = {}) => {
    i = (n + looks.length) % looks.length;
    looks.forEach((l, k) => l.dataset.active = k === i ? "true" : "false");
    if (label) label.textContent =
      `Look ${String(i + 1).padStart(2, "0")} / ${String(looks.length).padStart(2, "0")}`;
    if (!retype) return;
    if (reduced) { setHeadline(i); return; }
    writeHeadline(i);
  };

  next?.addEventListener("click", () => {
    // Reaching for the look stack is intent to move on — lift the gate,
    // then let the new headline type normally.
    if (document.body.dataset.intro === "true") release();
    show(i + 1);
  });
  show(0, { retype: false });

  /* ---- parallax ----
     Set up BEFORE the intro gate. The gate returns early in several
     ordinary cases (already seen this session, reduced motion, arriving
     mid-page), and when this block sat below that return the hero simply
     lost its parallax in all of them. */
  const DEPTH = 44;      // px of travel at the edge of the viewport
  const TILT  = 5.0;     // degrees of rotation at the edge
  const RISE  = 0.28;    // share of scroll distance the plate keeps

  let tx = 0, ty = 0;    // target, -1..1
  let cx = 0, cy = 0;    // current, damped
  let sy = 0;            // scroll offset in px
  let raf = null;

  const frame = () => {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;

    const t =
      `translate3d(${(-cx * DEPTH).toFixed(2)}px, ${(-cy * DEPTH * 0.7 + sy).toFixed(2)}px, 0)` +
      ` rotateY(${(cx * TILT).toFixed(3)}deg) rotateX(${(-cy * TILT * 0.72).toFixed(3)}deg)` +
      ` scale(1.26)`;
    looks.forEach(l => { l.firstElementChild.style.transform = t; });

    const settled = Math.abs(tx - cx) < 0.0008 && Math.abs(ty - cy) < 0.0008;
    raf = settled ? null : requestAnimationFrame(frame);
  };
  const run = () => { if (!raf) raf = requestAnimationFrame(frame); };

  if (fine) {
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      run();
    }, { passive: true });
    // Recentre when the cursor leaves the window entirely.
    document.addEventListener("pointerleave", () => { tx = 0; ty = 0; run(); });
  }

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;    // hero is off-screen; stop working
    sy = y * RISE;
    run();
  }, { passive: true });

  run();

  /* ════ Intro gate ══════════════════════════════════════════════════
     The house story is told by the loader; by the time the hero is
     visible all that is left is the headline. This holds the reader on
     the hero while the photograph bleeds into colour and the headline
     types, then releases the page. Three ways out, because a gate that
     can strand someone is a bug, not an effect:

       · the [Skip intro] control
       · any real intent to move (wheel, touch, key, look switch)
       · a hard failsafe timeout

     Skipped when it has already played this session, under reduced
     motion, and when the reader arrives part-way down the page. */

  const skipBtn = document.querySelector("[data-intro-skip]");
  let released = false;

  function onIntent() { release(); }

  const release = () => {
    if (released) return;
    released = true;
    cancelTyping();
    // The current look, not necessarily look 0 — the reader may have
    // advanced the stack while the gate was still up.
    setHeadline(i);
    document.body.dataset.intro = "false";
    markIntroSeen();
    skipBtn?.remove();
    window.removeEventListener("wheel", onIntent);
    window.removeEventListener("touchmove", onIntent);
    window.removeEventListener("keydown", onIntent);
  };

  // A hash normally means the reader is being sent to a section, so the
  // gate stands down — unless the hash IS the replay flag.
  const deepLinked = location.hash && location.hash !== "#intro";
  const canGate =
    !introSeen && !reduced && type && window.scrollY < 4 && !deepLinked;

  if (!canGate) {
    skipBtn?.remove();
    setHeadline(0);
    markIntroSeen();
    return;
  }

  document.body.dataset.intro = "true";
  window.scrollTo(0, 0);

  skipBtn?.addEventListener("click", release);
  window.addEventListener("wheel", onIntent, { passive: true });
  window.addEventListener("touchmove", onIntent, { passive: true });
  window.addEventListener("keydown", onIntent);
  // Failsafe: whatever happens above, the page is never held past this.
  const failsafe = setTimeout(release, 16000);

  // Starts only once the loader has cleared, so the two typewriters
  // never run at the same time.
  const runIntro = async () => {
    if (released) return;
    if (lead) lead.textContent = "";
    type.textContent = "";
    // Let the sheet actually dissolve before the headline starts, or the
    // two animations fight for attention.
    await wait(1250);
    if (released) return;
    await typewriter(lead, LEAD, { base: 64, jitter: 30 });
    if (released) return;
    await typewriter(type, COPY[0], { base: 40, jitter: 24 });
    clearTimeout(failsafe);
    await wait(500);
    release();
  };

  if (document.body.dataset.loaded === "true") runIntro();
  else document.addEventListener("mcm:loaded", runIntro, { once: true });
})();

/* Buttons are deliberately NOT magnetic — a control that slides away from
   the cursor was more distracting than characterful here. */

/* ════════════ 8. STICKY-PREVIEW SWAP (collections + shop) ════════════
   Rows carry data-preview="assets/x.png". On hover the matching <img>
   in the paired viewer becomes active; the rest fade out. */

const wirePreviewSwap = (root = document) => {
  root.querySelectorAll("[data-preview-scope]").forEach(scope => {
    // Re-runnable for the theme editor; must never bind a scope twice or
    // every hover would fire its handlers N times.
    if (scope.dataset.previewWired === "1") return;
    const viewer = scope.querySelector("[data-preview-viewer]");
    const rows = scope.querySelectorAll("[data-preview]");
    if (!viewer || !rows.length) return;
    scope.dataset.previewWired = "1";

    // Build unique <img> per row if not already there.
    const srcs = [...new Set([...rows].map(r => r.dataset.preview))];
    srcs.forEach((src, i) => {
      if (viewer.querySelector(`img[data-src="${src}"]`)) return;
      const img = document.createElement("img");
      img.src = src; img.alt = ""; img.dataset.src = src;
      img.loading = "lazy"; img.decoding = "async";
      if (i === 0) img.dataset.active = "true";
      viewer.appendChild(img);
      window.__noir?.observe(img);
    });

    // Meta line inside the viewer
    let meta = viewer.querySelector(".shop__viewer__meta");
    const setMeta = (label) => { if (meta) meta.textContent = label || ""; };
    setMeta(rows[0]?.dataset.label || "");

    const activate = (src, label) => {
      viewer.querySelectorAll("img").forEach(img => img.dataset.active = (img.dataset.src === src) ? "true" : "false");
      setMeta(label);
    };
    rows.forEach(row => {
      const src = row.dataset.preview;
      const label = row.dataset.label || "";
      row.addEventListener("pointerenter", () => activate(src, label));
      row.addEventListener("focusin", () => activate(src, label));
    });
  });
};

wirePreviewSwap();
document.addEventListener("shopify:section:load", (e) => wirePreviewSwap(e.target || document));
document.addEventListener("shopify:section:reorder", () => wirePreviewSwap());

/* ════════════ 9. SHOP FILTERS ════════════
   Two axes in the static build; one survives here.

   collection — WAS a client-side ?c= filter over a hardcoded map. In
                Shopify the collection IS the page (/collections/<handle>),
                so this is now server-side: Liquid renders only the
                products in `collection`, and the title, collection mark,
                sold-out state, empty message and active switcher option
                all come from the collection object and its section
                settings. Nothing to do here.
   category   — the button row. Still client-side: it filters *within*
                the collection already on the page, over at most a few
                dozen rows, and doing it in the browser keeps the instant
                feel the design was built around. Source of truth is
                Shopify's Product type, emitted by Liquid as data-cat. */

(() => {
  const scope = document.querySelector("[data-filter-scope]");
  if (!scope) return;

  const btns = [...scope.querySelectorAll(".filter")];
  if (!btns.length) return;

  // Queried per pass, not captured once: the grid and the list are two
  // views of the same set and either may be re-rendered by the theme
  // editor underneath us.
  const getRows  = () => [...scope.querySelectorAll("[data-cat]")];
  const count    = scope.querySelector("[data-shop-count]");
  const empty    = scope.querySelector("[data-shop-empty]");

  let cat = "all";

  const apply = () => {
    let shown = 0;
    getRows().forEach(r => {
      const show = cat === "all" || r.dataset.cat.split(" ").includes(cat);
      r.hidden = !show;
      if (show) shown++;
    });

    if (count) {
      count.textContent = `[ Index of pieces · ${String(shown).padStart(2, "0")} shown ]`;
    }
    if (empty) empty.hidden = shown > 0;

    // With nothing listed, the grid below is just an empty row framing
    // the message. Collapse it so a sold-out collection reads as a
    // statement, not a fault.
    scope.dataset.empty = shown === 0 ? "true" : "false";
  };

  btns.forEach(b => b.addEventListener("click", () => {
    cat = b.dataset.val;
    btns.forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    apply();
  }));

  window.__shopFilter = { apply };
  apply();
})();

/* ════════════ 11. TOAST ════════════ */

let toastTimer;
function toast(html) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<div class="toast__inner"></div>`;
    document.body.appendChild(t);
  }
  t.querySelector(".toast__inner").innerHTML = html;
  t.setAttribute("data-open", "true");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.setAttribute("data-open", "false"), 2600);
}

/* ════════════ 12. ADD-TO-BAG WIRING ════════════ */

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  e.preventDefault();
  const id = btn.dataset.add;
  const scope = btn.closest("[data-product-scope]") || document;
  // Prefer an explicitly-marked size group; fall back to the first
  // swatch group so product.html's single, unmarked .sizes still works.
  const size = scope.querySelector('[data-size-group] .swatch[aria-pressed="true"]')?.dataset.size
            || scope.querySelector('.swatch[aria-pressed="true"]')?.dataset.size
            || "OS";
  // Jeans carry a second axis. Only read it when the group is actually
  // showing, so a hidden leftover selection can't attach an inseam to a
  // jacket.
  const inseamGroup = scope.querySelector('[data-inseam-group]');
  const inseamVisible = inseamGroup && !inseamGroup.closest("[hidden]");
  const inseam = inseamVisible
    ? inseamGroup.querySelector('.swatch[aria-pressed="true"]')?.dataset.size
    : null;

  cartAdd(id, inseam ? `${size}/${inseam}` : size);
});

/* Size swatch selection */
document.addEventListener("click", (e) => {
  const s = e.target.closest(".swatch");
  if (!s) return;
  const scope = s.closest(".sizes");
  scope?.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", x === s ? "true" : "false"));
});

/* ════════════ 13. MARQUEE — auto-duplicate for seamless loop ════════════ */

(() => {
  document.querySelectorAll(".marquee__track").forEach(track => {
    // Ensure track content width > container: duplicate until it does.
    const originalHTML = track.innerHTML;
    track.innerHTML = originalHTML + originalHTML;
  });
})();

/* ════════════ 14. DAMPED SMOOTH SCROLL (site-wide) ════════════
   Simple Lenis-style lerp. Fully skipped on:
     · touch (native inertia is better)
     · reduced-motion
     · pages that opt out with body.no-smooth
   Bypasses transformed <body> to keep position:fixed/sticky sane by
   using transform on a proxy wrapper only when helpful. Since our
   layout uses position:fixed heavily, we opt for the simpler approach:
   listen for wheel, prevent default, lerp window.scrollY via scrollTo.
*/

(() => {
  if (document.body.classList.contains("no-smooth")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let target = window.scrollY;
  let current = window.scrollY;
  const ease = 0.10;
  let running = false;

  const onWheel = (e) => {
    // Don't hijack scroll inside overflowing panels (cart items).
    if (e.target.closest(".cart__items, .mobile-nav")) return;
    // Behind the intro gate, banking deltas would lurch the page the
    // moment the gate lifts.
    if (document.body.dataset.intro === "true") { target = 0; current = 0; return; }
    e.preventDefault();
    target = Math.max(0, Math.min(target + e.deltaY, document.documentElement.scrollHeight - window.innerHeight));
    if (!running) { running = true; requestAnimationFrame(tick); }
  };
  const tick = () => {
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.4) { current = target; running = false; }
    window.scrollTo(0, current);
    if (running) requestAnimationFrame(tick);
  };

  const onScroll = () => { if (!running) { current = window.scrollY; target = window.scrollY; } };
  const onResize = () => { target = window.scrollY; current = window.scrollY; };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  // Anchor clicks smoothly retarget.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    target = el.getBoundingClientRect().top + window.scrollY - 60;
    if (!running) { running = true; requestAnimationFrame(tick); }
  });
})();

/* ════════════ 15. THE CASCADE — interactive plate gallery ════════════
   A diagonal fan of translucent plates travelled by wheel, drag, arrow
   keys or the HUD. `--t` is the travel head; CSS derives every plate's
   position from (its index − t), so this only ever writes ONE variable.

   Images live in the DOM as real <img>, so the gallery still works with
   JS off: without this module the plates simply stack at t=0 and the
   arrows/rail never appear. */

function buildCascade(root, images, opts = {}) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.innerHTML = "";
  root.classList.add("cascade");

  const stage = document.createElement("div");
  stage.className = "cascade__stage";

  images.forEach((im, i) => {
    const plate = document.createElement("figure");
    plate.className = "cascade__plate";
    plate.dataset.idx = i;
    plate.innerHTML =
      `<img src="${im.src}" alt="${im.alt || ""}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async">
       <figcaption class="cascade__cap">${im.cap || ""}</figcaption>`;
    // The plate at the head is already the one you're looking at, so
    // clicking it opens the photo fullscreen instead of re-travelling to
    // itself. Any other plate still just brings itself to the head.
    plate.addEventListener("click", () => {
      if (Math.round(target) === i) openLightbox(images, i, opts.label);
      else go(i);
    });
    stage.appendChild(plate);
  });
  root.appendChild(stage);
  window.__noir?.observeAll(stage);

  const n = images.length;
  const plates = [...stage.querySelectorAll(".cascade__plate")];

  // HUD
  const hud = document.createElement("div");
  hud.className = "cascade__hud";
  hud.innerHTML =
    `<button type="button" data-prev aria-label="Previous image">←</button>
     <span class="cascade__count"><span data-cur>1</span>/${String(n).padStart(2, "0")}</span>
     <button type="button" data-next aria-label="Next image">→</button>`;
  const rail = document.createElement("div");
  rail.className = "cascade__rail";
  rail.innerHTML = "<span></span>";
  const hint = document.createElement("div");
  hint.className = "cascade__hint";
  hint.textContent = opts.hint || "Scroll or drag to travel";
  root.append(hud, rail, hint);

  const bar = rail.firstElementChild;
  const cur = hud.querySelector("[data-cur]");
  const prevBtn = hud.querySelector("[data-prev]");
  const nextBtn = hud.querySelector("[data-next]");

  let t = 0, target = 0, raf = null;

  // Plate size, measured. The diagonal step is expressed as a fraction of
  // the plate box and resolved to px in JS, so the travel distance stays
  // tied to the plate rather than to whatever the transform percentage
  // would resolve against.
  let pw = 0, ph = 0;
  const measure = () => {
    const r = plates[0].getBoundingClientRect();
    // Undo the current scale so the base box is measured, not the drawn one.
    const s = parseFloat(plates[0].dataset.scale || "1") || 1;
    pw = r.width / s; ph = r.height / s;
  };

  const paint = () => {
    if (!pw || !ph) measure();
    const head = Math.round(t);
    plates.forEach((p, i) => {
      const off = i - t;
      // Plates further back shrink; plates that have passed the head grow
      // slightly as they sweep out of frame. Clamped so far plates stay legible.
      const scale = off >= 0
        ? Math.max(0.62, 1 - off * 0.085)
        : Math.min(1.18, 1 - off * 0.10);
      // Diagonal travel: right-and-up as offset grows.
      const x = (off *  30 - 12) / 100 * pw;
      const y = (off * -15 +  6) / 100 * ph;
      p.dataset.scale = scale;
      p.style.transform =
        `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
      p.style.opacity = (off < -1.15 ? 0 : Math.max(0, 1 - Math.max(0, off) * 0.12)).toFixed(3);
      p.dataset.head   = (i === head) ? "true" : "false";
      p.dataset.behind = (off > 0.5)  ? "true" : "false";
      p.dataset.past   = (off < -1.15) ? "true" : "false";
      p.style.zIndex = String(100 - Math.round(Math.abs(off) * 10));
    });
    cur.textContent = String(head + 1).padStart(2, "0");
    bar.style.width = (n < 2 ? 100 : (head / (n - 1)) * 100) + "%";
    prevBtn.disabled = head <= 0;
    nextBtn.disabled = head >= n - 1;
  };

  const tick = () => {
    t += (target - t) * 0.14;
    if (Math.abs(target - t) < 0.002) {
      t = target; raf = null; paint();
      root.dataset.moving = "false";     // drop layer promotion when settled
      return;
    }
    paint();
    raf = requestAnimationFrame(tick);
  };
  const run = () => {
    root.dataset.moving = "true";
    if (!raf) raf = requestAnimationFrame(tick);
  };

  function go(i) {
    target = Math.max(0, Math.min(n - 1, i));
    root.dataset.touched = "true";
    if (reduced) { t = target; paint(); return; }
    run();
  }
  const step = d => go(Math.round(target) + d);

  prevBtn.addEventListener("click", e => { e.stopPropagation(); step(-1); });
  nextBtn.addEventListener("click", e => { e.stopPropagation(); step(+1); });

  if (!reduced) {
    // Wheel travels the cascade, and only swallows the page scroll while
    // there is somewhere left to travel — at either end the page scrolls
    // on normally, so the gallery never traps the visitor.
    root.addEventListener("wheel", (e) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const atStart = target <= 0 && d < 0;
      const atEnd   = target >= n - 1 && d > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      root.dataset.touched = "true";
      target = Math.max(0, Math.min(n - 1, target + d * 0.0022));
      run();
    }, { passive: false });

    // Pointer drag along the diagonal.
    let down = false, sx = 0, sy = 0, base = 0;
    root.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".cascade__hud")) return;
      down = true; sx = e.clientX; sy = e.clientY; base = target;
      root.setPointerCapture(e.pointerId);
    });
    root.addEventListener("pointermove", (e) => {
      if (!down) return;
      // Project the drag onto the cascade's travel axis (right-and-up).
      const proj = (e.clientX - sx) - (e.clientY - sy);
      target = Math.max(0, Math.min(n - 1, base - proj / 190));
      root.dataset.touched = "true";
      run();
    });
    const up = (e) => {
      if (!down) return;
      down = false;
      try { root.releasePointerCapture(e.pointerId); } catch {}
      go(Math.round(target));           // settle onto a plate
    };
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
  }

  root.tabIndex = 0;
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", opts.label || "Product gallery");
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(+1); }
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   { e.preventDefault(); step(-1); }
    if (e.key === "Home") { e.preventDefault(); go(0); }
    if (e.key === "End")  { e.preventDefault(); go(n - 1); }
  });

  paint();

  // Re-measure when the plate box changes (viewport resize, font swap).
  if ("ResizeObserver" in window) {
    let first = true;
    new ResizeObserver(() => {
      if (first) { first = false; return; }   // skip the initial observation
      measure(); paint();
    }).observe(root);
  } else {
    window.addEventListener("resize", () => { measure(); paint(); });
  }

  // Re-measure once the images have decoded: the plate box is driven by
  // aspect-ratio, so its height is only final after layout settles.
  let pending = plates.length;
  const settle = () => { if (--pending <= 0) { measure(); paint(); } };
  stage.querySelectorAll("img").forEach(img => {
    if (img.complete && img.naturalWidth) {
      (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(settle);
    } else {
      img.addEventListener("load", settle, { once: true });
      img.addEventListener("error", settle, { once: true });
    }
  });

  return { go, step, get index() { return Math.round(target); } };
}
window.buildCascade = buildCascade;

/* Auto-mount any [data-mcm-gallery] whose images are declared in the markup.
   Guarded and re-run on the theme-editor events: the customizer injects
   sections over AJAX without a page load, so a gallery added live would
   never mount — and mounting one twice would stack two canvases.

   The attribute is namespaced, and must stay that way. It was originally
   [data-cascade], which collided head-on with STOCK DAWN: Dawn puts
   data-cascade on elements it wants to stagger-reveal on scroll, across
   twelve of its own sections (search results, collection grids, collage,
   multicolumn, rich-text, footer, newsletter…). This mounter then turned
   every one of those that happened to contain an <img> into a draggable
   plate-stack gallery — which is exactly what destroyed the search
   results page: each result became a full-bleed gallery captioned
   "Scroll or drag to travel". Renaming ours (rather than stripping the
   attribute out of twelve Dawn files) leaves Dawn's animations intact
   and survives a Dawn upgrade. */
const wireCascades = (root = document) => {
  root.querySelectorAll("[data-mcm-gallery]").forEach(el => {
    if (el.dataset.mcmGalleryMounted === "1") return;
    const imgs = [...el.querySelectorAll("img")].map(i => ({
      src: i.getAttribute("src"), alt: i.getAttribute("alt"), cap: i.dataset.cap || ""
    }));
    if (!imgs.length) return;
    el.dataset.mcmGalleryMounted = "1";
    buildCascade(el, imgs, { label: el.dataset.label });
  });
};

wireCascades();
document.addEventListener("shopify:section:load", (e) => wireCascades(e.target || document));

/* ════════════ 15b. LIGHTBOX — fullscreen photo viewer ════════════
   One shared overlay for every cascade on the page (the shop's per-piece
   cascade, the collection card's own gallery if it grows one, etc.).
   Built lazily on first open rather than per-cascade, so a page with no
   gallery never pays for it. Opened from buildCascade's own plate click
   handler above — clicking the plate already at the head. */

let __lightbox = null;

function openLightbox(images, index, label) {
  if (!__lightbox) {
    const el = document.createElement("div");
    el.className = "lightbox";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.innerHTML = `
      <button class="lightbox__close" type="button" aria-label="Close"></button>
      <button class="lightbox__nav lightbox__nav--prev" type="button" data-prev aria-label="Previous image">←</button>
      <img class="lightbox__img" alt="">
      <button class="lightbox__nav lightbox__nav--next" type="button" data-next aria-label="Next image">→</button>
      <div class="lightbox__cap"></div>`;
    document.body.appendChild(el);

    const img = el.querySelector(".lightbox__img");
    const cap = el.querySelector(".lightbox__cap");
    const prevBtn = el.querySelector("[data-prev]");
    const nextBtn = el.querySelector("[data-next]");
    let opener = null;

    const show = () => {
      const im = __lightbox.images[__lightbox.index];
      img.src = im.src;
      img.alt = im.alt || "";
      cap.textContent = im.cap || "";
    };
    const close = () => {
      el.dataset.open = "false";
      document.body.style.overflow = "";
      opener?.focus({ preventScroll: true });
    };
    const step = (d) => {
      const n = __lightbox.images.length;
      __lightbox.index = (__lightbox.index + d + n) % n;
      show();
    };

    el.querySelector(".lightbox__close").addEventListener("click", close);
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(+1));
    // The scrim is the element itself; the image and controls sit above
    // it, so a click that reaches `el` directly is a click on empty space.
    el.addEventListener("click", (e) => { if (e.target === el) close(); });
    document.addEventListener("keydown", (e) => {
      if (el.dataset.open !== "true") return;
      if (e.key === "Escape")     close();
      if (e.key === "ArrowRight") step(+1);
      if (e.key === "ArrowLeft")  step(-1);
    });

    __lightbox = { el, show, close, setOpener: (n) => { opener = n; }, images: [], index: 0 };
  }

  __lightbox.images = images;
  __lightbox.index = index;
  __lightbox.el.setAttribute("aria-label", label || "Photo");
  __lightbox.setOpener(document.activeElement);
  __lightbox.show();
  __lightbox.el.dataset.open = "true";
  document.body.style.overflow = "hidden";
  __lightbox.el.querySelector(".lightbox__close").focus({ preventScroll: true });
}

/* ════════════ 16a2. PRODUCT GRID — wiring only ════════════
   The grid itself is rendered by Liquid (snippets/mcmarden-product-tile),
   so it exists for crawlers and with JS off — in the static build it was
   built here from a PRODUCTS array and did neither. Every tile is now a
   real link straight to the product page (no quick-view panel — one
   buying path, on the product page, rather than two that could disagree
   about stock), so nothing here needs to intercept clicks; what is left
   is the behaviour markup cannot express: the noir colour reveal on each
   tile's photo, and telling the filter that a new set of filterable
   nodes exists.

   Idempotent and re-run on shopify:section:load, because the theme editor
   injects sections over AJAX and never fires DOMContentLoaded again — a
   grid added live would otherwise never get either. */

(() => {
  const wire = () => {
    document.querySelectorAll("[data-pgrid]").forEach((grid) => {
      if (grid.dataset.wired === "true") return;
      grid.dataset.wired = "true";
      grid.querySelectorAll("img").forEach((img) => window.__noir?.observe(img));
    });

    // A category may already be chosen when a grid arrives.
    window.__shopFilter?.apply();
  };

  wire();
  document.addEventListener("shopify:section:load", wire);
  document.addEventListener("shopify:section:reorder", wire);
})();

/* ════════════ 16b2. RETROSPECTIVE INDEX — expandable rows ════════════
   Each row is a real <button> (see .index__row in styles.css — reset
   with display: contents so it stays a plain grid row visually). The
   CSS reveal (max-height + opacity) is driven by an .is-open class
   this handler toggles directly on the panel — not by a selector
   chained off the row, which looked equivalent but wasn't: a
   `:has(.index__row[aria-expanded]) + .index__panel` rule matched
   correctly under `.matches()` yet never actually repainted in
   testing, a real invalidation gap when the :has() effect lands on a
   sibling of the subject rather than the subject itself. A class set
   on the exact element being styled has no such dependency chain to
   miss. This handler's other job is the `hidden` choreography around
   the transition:

     open:  un-hide, THEN flip aria-expanded, so the browser has a box
            to animate into rather than starting from display: none.
     close: flip aria-expanded, THEN hide once the collapse transition
            has actually finished.

   Without this a panel that's visually collapsed (max-height: 0) would
   still sit in the accessibility tree — a screen reader in browse mode
   could land on its images even though nothing is on screen. */

(() => {
  const rows = document.querySelectorAll(".index__row");
  if (!rows.length) return;

  rows.forEach((row) => {
    // The button's own next sibling is nothing — .index__row-grid holds
    // only the button. The panel sits after the row-grid itself, one
    // level up, deliberately outside any grid (see styles.css).
    const rowGrid = row.closest(".index__row-grid");
    const panel = rowGrid?.nextElementSibling;
    if (!panel || !panel.classList.contains("index__panel")) return;
    let joined = false;

    row.addEventListener("click", () => {
      const open = row.getAttribute("aria-expanded") === "true";

      if (open) {
        row.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        panel.addEventListener("transitionend", function onEnd(e) {
          if (e.target !== panel || e.propertyName !== "max-height") return;
          panel.removeEventListener("transitionend", onEnd);
          if (row.getAttribute("aria-expanded") !== "true") panel.hidden = true;
        });
        return;
      }

      panel.hidden = false;
      // The un-hide and the class that triggers the transition can't
      // land in the same paint, or there is no "before" frame for the
      // browser to animate away from and it just snaps straight to
      // open. A synchronous forced reflow (void panel.offsetHeight)
      // reads as though it should split them the same way, but in
      // testing it left max-height stuck at 0 permanently — a real
      // engine quirk, not just a missed frame. A deferred task does
      // split them correctly.
      setTimeout(() => {
        row.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
      }, 0);
      if (!joined) {
        joined = true;
        panel.querySelectorAll("img").forEach(img => window.__noir?.observe(img));
      }
    });
  });
})();

/* ════════════ 16b3. PLAYLIST PLAYER — expandable rows + in-page audio ═══
   Same expand/collapse choreography as the retrospective index above —
   hidden removed before aria-expanded flips open, aria-expanded flips
   false before hidden is restored on close, both split across a frame
   so the browser has a "before" state to transition from/to. See
   §16b2's comment for why: a real engine quirk, not a style preference.

   The audio layer on top is new: one <audio> per panel, lazy — src is
   only ever set to the track about to play, so opening a panel loads
   nothing. Only one track plays across the whole page — starting any
   track pauses whatever else was playing, in any other playlist too.
   A track's duration fills in from real <audio> metadata the first
   time it's actually played, for any track whose block left the
   Duration field blank; a merchant-typed duration is never overwritten.

   sections/mcmarden-playlists.liquid emits the markup this expects:
   .playlist__toggle[aria-controls] → .playlist__panel[hidden], holding
   .playlist-track[data-src] rows each with a .playlist-track__play
   button and a [data-duration] span. */

(() => {
  const toggles = document.querySelectorAll(".playlist__toggle");
  if (!toggles.length) return;

  let activeAudio = null;
  let activeRow = null;

  const formatTime = (s) => {
    if (!isFinite(s)) return "--:--";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const setPlayingState = (row, playing) => {
    row.classList.toggle("is-playing", playing);
    const title = row.querySelector(".playlist-track__title")?.textContent || "";
    row.querySelector(".playlist-track__play")
      ?.setAttribute("aria-label", (playing ? "Pause " : "Play ") + title);
  };

  const stopActive = () => {
    activeAudio?.pause();
    if (activeRow) setPlayingState(activeRow, false);
    activeAudio = null;
    activeRow = null;
  };

  const wirePanel = (panel) => {
    if (panel.dataset.wired === "true") return;
    panel.dataset.wired = "true";

    const audio = panel.querySelector("[data-playlist-audio]");
    const rows = panel.querySelectorAll("[data-track]");
    if (!audio || !rows.length) return;

    audio.addEventListener("loadedmetadata", () => {
      if (!activeRow || !panel.contains(activeRow)) return;
      const el = activeRow.querySelector("[data-duration]");
      if (el && el.textContent === "--:--") el.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("ended", () => {
      const finished = activeRow;
      if (finished) setPlayingState(finished, false);
      const next = finished?.nextElementSibling;
      if (next?.matches("[data-track]")) {
        activeRow = next;
        audio.src = next.dataset.src;
        audio.play();
        setPlayingState(next, true);
      } else {
        activeAudio = null;
        activeRow = null;
      }
    });

    rows.forEach((row) => {
      row.querySelector(".playlist-track__play")?.addEventListener("click", () => {
        if (activeRow === row) {
          if (audio.paused) {
            activeAudio = audio;
            audio.play();
            setPlayingState(row, true);
          } else {
            audio.pause();
            setPlayingState(row, false);
          }
          return;
        }

        stopActive();
        audio.src = row.dataset.src;
        activeAudio = audio;
        activeRow = row;
        audio.play();
        setPlayingState(row, true);
      });
    });
  };

  toggles.forEach((toggle) => {
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!panel) return;

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";

      if (open) {
        toggle.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        panel.addEventListener("transitionend", function onEnd(e) {
          if (e.target !== panel || e.propertyName !== "max-height") return;
          panel.removeEventListener("transitionend", onEnd);
          if (toggle.getAttribute("aria-expanded") !== "true") panel.hidden = true;
        });
        return;
      }

      panel.hidden = false;
      wirePanel(panel);
      setTimeout(() => {
        toggle.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
      }, 0);
    });
  });
})();

/* ════════════ 16c. POLICY DIALOG ════════════
   Shared modal for reading long-form policy text without leaving the
   page. The markup is injected once, on demand, rather than duplicated
   into every HTML file — one content source instead of eight copies
   that drift the moment someone edits only one.

   Registry keyed by the dialog name a trigger asks for
   (data-dialog-open="shipping"), so a second policy (returns, sizing…)
   is just another entry rather than another chunk of wiring. */

const DIALOGS = {
  shipping: {
    title: "Shipping + Returns",
    // TODO(client): "info@mcmarden.com" is the address given for return
    // authorizations specifically — confirm that's intentionally
    // separate from studio@mcmarden.com, used everywhere else on this
    // site, rather than a typo.
    html: `
      <h3>Domestic Shipping</h3>
      <p>Orders are processed and shipped within three business days. Packages ship via UPS Ground, 2nd Day and Overnight or USPS Priority Mail with rates calculated at checkout. If you need your order sooner, email us, and we'll do our best to help.</p>
      <p>You will receive a confirmation email with a tracking number once your package is on its way.</p>

      <h3>International Shipping</h3>
      <p>Orders shipped outside of the U.S. are shipped via DHL and UPS Worldwide, who provide customs clearance and door-to-door delivery service, with rates calculated at checkout.</p>
      <p>You may also select USPS International. Should you select this option, McMarden is not responsible if the package is lost or stolen.</p>
      <p>Duties and taxes are not included in the order total at checkout. These fees are determined by the customs agency within the destination country. You, the buyer, are responsible for the payment of any duties and import taxes associated with your order. The fees are collected at the time of delivery.</p>
      <p>All orders shipped internationally are final sale. We do not accept returns on international orders at this time.</p>

      <h3>Return Policy</h3>
      <p>We want you to be happy with your order — we want you to love it and buy more. That said, for any number of reasons it may not work out. We understand. In return we ask you to make that decision quickly, so here are the rules:</p>
      <p>Returns of unworn, unwashed and undamaged pieces are accepted within 10 days of the delivery date, with a return authorization number, which you can request at <a href="mailto:info@mcmarden.com">info@mcmarden.com</a>. You are responsible for shipping pieces back to us. Shipping costs are non-refundable and return shipping fees are the responsibility of the customer. Refunds will be issued back to the original form of payment.</p>
      <p class="dialog__note">Thank you for your support!</p>
    `
  }
};

(() => {
  if (!document.querySelector("[data-dialog-open]")) return;

  let scrim, dialog, panel, body, title, lastFocus;

  const build = () => {
    scrim = document.createElement("div");
    scrim.className = "dialog__scrim";
    scrim.dataset.dialogScrim = "";

    dialog = document.createElement("div");
    dialog.className = "dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "dialog-title");

    panel = document.createElement("div");
    panel.className = "dialog__panel";

    const bar = document.createElement("div");
    bar.className = "dialog__bar";
    title = document.createElement("span");
    title.className = "dialog__title";
    title.id = "dialog-title";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "dialog__close";
    close.setAttribute("aria-label", "Close");
    bar.append(title, close);

    body = document.createElement("div");
    body.className = "dialog__body";

    panel.append(bar, body);
    dialog.appendChild(panel);
    document.body.append(scrim, dialog);

    scrim.addEventListener("click", closeDialog);
    close.addEventListener("click", closeDialog);
    dialog.addEventListener("click", (e) => { if (e.target === dialog) closeDialog(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dialog.dataset.open === "true") closeDialog();
    });
  };

  const openDialog = (name) => {
    const spec = DIALOGS[name];
    if (!spec) return;
    if (!dialog) build();
    title.textContent = spec.title;
    body.innerHTML = spec.html;
    lastFocus = document.activeElement;
    dialog.dataset.open = "true";
    scrim.dataset.open = "true";
    document.body.style.overflow = "hidden";
    panel.setAttribute("tabindex", "-1");
    panel.focus();
    window.__noir?.observeAll(body);
  };

  function closeDialog() {
    if (!dialog) return;
    dialog.dataset.open = "false";
    scrim.dataset.open = "false";
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-dialog-open]");
    if (!trigger) return;
    e.preventDefault();
    openDialog(trigger.dataset.dialogOpen);
  });
})();

/* ════════════ 17. INIT ════════════
   Nothing to initialise here any more. This file used to end with a
   `renderCart()` call carried over from the static build, where the cart
   was rendered from localStorage by this same script. Commerce now lives
   entirely in mcmarden-commerce.js (Shopify's /cart.js + Dawn's own
   <cart-drawer>), which wires its own DOMContentLoaded handler for the
   header count — so that call had nothing left to reach and threw an
   uncaught ReferenceError on every single page load. */
