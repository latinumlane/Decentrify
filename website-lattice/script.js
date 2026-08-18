(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => { const open = menu.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));
  }
  const scrambleTargets = document.querySelectorAll('[data-scramble]');
  if (scrambleTargets.length) {
    const calm = reduce;
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    class ScrambleText {
      constructor(element) { this.element = element; this.current = ''; this.frame = 0; this.raf = null; }
      to(text) {
        this.element.setAttribute('aria-label', text);
        this.element.setAttribute('aria-live', 'off');
        if (calm) { this.element.textContent = text; this.current = text; return Promise.resolve(); }
        const from = this.current;
        this.queue = Array.from({ length: Math.max(from.length, text.length) }, (_, index) => ({ from: from[index] || '', to: text[index] || '', start: Math.floor(Math.random() * 40), end: 0, char: '' })).map(item => ({ ...item, end: item.start + Math.floor(Math.random() * 40) }));
        cancelAnimationFrame(this.raf); this.frame = 0; this.current = text;
        return new Promise(resolve => { this.done = resolve; this.tick(); });
      }
      tick() {
        let output = ''; let complete = 0;
        this.queue.forEach(item => { if (this.frame >= item.end) { complete++; output += item.to; } else if (this.frame >= item.start) { if (!item.char || Math.random() < .28) item.char = chars[Math.floor(Math.random() * chars.length)]; output += `<span class="scramble__noise">${item.char}</span>`; } else output += item.from; });
        this.element.innerHTML = output;
        if (complete === this.queue.length) { this.element.textContent = this.current; this.done(); return; }
        this.frame++; this.raf = requestAnimationFrame(() => this.tick());
      }
    }
    scrambleTargets.forEach(element => {
      const phrases = element.dataset.scramble.split('|').map(phrase => phrase.trim()).filter(Boolean);
      if (!phrases.length) return;
      element.style.minWidth = `${phrases.reduce((longest, phrase) => Math.max(longest, phrase.length), 0)}ch`;
      const scramble = new ScrambleText(element); let index = 0; let timer;
      const next = () => { scramble.to(phrases[index = (index + 1) % phrases.length]); timer = setTimeout(next, 2600); };
      scramble.to(phrases[0]).then(() => { timer = setTimeout(next, 2600); });
      document.addEventListener('visibilitychange', () => { clearTimeout(timer); if (!document.hidden) timer = setTimeout(next, 2600); });
    });
  }
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-ready');
    document.querySelectorAll('[data-reveal-group]').forEach(group => group.querySelectorAll(':scope > [data-reveal]').forEach((el, i) => el.style.setProperty('--delay', `${i * 90}ms`)));
    const observer = new IntersectionObserver((entries, io) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); } }), { threshold: .08, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left - r.width / 2) * .12, y = (e.clientY - r.top - r.height / 2) * .18; el.style.transform = `translate(${x}px,${y}px)`; });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
  const serviceCards = document.querySelectorAll('.service-card');
  const toggleService = card => {
    const shouldOpen = !card.classList.contains('active');
    serviceCards.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-expanded', 'false'); });
    if (shouldOpen) { card.classList.add('active'); card.setAttribute('aria-expanded', 'true'); }
  };
  serviceCards.forEach(card => {
    card.addEventListener('click', event => { if (!event.target.closest('a')) toggleService(card); });
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleService(card); } });
  });
  const serviceGrid = document.querySelector('.service-grid');
  if (serviceGrid && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const measureSpotlight = () => {
      const gridBounds = serviceGrid.getBoundingClientRect();
      serviceCards.forEach(card => { const bounds = card.getBoundingClientRect(); card.style.setProperty('--spot-ox', `${bounds.left - gridBounds.left}px`); card.style.setProperty('--spot-oy', `${bounds.top - gridBounds.top}px`); });
    };
    serviceGrid.addEventListener('pointerenter', () => { measureSpotlight(); serviceGrid.classList.add('spotlight-active'); });
    serviceGrid.addEventListener('pointermove', event => { const bounds = serviceGrid.getBoundingClientRect(); serviceGrid.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`); serviceGrid.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`); });
    serviceGrid.addEventListener('pointerleave', () => serviceGrid.classList.remove('spotlight-active'));
    new ResizeObserver(measureSpotlight).observe(serviceGrid);
  }
  const workTiles = document.querySelectorAll('.work-tile');
  const workDetail = document.querySelector('.work-detail');
  if (workTiles.length && workDetail) {
    const projects = {
      '01': { category: '01 / Hospitality', name: 'Marrow', url: 'marrow.studio', title: 'Make<br>room for<br>ritual.', caption: 'A neighbourhood kitchen<br>worth returning to.', summary: 'An editorial, appetite-forward concept for a restaurant that wants its site to feel like an invitation—not a reservation utility.', tags: ['Brand story', 'Art direction', 'Reservations'], colors: ['#e8b869', '#314936', '#2a3320'] },
      '02': { category: '02 / Culture', name: 'Signal House', url: 'signalhouse.co', title: 'Culture<br>in full<br>colour.', caption: 'Ideas with a little more volume.', summary: 'A deliberately energetic home for a creative collective, built to turn a rolling program into something people want to explore.', tags: ['Editorial CMS', 'Event discovery', 'Motion'], colors: ['#eb5f3b', '#341442', '#fff0dc'] },
      '03': { category: '03 / Wellness', name: 'Common Ground', url: 'commonground.care', title: 'A softer<br>way to<br>arrive.', caption: 'Care that begins before the visit.', summary: 'A calm, confidence-building experience that gives a modern wellness practice the presence and clarity its clients need.', tags: ['Service design', 'Booking flow', 'Content'], colors: ['#bbd9c5', '#164540', '#12332f'] },
      '04': { category: '04 / Technology', name: 'Orbit Systems', url: 'orbitsystems.io', title: 'Tools for<br>a faster<br>orbit.', caption: 'Operations, without the drag.', summary: 'A technical product story made more human: clear structure, elegant interactions, and enough edge to be remembered.', tags: ['Product marketing', 'Interactive demo', 'Launch'], colors: ['#91a9ff', '#151f51', '#e4eaff'] }
    };
    const updateWork = tile => {
      const project = projects[tile.dataset.work];
      if (!project || tile.classList.contains('active')) return;
      workDetail.classList.add('switching');
      workTiles.forEach(item => { item.classList.toggle('active', item === tile); item.setAttribute('aria-selected', item === tile); });
      setTimeout(() => {
        workDetail.querySelector('.browser-bar b').textContent = project.url;
        workDetail.querySelector('.browser-page').style.background = project.colors[0];
        workDetail.querySelector('.browser-page').style.color = project.colors[2];
        workDetail.querySelector('.browser-title').innerHTML = project.title;
        workDetail.querySelector('.browser-caption').innerHTML = project.caption;
        workDetail.querySelector('.browser-orb').style.background = project.colors[1];
        workDetail.querySelector('.work-copy .eyebrow').textContent = project.category;
        workDetail.querySelector('.work-copy h3').textContent = project.name;
        workDetail.querySelector('.work-summary').textContent = project.summary;
        workDetail.querySelector('.work-tags').innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
        workDetail.classList.remove('switching');
      }, reduce ? 0 : 170);
    };
    workTiles.forEach(tile => { tile.addEventListener('click', () => updateWork(tile)); tile.addEventListener('keydown', event => { const index = [...workTiles].indexOf(tile); if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); const next = workTiles[index + 1] || workTiles[0]; next.focus(); updateWork(next); } if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); const previous = workTiles[index - 1] || workTiles[workTiles.length - 1]; previous.focus(); updateWork(previous); } }); });
  }
})();
