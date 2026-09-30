(() => {
window.__crawl = window.__crawl || {}; const C = window.__crawl, org = location.hostname.includes('webb') ? 'webb' : location.hostname.includes('eso.org') ? 'eso' : location.hostname.includes('noirlab') ? 'noirlab' : 'hubble'; const base = org === 'eso' || org === 'noirlab' ? '/public/images/' : '/images/';
const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) { for (let t = 0; t < 3; t++) { try { const r = await fetch(url); if (r.ok) return await r.text(); if (r.status === 404) return null; } catch {} await sleep(800 * (t + 1)); } return null; }
function parse(id, h) {
  const d = new DOMParser().parseFromString(h, 'text/html');
  d.querySelectorAll('script,style').forEach((e) => e.remove());
  const info = {};
  d.querySelectorAll('.object-info th[scope=row], .object-info td.title').forEach((th) => {
    const k = txt(th).replace(/:$/, ''), v = th.nextElementSibling;
    const val = v ? (v.innerHTML.includes('<br') ? v.innerHTML.split(/<br\s*\/?>/).map((x) => x.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean).join(' | ') : txt(v)) : '';
    info[k] = info[k] ? info[k] + ' || ' + val : val;
  });
  const dl = {};
  d.querySelectorAll('a[href*="/archives/images/"]').forEach((a) => {
    const m = a.getAttribute('href').match(/archives\/images\/(publicationjpg|large|screen|original)\//);
    if (m && !dl[m[1]]) dl[m[1]] = { url: a.getAttribute('href'), size: ((a.parentElement?.parentElement?.textContent || '').match(/([\d.]+\s*[KMG]B)/) || [])[1] || '' };
  });
  let filters = [];
  const fh = [...d.querySelectorAll('h1,h2,h3,h4,h5')].find((e) => /Colou?rs\s*&(amp;)?\s*filters/i.test(e.textContent));
  if (fh) {
    let t = fh.nextElementSibling; while (t && t.tagName !== 'TABLE' && !t.querySelector?.('table')) t = t.nextElementSibling;
    const tbl = t && (t.tagName === 'TABLE' ? t : t.querySelector('table'));
    if (tbl) filters = [...tbl.querySelectorAll('tr')].map((tr) => [...tr.querySelectorAll('td,th')].map(txt)).filter((r) => r.length >= 3 && !/^Band$/i.test(r[0]));
  }
  const h1 = d.querySelector('h1');
  const box = h1 ? h1.parentElement : d.body;
  const credit = txt(box.querySelector('.credit')) || '';
  const paras = [...box.querySelectorAll('p')].map(txt).filter(Boolean);
  const caption = paras.filter((p) => !/^\[?Image description/i.test(p) && p !== credit && !credit.startsWith(p));
  const imgDesc = (paras.find((p) => /^\[?Image description/i.test(p)) || '').replace(/^\[?Image description:?\s*/i, '').replace(/\]$/, '');
  return { id, org, title: txt(h1), info, dl, filters, credit, caption, imgDesc };
}
C.details = async (ids, conc = 6) => {
  C.busy = true; let i = 0;
  const worker = async () => { while (i < ids.length) { const id = ids[i++]; if (C.recs[id]) continue; const h = await get(`${base}${id}/`); if (h) { try { C.recs[id] = parse(id, h); } catch (e) { C.log.push(`parse ${id}: ${e.message}`); } } else C.log.push(`fail ${id}`); } };
  await Promise.all(Array.from({ length: conc }, worker)); C.busy = false;
};
C.testParse = async (id) => parse(id, await get(`${base}${id}/`));
C.recs = {}; C.log = [];
})();
