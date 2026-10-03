const STORE_KEY = 'rfgames_v1';
const AUTH_KEY = 'rfgames_auth';

const DEFAULTS = {
  site_name: 'RFGames Web',
  tagline: 'Games made with care',
  intro: 'RFGames Web 是一个独立游戏作品站，收集我们做过的一切作品。',
  hero_title: 'RFGames',
  hero_sub: '用游戏记录想象',
  github: '',
  email: '',
  icp: '',
  footer_note: '© 2026 RFGames Web',
  works: [],
  team: []
};

function readRaw() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : null;
  } catch (e) {
    return null;
  }
}

function writeRaw(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: '存储空间不足，请删除部分内容或清理图片' };
  }
}

function all() {
  const data = readRaw();
  return {
    ...DEFAULTS,
    ...(data || {})
  };
}

function save(patch) {
  const cur = all();
  const next = { ...cur, ...patch };
  return writeRaw(next);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now() {
  return Date.now();
}

function bytes() {
  const raw = localStorage.getItem(STORE_KEY) || '';
  return new Blob([raw]).size;
}

function quotaMB() {
  return (5 * 1024 * 1024) / 1024 / 1024;
}

function img(src) {
  return String(src || '') ? String(src) : '';
}

function letter(text) {
  const s = String(text || '').trim();
  return s ? Array.from(s)[0].toUpperCase() : 'R';
}

function works() {
  return Array.isArray(all().works) ? all().works : [];
}

function team() {
  return Array.isArray(all().team) ? all().team : [];
}

function saveWorks(list) {
  return save({ works: list });
}

function saveTeam(list) {
  return save({ team: list });
}

async function shrink(file, max, quality) {
  if (!file) return null;
  if (typeof createImageBitmap !== 'function') {
    return await readAs(file);
  }
  let bmp;
  try {
    bmp = await createImageBitmap(file);
  } catch (e) {
    return await readAs(file);
  }
  const ratio = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * ratio));
  const h = Math.max(1, Math.round(bmp.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close && bmp.close();
  const webp = canvas.toDataURL('image/webp', quality);
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality);
}

function readAs(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error('读取失败'));
    fr.readAsDataURL(file);
  });
}

async function toDataUrl(file, max, quality) {
  try {
    return await shrink(file, max || 320, quality || 0.82);
  } catch (e) {
    return null;
  }
}

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function safeLink(link) {
  const s = String(link || '').trim();
  if (!s) return '';
  if (/^(javascript|data:text\/html|vbscript)/i.test(s)) return '';
  if (/^(https?:\/\/|mailto:|tel:|\/|#|\.)/i.test(s)) return s;
  return s;
}

function shapeWork(item) {
  return {
    id: String(item.id || ''),
    title: String(item.title || ''),
    desc: String(item.desc || ''),
    link: String(item.link || ''),
    icon: img(item.icon),
    letter: letter(item.title),
    created: Number(item.created) || 0
  };
}

function shapeMember(item) {
  return {
    id: String(item.id || ''),
    name: String(item.name || ''),
    role: String(item.role || ''),
    desc: String(item.desc || ''),
    contact: String(item.contact || ''),
    contactLink: String(item.contactLink || ''),
    avatar: img(item.avatar),
    letter: letter(item.name),
    created: Number(item.created) || 0
  };
}

function exportJson() {
  const blob = new Blob([JSON.stringify(all(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rfgames-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function importJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: '文件格式错误，无法解析' };
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, error: '文件内容不是有效数据' };
  }
  const res = writeRaw({ ...DEFAULTS, ...data });
  return res.ok ? { ok: true } : res;
}

function resetAll() {
  localStorage.removeItem(STORE_KEY);
}

window.Store = {
  DEFAULTS,
  all,
  save,
  works,
  team,
  saveWorks,
  saveTeam,
  uid,
  now,
  bytes,
  quotaMB,
  toDataUrl,
  escapeHtml,
  safeLink,
  letter,
  shapeWork,
  shapeMember,
  exportJson,
  importJson,
  resetAll
};