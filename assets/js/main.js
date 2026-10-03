const RF = {
  els: {
    works: [],
    team: []
  },

  settings() {
    return Store.all();
  },

  esc(str) {
    return Store.escapeHtml(str);
  },

  iconBox(item) {
    if (item.icon) return '<div class="work-icon"><img src="' + this.esc(item.icon) + '" alt=""></div>';
    return '<div class="work-icon">' + this.esc(item.letter || 'R') + '</div>';
  },

  workCard(item) {
    const href = Store.safeLink(item.link);
    const inner =
      this.iconBox(item) +
      '<h3>' + this.esc(item.title) + '</h3>' +
      '<p>' + this.esc(item.desc) + '</p>' +
      '<span class="work-go">进入作品' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      '</span>';
    return href
      ? '<a class="work reveal" href="' + this.esc(href) + '" target="_blank" rel="noopener">' + inner + '</a>'
      : '<div class="work reveal">' + inner + '</div>';
  },

  memberCard(item) {
    const avatar = item.avatar
      ? '<div class="avatar"><img src="' + this.esc(item.avatar) + '" alt=""></div>'
      : '<div class="avatar">' + this.esc(item.letter || 'R') + '</div>';
    const contact = item.contact
      ? '<div class="member-contact">' + this.esc(item.contact) + '</div>'
      : '';
    return (
      '<div class="member reveal" data-heart>' + avatar +
      '<h3>' + this.esc(item.name) + '</h3>' +
      (item.role ? '<em class="role">' + this.esc(item.role) + '</em>' : '') +
      '<p>' + this.esc(item.desc) + '</p>' + contact +
      '</div>'
    );
  },

  renderWorks(target, list, limit) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    const items = (limit ? list.slice(0, limit) : list).map(Store.shapeWork);
    el.innerHTML = items.length
      ? items.map(this.workCard).join('')
      : '<div class="empty-tip" style="grid-column:1/-1">作品正在准备中</div>';
    this.fadeImgs(el);
    this.reveal();
  },

  renderTeam(target, limit) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    const items = Store.team().map(Store.shapeMember);
    const list = limit ? items.slice(0, limit) : items;
    el.innerHTML = list.length
      ? list.map(this.memberCard).join('')
      : '<div class="empty-tip" style="grid-column:1/-1">团队成员即将公布</div>';
    el.querySelectorAll('[data-heart]').forEach(n => n.addEventListener('click', () => RF.hearts(n)));
    this.fadeImgs(el);
    this.reveal();
  },

  hearts(el) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const glyphs = ['♥', '❤'];
    for (let i = 0; i < 9; i++) {
      const s = document.createElement('span');
      s.className = 'heart';
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      const dx = (Math.random() - 0.5) * 150;
      s.style.left = cx + (Math.random() - 0.5) * r.width * 0.7 + 'px';
      s.style.top = cy + (Math.random() - 0.5) * 34 + 'px';
      s.style.setProperty('--dx', dx + 'px');
      s.style.fontSize = 15 + Math.random() * 14 + 'px';
      s.style.animationDelay = Math.random() * 0.14 + 's';
      s.style.color = ['#f472b6', '#fb7185', '#ec4899'][Math.floor(Math.random() * 3)];
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
  },

  fadeImgs(root) {
    const scope = root || document;
    scope.querySelectorAll('.work-icon img, .avatar img').forEach(img => {
      const show = () => img.classList.add('on');
      if (img.complete && img.naturalWidth > 0) show();
      else {
        img.addEventListener('load', show, { once: true });
        img.addEventListener('error', show, { once: true });
      }
    });
  },

  reveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -32px' });
    document.querySelectorAll('.reveal:not(.in)').forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * 45, 360) + 'ms';
      io.observe(el);
    });
  },

  scroll() {
    const nav = document.querySelector('.nav');
    const bar = document.createElement('div');
    bar.className = 'scroll-bar';
    document.body.appendChild(bar);

    const top = document.createElement('button');
    top.className = 'top-btn';
    top.setAttribute('aria-label', '回到顶部');
    top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(top);
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const run = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(Math.max(y, 0) / h, 1) : 0;
      bar.style.width = (pct * 100).toFixed(2) + '%';
      if (nav) nav.classList.toggle('stuck', y > 8);
      top.classList.toggle('show', y > 420);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        run();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    run();
  },

  countUp() {
    const nodes = document.querySelectorAll('[data-stat]');
    if (!nodes.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        const end = parseInt(el.textContent, 10) || 0;
        if (end <= 0) return;
        const dur = 900;
        const t0 = performance.now();
        const step = now => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    nodes.forEach(n => io.observe(n));
  },

  applySettings(s) {
    const set = (sel, val) => {
      document.querySelectorAll(sel).forEach(el => {
        if (val) el.textContent = val;
      });
    };
    set('[data-site-name]', s.site_name);
    set('[data-tagline]', s.tagline);
    set('[data-hero-title]', s.hero_title);
    set('[data-hero-sub]', s.hero_sub);
    set('[data-footer]', s.footer_note);
    document.title = s.site_name || 'RFGames Web';
    const icp = document.querySelector('[data-icp]');
    if (icp) {
      icp.innerHTML = '';
      if (s.icp) {
        const a = document.createElement('a');
        a.href = 'https://beian.miit.gov.cn/';
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = s.icp;
        icp.appendChild(a);
      }
      if (s.email) {
        const b = document.createElement('a');
        b.href = 'mailto:' + s.email;
        b.textContent = s.email;
        icp.appendChild(b);
      }
      if (s.github) {
        const g = document.createElement('a');
        g.href = s.github;
        g.target = '_blank';
        g.rel = 'noopener';
        g.textContent = 'GitHub';
        icp.appendChild(g);
      }
    }
  },

  boot() {
    const burger = document.querySelector('.burger');
    const links = document.querySelector('.nav-links');
    if (burger && links) {
      burger.addEventListener('click', () => {
        const open = links.classList.toggle('show');
        burger.classList.toggle('x', open);
        burger.textContent = open ? '✕' : '☰';
      });
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('show');
          burger.classList.remove('x');
          burger.textContent = '☰';
        });
      });
    }

    const now = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-page]').forEach(a => {
      if (a.getAttribute('data-page') === now) a.classList.add('on');
    });

    RF.applySettings(Store.all());
    RF.fadeImgs();
    RF.scroll();
    RF.reveal();
    RF.countUp();
  }
};

document.addEventListener('DOMContentLoaded', () => RF.boot());