const Admin = {
  tab: 'dashboard',

  msg(text, type) {
    const box = document.getElementById('msg');
    if (!box) return;
    box.innerHTML = '';
    if (!text) return;
    const div = document.createElement('div');
    div.className = 'alert ' + (type === 'err' ? 'err' : 'ok');
    div.textContent = text;
    box.appendChild(div);
    if (type !== 'err') setTimeout(() => div.remove(), 3200);
  },

  loginMsg(text, type) {
    const box = document.getElementById('login-msg');
    if (!box) return;
    box.innerHTML = '';
    if (!text) return;
    const div = document.createElement('div');
    div.className = 'alert ' + (type === 'err' ? 'err' : 'ok');
    div.textContent = text;
    box.appendChild(div);
  },

  authed() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === '1';
    } catch (e) {
      return false;
    }
  },

  setAuth(v) {
    try {
      if (v) sessionStorage.setItem(AUTH_KEY, '1');
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {
    }
  },

  showApp() {
    document.getElementById('login').hidden = true;
    document.getElementById('app').hidden = false;
    this.renderAll();
  },

  showLogin() {
    document.getElementById('app').hidden = true;
    document.getElementById('login').hidden = false;
  },

  switchTab(tab) {
    this.tab = tab;
    ['dashboard', 'works', 'team', 'settings'].forEach(k => {
      const pane = document.getElementById('pane-' + k);
      if (pane) pane.hidden = k !== tab;
    });
    document.querySelectorAll('.side nav a').forEach(a => {
      a.classList.toggle('on', a.getAttribute('data-tab') === tab);
    });
    if (location.hash.slice(1) !== tab) {
      history.replaceState(null, '', '#' + tab);
    }
    if (tab === 'dashboard') this.renderStats();
    if (tab === 'works') this.renderWorks();
    if (tab === 'team') this.renderTeam();
    if (tab === 'settings') this.fillSettings();
  },

  renderAll() {
    this.renderStats();
    this.renderWorks();
    this.renderTeam();
    this.fillSettings();
  },

  renderStats() {
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    const kb = Math.round(Store.bytes() / 1024);
    set('st-works', Store.works().length);
    set('st-team', Store.team().length);
    set('st-size', kb);
    set('st-size2', kb);
    const meter = document.getElementById('st-meter');
    if (meter) {
      const pct = Math.min((kb / (Store.quotaMB() * 1024)) * 100, 100);
      meter.style.width = pct.toFixed(1) + '%';
      meter.classList.toggle('warn', pct > 80);
    }
  },

  thumb(item, field, isMember) {
    const src = item[field] || '';
    if (src) return '<img src="' + Store.escapeHtml(src) + '" alt="">';
    return '<span>' + Store.escapeHtml(isMember ? Store.letter(item.name) : Store.letter(item.title)) + '</span>';
  },

  renderWorks() {
    const box = document.getElementById('works-list');
    if (!box) return;
    const list = Store.works();
    if (!list.length) {
      box.innerHTML = '<div class="empty">还没有作品，点击右上角「新增作品」开始。</div>';
      return;
    }
    box.innerHTML = list.map((w, i) => (
      '<div class="card">' +
      '<div class="thumb">' + this.thumb(w, 'icon', false) + '</div>' +
      '<div class="card-body">' +
      '<h4>' + Store.escapeHtml(w.title) + '</h4>' +
      '<p>' + Store.escapeHtml(w.desc) + '</p>' +
      '<code class="link">' + Store.escapeHtml(w.link || '未设置') + '</code>' +
      '</div>' +
      '<div class="card-act">' +
      '<button class="btn sm" data-edit-work="' + i + '">编辑</button>' +
      '<button class="btn sm" data-move-work="' + i + '" data-dir="up"' + (i === 0 ? ' disabled' : '') + '>上移</button>' +
      '<button class="btn sm" data-move-work="' + i + '" data-dir="down"' + (i === list.length - 1 ? ' disabled' : '') + '>下移</button>' +
      '<button class="btn sm danger" data-del-work="' + i + '">删除</button>' +
      '</div></div>'
    )).join('');
  },

  renderTeam() {
    const box = document.getElementById('team-list');
    if (!box) return;
    const list = Store.team();
    if (!list.length) {
      box.innerHTML = '<div class="empty">还没有成员，点击右上角「新增成员」开始。</div>';
      return;
    }
    box.innerHTML = list.map((m, i) => (
      '<div class="card">' +
      '<div class="thumb round">' + this.thumb(m, 'avatar', true) + '</div>' +
      '<div class="card-body">' +
      '<h4>' + Store.escapeHtml(m.name) + '</h4>' +
      (m.role ? '<em class="role">' + Store.escapeHtml(m.role) + '</em>' : '') +
      '<p>' + Store.escapeHtml(m.desc) + '</p>' +
      '<code class="link">' + Store.escapeHtml(m.contact || '未设置') + '</code>' +
      '</div>' +
      '<div class="card-act">' +
      '<button class="btn sm" data-edit-member="' + i + '">编辑</button>' +
      '<button class="btn sm danger" data-del-member="' + i + '">删除</button>' +
      '</div></div>'
    )).join('');
  },

  fillSettings() {
    const form = document.getElementById('settings-form');
    if (!form) return;
    const s = Store.all();
    Object.keys(Store.DEFAULTS).forEach(k => {
      if (k === 'works' || k === 'team') return;
      const el = form.elements[k];
      if (el) el.value = s[k] == null ? '' : s[k];
    });
  },

  openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('show');
    const first = el.querySelector('input:not([type=hidden]):not([type=file]), textarea');
    if (first) setTimeout(() => first.focus(), 80);
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  },

  resetWorkForm() {
    document.getElementById('work-form-el').reset();
    document.getElementById('w-icon-name').textContent = '未选择文件';
    document.getElementById('work-form-title').textContent = '新增作品';
  },

  resetMemberForm() {
    document.getElementById('member-form-el').reset();
    document.getElementById('m-avatar-name').textContent = '未选择文件';
    document.getElementById('member-form-title').textContent = '新增成员';
  },

  fillWork(item) {
    document.getElementById('w-id').value = item.id || '';
    document.getElementById('w-title').value = item.title || '';
    document.getElementById('w-desc').value = item.desc || '';
    document.getElementById('w-link').value = item.link || '';
    document.getElementById('w-icon-name').textContent = item.icon ? '已设置（留空则不更换）' : '未更换文件';
    document.getElementById('work-form-title').textContent = '编辑作品';
    this.openModal('work-form');
  },

  fillMember(item) {
    document.getElementById('m-id').value = item.id || '';
    document.getElementById('m-name').value = item.name || '';
    document.getElementById('m-role').value = item.role || '';
    document.getElementById('m-desc').value = item.desc || '';
    document.getElementById('m-contact').value = item.contact || '';
    document.getElementById('m-contactLink').value = item.contactLink || '';
    document.getElementById('m-avatar-name').textContent = item.avatar ? '已设置（留空则不更换）' : '未更换文件';
    document.getElementById('member-form-title').textContent = '编辑成员';
    this.openModal('member-form');
  },

  normLink(v) {
    const s = String(v || '').trim();
    if (!s) return '';
    if (/^(https?:\/\/|mailto:|tel:|\/|#|\.)/i.test(s)) return s;
    return 'https://' + s;
  },

  async submitWork(e) {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title.value.trim();
    if (!title) {
      this.msg('请填写标题', 'err');
      return;
    }
    const file = document.getElementById('w-icon').files[0];
    const icon = file ? await Store.toDataUrl(file, 320, 0.82) : null;
    if (file && !icon) {
      this.msg('图标处理失败，请换一张图片', 'err');
      return;
    }

    const list = Store.works();
    const data = {
      title,
      desc: form.elements.desc.value.trim(),
      link: this.normLink(form.elements.link.value)
    };

    const editKey = form.elements.id.value;
    const target = editKey ? list.find(x => x.id === editKey) : null;

    if (target) {
      Object.assign(target, data);
      if (icon) target.icon = icon;
      this.msg('作品已更新');
    } else {
      list.unshift({ id: Store.uid(), icon: icon || '', created: Store.now(), ...data });
      this.msg('作品已添加');
    }

    const res = Store.saveWorks(list);
    if (!res.ok) {
      this.msg(res.error, 'err');
      return;
    }
    this.resetWorkForm();
    this.closeModal('work-form');
    this.renderWorks();
    this.renderStats();
  },

  async submitMember(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.elements.name.value.trim();
    if (!name) {
      this.msg('请填写姓名', 'err');
      return;
    }
    const file = document.getElementById('m-avatar').files[0];
    const avatar = file ? await Store.toDataUrl(file, 256, 0.82) : null;
    if (file && !avatar) {
      this.msg('头像处理失败，请换一张图片', 'err');
      return;
    }

    const list = Store.team();
    const data = {
      name,
      role: form.elements.role.value.trim(),
      desc: form.elements.desc.value.trim(),
      contact: form.elements.contact.value.trim(),
      contactLink: this.normLink(form.elements.contactLink.value)
    };

    const editKey = form.elements.id.value;
    const target = editKey ? list.find(x => x.id === editKey) : null;

    if (target) {
      Object.assign(target, data);
      if (avatar) target.avatar = avatar;
      this.msg('成员已更新');
    } else {
      list.unshift({ id: Store.uid(), avatar: avatar || '', created: Store.now(), ...data });
      this.msg('成员已添加');
    }

    const res = Store.saveTeam(list);
    if (!res.ok) {
      this.msg(res.error, 'err');
      return;
    }
    this.resetMemberForm();
    this.closeModal('member-form');
    this.renderTeam();
    this.renderStats();
  },

  submitSettings(e) {
    e.preventDefault();
    const form = e.target;
    const patch = {};
    Object.keys(Store.DEFAULTS).forEach(k => {
      if (k === 'works' || k === 'team') return;
      const el = form.elements[k];
      if (el) patch[k] = el.value.trim();
    });
    const res = Store.save(patch);
    this.msg(res.ok ? '站点信息已保存' : res.error, res.ok ? 'ok' : 'err');
    if (res.ok) this.renderStats();
  },

  submitPwd(e) {
    e.preventDefault();
    const form = e.target;
    const cur = form.elements.current.value;
    const next = form.elements.next.value;
    const stored = sessionStorage.getItem('rfgames_pwd') || '';
    if (cur !== stored) {
      this.msg('当前密码错误', 'err');
      return;
    }
    if (next.length < 4) {
      this.msg('新密码至少 4 位', 'err');
      return;
    }
    sessionStorage.setItem('rfgames_pwd', next);
    form.reset();
    this.msg('密码已更新');
  },

  bind() {
    document.getElementById('login-btn').addEventListener('click', () => {
      const pwd = document.getElementById('pwd').value;
      const stored = sessionStorage.getItem('rfgames_pwd') || '';
      if (pwd === stored) {
        this.setAuth(true);
        this.showApp();
        this.switchTab(this.tab);
      } else {
        this.loginMsg('密码错误', 'err');
      }
    });

    document.getElementById('pwd').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('login-btn').click();
    });

    document.getElementById('logout').addEventListener('click', e => {
      e.preventDefault();
      this.setAuth(false);
      this.showLogin();
    });

    document.querySelectorAll('.side nav a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        this.switchTab(a.getAttribute('data-tab'));
      });
    });

    window.addEventListener('hashchange', () => {
      const t = location.hash.slice(1);
      if (['dashboard', 'works', 'team', 'settings'].includes(t)) this.switchTab(t);
    });

    document.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open');
        if (id === 'work-form') {
          this.resetWorkForm();
          this.openModal(id);
        } else {
          this.resetMemberForm();
          this.openModal(id);
        }
      });
    });

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal(btn.closest('.modal').id));
    });

    document.querySelectorAll('.modal').forEach(m => {
      m.addEventListener('click', e => {
        if (e.target === m) m.classList.remove('show');
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
    });

    document.getElementById('work-form-el').addEventListener('submit', e => this.submitWork(e));
    document.getElementById('member-form-el').addEventListener('submit', e => this.submitMember(e));
    document.getElementById('settings-form').addEventListener('submit', e => this.submitSettings(e));
    document.getElementById('pwd-form').addEventListener('submit', e => this.submitPwd(e));

    const fileMap = { 'w-icon': 'w-icon-name', 'm-avatar': 'm-avatar-name' };
    Object.keys(fileMap).forEach(id => {
      const input = document.getElementById(id);
      input.addEventListener('change', () => {
        const target = document.getElementById(fileMap[id]);
        const f = input.files[0];
        target.textContent = f ? f.name + '（将自动压缩）' : '未选择文件';
      });
    });

    document.getElementById('works-list').addEventListener('click', e => {
      const t = e.target;
      const list = Store.works();

      if (t.hasAttribute('data-edit-work')) {
        this.fillWork(list[Number(t.getAttribute('data-edit-work'))]);
        return;
      }
      if (t.hasAttribute('data-del-work')) {
        const i = Number(t.getAttribute('data-del-work'));
        if (!confirm('确认删除「' + list[i].title + '」？此操作不可恢复')) return;
        list.splice(i, 1);
        const res = Store.saveWorks(list);
        this.msg(res.ok ? '作品已删除' : res.error, res.ok ? 'ok' : 'err');
        this.renderWorks();
        this.renderStats();
        return;
      }
      if (t.hasAttribute('data-move-work')) {
        const i = Number(t.getAttribute('data-move-work'));
        const j = t.getAttribute('data-dir') === 'up' ? i - 1 : i + 1;
        if (j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        Store.saveWorks(list);
        this.renderWorks();
      }
    });

    document.getElementById('team-list').addEventListener('click', e => {
      const t = e.target;
      const list = Store.team();

      if (t.hasAttribute('data-edit-member')) {
        this.fillMember(list[Number(t.getAttribute('data-edit-member'))]);
        return;
      }
      if (t.hasAttribute('data-del-member')) {
        const i = Number(t.getAttribute('data-del-member'));
        if (!confirm('确认删除成员「' + list[i].name + '」？此操作不可恢复')) return;
        list.splice(i, 1);
        const res = Store.saveTeam(list);
        this.msg(res.ok ? '成员已删除' : res.error, res.ok ? 'ok' : 'err');
        this.renderTeam();
        this.renderStats();
      }
    });

    document.getElementById('do-export').addEventListener('click', () => {
      Store.exportJson();
      this.msg('备份已导出');
    });

    document.getElementById('do-import').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', async e => {
      const f = e.target.files[0];
      if (!f) return;
      if (!confirm('导入将覆盖当前全部数据，确认继续？')) {
        e.target.value = '';
        return;
      }
      const text = await f.text();
      const res = Store.importJson(text);
      this.msg(res.ok ? '数据已恢复' : res.error, res.ok ? 'ok' : 'err');
      if (res.ok) this.renderAll();
      e.target.value = '';
    });

    document.getElementById('do-reset').addEventListener('click', () => {
      if (!confirm('确认清空全部数据？此操作不可恢复，建议先导出备份')) return;
      Store.resetAll();
      this.renderAll();
      this.msg('数据已清空');
    });
  },

  init() {
    const hash = location.hash.slice(1);
    if (['dashboard', 'works', 'team', 'settings'].includes(hash)) this.tab = hash;
    this.bind();
    if (this.authed()) {
      this.showApp();
      this.switchTab(this.tab);
    } else {
      this.showLogin();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());