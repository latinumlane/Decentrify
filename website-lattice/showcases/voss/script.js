const qs = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
const body = document.body;
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

// Loader
const loader = qs('.loader');
const loaderCount = qs('.loader__count');
const loaderBar = qs('.loader__bar span');
let loaded = 0;
body.classList.add('is-locked');
const loadTimer = setInterval(() => {
  loaded += Math.ceil(Math.random() * 8);
  loaded = Math.min(loaded, 100);
  if (loaderCount) loaderCount.textContent = String(loaded).padStart(2, '0');
  if (loaderBar) loaderBar.style.transform = `scaleX(${loaded / 100})`;
  if (loaded >= 100) {
    clearInterval(loadTimer);
    setTimeout(() => {
      loader?.classList.add('is-gone');
      body.classList.remove('is-locked');
    }, 220);
  }
}, 45);

// Oslo clock
const timeNodes = qsa('.js-time');
function updateTime() {
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date());
  timeNodes.forEach(node => node.textContent = `OSLO ${time}`);
}
updateTime();
setInterval(updateTime, 1000);
qs('#year').textContent = new Date().getFullYear();

// Menu
const menuButton = qs('.menu-button');
const menuOverlay = qs('.menu-overlay');
function closeMenu() {
  menuOverlay?.classList.remove('is-open');
  menuOverlay?.setAttribute('aria-hidden', 'true');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (!qs('.project-modal.is-open')) body.classList.remove('is-locked');
}
menuButton?.addEventListener('click', () => {
  const open = !menuOverlay.classList.contains('is-open');
  menuOverlay.classList.toggle('is-open', open);
  menuOverlay.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  body.classList.toggle('is-locked', open);
});
qsa('.menu-overlay a').forEach(a => a.addEventListener('click', closeMenu));

// Custom cursor
const cursor = qs('.cursor');
if (cursor && matchMedia('(pointer:fine)').matches) {
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  const tickCursor = () => {
    cx += (tx - cx) * .18; cy += (ty - cy) * .18;
    cursor.style.left = `${cx}px`; cursor.style.top = `${cy}px`;
    requestAnimationFrame(tickCursor);
  };
  tickCursor();
  qsa('.project-trigger, .image-hover, .round-link, .contact__email').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  });
}

// Magnetic elements
if (matchMedia('(pointer:fine)').matches) {
  qsa('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .18;
      const y = (e.clientY - r.top - r.height / 2) * .18;
      el.style.transform = `translate(${x}px,${y}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });
}

// Hero mouse-parallax
const hero = qs('.hero');
const cards = qsa('.hero-card');
if (hero && matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('mousemove', e => {
    const nx = (e.clientX / innerWidth - .5);
    const ny = (e.clientY / innerHeight - .5);
    cards.forEach(card => {
      const d = Number(card.dataset.depth || 1);
      const baseRotate = card.classList.contains('hero-card--b') ? 4 : card.classList.contains('hero-card--a') ? -2 : 2;
      card.style.transform = `translate3d(${nx * 42 * d}px, ${ny * 34 * d}px, ${20 * d}px) rotate(${baseRotate + nx * 2}deg)`;
    });
  });
  hero.addEventListener('mouseleave', () => cards.forEach(card => card.style.transform = ''));
}

// Horizontal work section
const shell = qs('.horizontal-shell');
const track = qs('.horizontal-track');
function updateHorizontal() {
  if (!shell || !track || innerWidth <= 900 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = shell.getBoundingClientRect();
  const total = shell.offsetHeight - innerHeight;
  const progress = clamp(-r.top / total, 0, 1);
  const maxShift = Math.max(0, track.scrollWidth - innerWidth);
  track.style.transform = `translate3d(${-progress * maxShift}px,0,0)`;
}

// Scroll progress + parallax
const progressLine = qs('.scroll-line span');
const interludeImage = qs('.interlude__image img');
const interlude = qs('.interlude');
function onScroll() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - innerHeight;
  if (progressLine) progressLine.style.transform = `scaleX(${max ? scrollY / max : 0})`;
  updateHorizontal();
  if (interlude && interludeImage) {
    const r = interlude.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    interludeImage.style.transform = `scale(1.08) translateY(${(p - .5) * 8}%)`;
  }
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

// Reveal statement typography
const revealTargets = qsa('.statement-line, .studio__left h2, .studio__lead, .archive__head h2');
revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(36px)';
  el.style.transition = 'opacity .85s cubic-bezier(.16,1,.3,1), transform .85s cubic-bezier(.16,1,.3,1)';
});
const revealObs = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.style.opacity = '1';
    entry.target.style.transform = 'translateY(0)';
    revealObs.unobserve(entry.target);
  }
}), { threshold: .18 });
revealTargets.forEach(el => revealObs.observe(el));

// Archive floating preview
const archivePreview = qs('.archive-preview');
const archivePreviewImg = qs('.archive-preview img');
const archivePreviewLabel = qs('.archive-preview span');
if (archivePreview && archivePreviewImg && matchMedia('(pointer:fine)').matches) {
  qsa('.archive-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      archivePreviewImg.src = row.dataset.image;
      archivePreviewLabel.textContent = `${row.dataset.title} / ${row.dataset.year}`;
      archivePreview.classList.add('is-visible');
    });
    row.addEventListener('mouseleave', () => archivePreview.classList.remove('is-visible'));
    row.addEventListener('mousemove', e => {
      archivePreview.style.left = `${clamp(e.clientX + 180, 230, innerWidth - 230)}px`;
      archivePreview.style.top = `${clamp(e.clientY, 280, innerHeight - 280)}px`;
    });
  });
}

// Project modal
const modal = qs('.project-modal');
const modalScroll = qs('.project-modal__scroll');
const modalHero = qs('.project-modal__hero img');
const modalTitle = qs('.project-modal__title');
const modalType = qs('.project-modal__type');
const modalYear = qs('.project-modal__year');
const modalCopy = qs('.project-modal__copy');
const modalStills = qsa('.project-modal__stills img');

function openProject(el) {
  if (!modal) return;
  const image = el.dataset.image;
  modalHero.src = image;
  modalHero.alt = `${el.dataset.title} project image`;
  modalTitle.textContent = el.dataset.title;
  modalType.textContent = el.dataset.type;
  modalYear.textContent = el.dataset.year;
  modalCopy.textContent = el.dataset.copy;
  modalStills.forEach(img => { img.src = image; img.alt = ''; });
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  body.classList.add('is-locked');
  modalScroll.scrollTop = 0;
}
function closeProject() {
  modal?.classList.remove('is-open');
  modal?.setAttribute('aria-hidden', 'true');
  if (!menuOverlay?.classList.contains('is-open')) body.classList.remove('is-locked');
}
qsa('.project-trigger').forEach(el => {
  el.addEventListener('click', () => openProject(el));
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(el); }
  });
});
qs('.project-modal__close')?.addEventListener('click', closeProject);
qs('.project-modal__next')?.addEventListener('click', closeProject);
addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modal?.classList.contains('is-open')) closeProject();
    else if (menuOverlay?.classList.contains('is-open')) closeMenu();
  }
});

// Image tilt
if (matchMedia('(pointer:fine)').matches) {
  qsa('.work-card__image').forEach(frame => {
    frame.addEventListener('mousemove', e => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      const img = qs('img', frame);
      img.style.transform = `scale(1.055) translate(${x * -1.8}%, ${y * -1.8}%)`;
    });
    frame.addEventListener('mouseleave', () => { qs('img', frame).style.transform = ''; });
  });
}
