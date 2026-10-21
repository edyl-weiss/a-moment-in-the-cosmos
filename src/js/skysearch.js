// "Search the sky": constellations (with their everyday names and asterisms), bright stars, the Moon and
// planets, and every object in the collection. Famous objects carry the names people actually type
// ("seven sisters", "big dipper", "m42"), and rank first.

// Everyday names: the English meaning of each constellation plus well-known asterisms and nicknames.
export const CON_ALIASES = {
  And: ['princess', 'chained princess', 'chained woman'], Ant: ['air pump'], Aps: ['bird of paradise'], Aql: ['eagle'],
  Aqr: ['water bearer', 'water carrier'], Ara: ['altar'], Ari: ['ram'], Aur: ['charioteer'], Boo: ['herdsman', 'bootes', 'kite'],
  CMa: ['great dog', 'big dog', 'greater dog'], CMi: ['little dog', 'lesser dog'], CVn: ['hunting dogs'], Cae: ['chisel'],
  Cam: ['giraffe'], Cap: ['sea goat', 'goat'], Car: ['keel'], Cas: ['queen', 'the w', 'w constellation'], Cen: ['centaur'],
  Cep: ['king'], Cet: ['whale', 'sea monster'], Cha: ['chameleon'], Cir: ['compass', 'compasses'], Cnc: ['crab'], Col: ['dove'],
  Com: ['berenices hair', 'bernice'], CrA: ['southern crown'], CrB: ['northern crown'], Crt: ['cup'], Cru: ['southern cross', 'cross'],
  Crv: ['crow'], Cyg: ['swan'], Del: ['dolphin'], Dor: ['swordfish', 'dolphinfish'], Dra: ['dragon'],
  Equ: ['little horse', 'foal'], Eri: ['river'], For: ['furnace'], Gem: ['twins'], Gru: ['crane'], Her: ['strongman'],
  Hor: ['clock', 'pendulum clock'], Hya: ['water snake', 'sea serpent'], Hyi: ['little water snake', 'male water snake'],
  Ind: ['indian'], LMi: ['little lion', 'lesser lion'], Lac: ['lizard'], Leo: ['lion'], Lep: ['hare', 'rabbit'],
  Lib: ['scales', 'balance'], Lup: ['wolf'], Lyn: ['lynx'], Lyr: ['lyre', 'harp'], Men: ['table mountain'], Mic: ['microscope'],
  Mon: ['unicorn'], Mus: ['fly'], Nor: ['carpenters square', 'level'], Oct: ['octant', 'south pole'], Oph: ['serpent bearer', 'snake handler'],
  Ori: ['hunter'], Pav: ['peacock'], Peg: ['winged horse'],
  Per: ['hero'], Phe: ['phoenix'], Pic: ['painters easel', 'easel'], PsA: ['southern fish'], Psc: ['fishes', 'fish'],
  Pup: ['stern', 'poop deck'], Pyx: ['mariners compass'], Ret: ['net', 'reticle'], Scl: ['sculptor'], Sco: ['scorpion'],
  Sct: ['shield'], Ser1: ['serpent', 'snake', 'serpens', 'serpents head'], Ser2: ['serpents tail'], Sex: ['sextant'],
  Sge: ['arrow'], Sgr: ['archer'], Tau: ['bull'], Tel: ['telescope'], TrA: ['southern triangle'], Tri: ['triangle'],
  Tuc: ['toucan'], UMa: ['great bear', 'big bear', 'saucepan', 'the dipper'],
  UMi: ['little bear', 'lesser bear'], Vel: ['sails'], Vir: ['virgin', 'maiden'],
  Vol: ['flying fish'], Vul: ['fox', 'little fox']
};

// The brightest and best-known stars, each found through its constellation.
const STARS = [
  ['Sirius', 'CMa', ['dog star']], ['Betelgeuse', 'Ori', ['beetlejuice']], ['Rigel', 'Ori'], ['Polaris', 'UMi', ['north star', 'pole star']],
  ['Vega', 'Lyr'], ['Arcturus', 'Boo'], ['Antares', 'Sco'], ['Aldebaran', 'Tau', ['eye of the bull']], ['Deneb', 'Cyg'],
  ['Altair', 'Aql'], ['Spica', 'Vir'], ['Capella', 'Aur'], ['Procyon', 'CMi'], ['Regulus', 'Leo'], ['Castor', 'Gem'], ['Pollux', 'Gem'],
  ['Fomalhaut', 'PsA'], ['Canopus', 'Car'], ['Alpha Centauri', 'Cen', ['rigil kentaurus', 'proxima centauri', 'nearest star']],
  ['Achernar', 'Eri'], ['Bellatrix', 'Ori'], ['Mizar', 'UMa', ['alcor']], ['Dubhe', 'UMa'], ['Algol', 'Per', ['demon star']],
  ['Eta Carinae', 'Car'], ['Hadar', 'Cen'], ['Acrux', 'Cru']
];

// Star patterns that aren't constellations, each found through the constellation it sits in (or mostly in).
const ASTERISMS = [
  ['Summer Triangle', 'Lyr', ['vega deneb altair']], ['Winter Triangle', 'CMi'], ['Winter Hexagon', 'Ori', ['winter circle']],
  ['Orion’s Belt', 'Ori', ['belt of orion', 'three kings', 'three sisters']], ['Big Dipper', 'UMa', ['plow', 'plow']], ['Little Dipper', 'UMi'],
  ['Great Square of Pegasus', 'Peg', ['great square']], ['Northern Cross', 'Cyg'], ['Teapot', 'Sgr'], ['Sickle', 'Leo'], ['Keystone', 'Her'],
  ['False Cross', 'Car'], ['Diamond Cross', 'Car'], ['Coathanger', 'Vul', ['brocchis cluster']], ['Kids', 'Aur']
];

// Famous objects, most famous first: what people call them, and how to recognize them in the collection.
export const FAMOUS = [
  ['Andromeda Galaxy', ['m31', 'messier 31', 'andromeda galaxy', 'andromeda nebula'], /\b(andromeda galaxy|m ?31|messier 31)\b/],
  ['Orion Nebula', ['m42', 'messier 42', 'great orion nebula', 'great nebula in orion'], /\b(orion nebula|m ?42|messier 42)\b/],
  ['Pleiades', ['pleiades', 'seven sisters', '7 sisters', 'm45', 'messier 45', 'subaru', 'pleiades cluster'], /\b(pleiad\w*|m ?45|messier 45|seven sisters)\b/],
  ['Pillars of Creation', ['pillars of creation', 'eagle nebula', 'm16', 'messier 16'], /\b(pillars of creation|eagle nebula|m ?16|messier 16)\b/],
  ['Horsehead Nebula', ['horsehead', 'horse head nebula', 'barnard 33', 'b33'], /\b(horsehead|horse ?head|barnard 33)\b/],
  ['Crab Nebula', ['crab nebula', 'm1', 'messier 1'], /\b(crab nebula|m ?1|messier 1)\b(?!\d)/],
  ['Whirlpool Galaxy', ['whirlpool', 'm51', 'messier 51'], /\b(whirlpool|m ?51|messier 51)\b/],
  ['Carina Nebula', ['carina nebula', 'great nebula in carina', 'ngc 3372', 'cosmic cliffs', 'mystic mountain'], /\b(carina nebula|ngc ?3372|cosmic cliffs|mystic mountain)\b/],
  ['Ring Nebula', ['ring nebula', 'm57', 'messier 57'], /\b(ring nebula|m ?57|messier 57)\b/],
  ['Sombrero Galaxy', ['sombrero', 'm104', 'messier 104'], /\b(sombrero|m ?104|messier 104)\b/],
  ['Magellanic Clouds', ['large magellanic cloud', 'small magellanic cloud', 'lmc', 'smc', 'magellanic clouds'], /\b(magellanic|lmc|smc)\b/],
  ['Lagoon Nebula', ['lagoon nebula', 'm8', 'messier 8'], /\b(lagoon nebula|m ?8|messier 8)\b(?!\d)/],
  ['Tarantula Nebula', ['tarantula', '30 doradus', 'ngc 2070'], /\b(tarantula|30 doradus|ngc ?2070)\b/],
  ['Helix Nebula', ['helix', 'eye of god', 'eye of sauron', 'ngc 7293'], /\b(helix nebula|ngc ?7293)\b/],
  ['Triangulum Galaxy', ['triangulum galaxy', 'm33', 'messier 33', 'pinwheel of triangulum'], /\b(triangulum galaxy|m ?33|messier 33)\b/],
  ['Pinwheel Galaxy', ['pinwheel', 'm101', 'messier 101'], /\b(pinwheel galaxy|m ?101|messier 101)\b/],
  ['Trifid Nebula', ['trifid', 'm20', 'messier 20'], /\b(trifid|m ?20|messier 20)\b/],
  ['Omega Centauri', ['omega centauri', 'ngc 5139'], /\b(omega centauri|ngc ?5139)\b/],
  ['Hercules Cluster', ['great hercules cluster', 'm13', 'messier 13', 'hercules globular'], /\b(m ?13|messier 13|hercules globular)\b/],
  ['Beehive Cluster', ['beehive', 'praesepe', 'm44', 'messier 44'], /\b(beehive|praesepe|m ?44|messier 44)\b/],
  ['Cat’s Eye Nebula', ['cats eye', 'ngc 6543'], /\b(cat.?s eye|ngc ?6543)\b/],
  ['Butterfly Nebula', ['butterfly nebula', 'bug nebula', 'ngc 6302'], /\b(butterfly nebula|bug nebula|ngc ?6302)\b/],
  ['Southern Ring Nebula', ['southern ring', 'eight burst', 'ngc 3132'], /\b(southern ring|eight.burst|ngc ?3132)\b/],
  ['Stephan’s Quintet', ['stephans quintet', 'hickson 92'], /\b(stephan.?s quintet|hickson 92)\b/],
  ['Cartwheel Galaxy', ['cartwheel'], /\bcartwheel\b/],
  ['Heart Nebula', ['heart nebula', 'ic 1805'], /\b(heart nebula|ic ?1805)\b/],
  ['Rosette Nebula', ['rosette'], /\brosette\b/],
  ['Flame Nebula', ['flame nebula', 'ngc 2024'], /\b(flame nebula|ngc ?2024)\b/],
  ['Jewel Box', ['jewel box', 'kappa crucis', 'ngc 4755'], /\b(jewel box|ngc ?4755)\b/],
  ['Westerlund 2', ['westerlund'], /\bwesterlund\b/],
  ['Milky Way', ['milky way', 'galactic center', 'galactic center'], /\bmilky way\b/]
];

const WORDS = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12' };
// Lowercase, no accents or punctuation, number words as digits, "M 42" and "Messier 42" as "m42".
export function norm(t) {
  return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/g, (w) => WORDS[w])
    .replace(/\bmessier (\d+)/g, 'm$1').replace(/\b(m|ngc|ic|b|hh) (\d+)/g, '$1$2')
    .replace(/^the /, '').trim();
}

// Names an object goes by in the collection: the catalog line before "constellation …", plus its title.
function namesOf(e) {
  const seg = e.cat === 'night' ? '' : (e.q || '').split(/ · constellation| · about /)[0];
  const names = seg && !seg.startsWith('constellation') ? seg.split(/\s*·\s*|,\s*/) : [];
  return [...names, e.title].map((n) => n.trim()).filter((n) => n && n.length < 60);
}

let entries = null;
// Built once the collection index is in: one entry per searchable thing.
export function buildIndex({ cons, index, bodies }) {
  entries = [];
  const add = (x) => entries.push({ ...x, keys: [...new Set([x.label, ...(x.aliases || [])].map(norm))] });
  // famous objects first
  FAMOUS.forEach(([label, aliases, re], rank) => {
    const ids = index.filter((e) => re.test(`${e.q} ${e.title}`.toLowerCase())).map((e) => e.id);
    if (ids.length) add({ kind: 'object', label, aliases, ids, fame: 60 - rank });
  });
  for (const b of bodies) add({ kind: 'body', id: b.id, label: b.id === 'moon' ? 'The Moon' : b.name, aliases: b.id === 'moon' ? ['moon', 'luna'] : [], fame: 55 });
  for (const [k, name] of cons) add({ kind: 'con', id: k, label: name, aliases: CON_ALIASES[k] || [], fame: 45 });
  STARS.forEach(([name, con, aliases = []], i) => add({ kind: 'star', id: con, label: name, aliases, fame: 40 - i * 0.3 }));
  ASTERISMS.forEach(([name, con, aliases = []]) => add({ kind: 'asterism', id: con, label: name, aliases, fame: 44 }));
  // every other object in the collection, by each name it goes by
  const byName = new Map();
  for (const e of index) {
    for (const n of namesOf(e)) {
      const k = norm(n);
      if (!k) continue;
      if (!byName.has(k)) byName.set(k, { label: n, ids: [] });
      byName.get(k).ids.push(e.id);
    }
  }
  for (const { label, ids } of byName.values()) add({ kind: 'object', label, ids, fame: Math.min(10, ids.length * 2) });
}

// Best matches for what's typed: exact name, then names that start with it, then words that do, then anywhere.
export function search(q, limit = 8) {
  const n = norm(q);
  if (!n || !entries) return [];
  const scored = [];
  for (const x of entries) {
    let best = 0;
    for (const k of x.keys) {
      const s = k === n ? 100 : k.startsWith(n) ? 80 : (` ${k}`).includes(` ${n}`) ? 60 : n.length > 2 && k.includes(n) ? 35 : 0;
      if (s > best) best = s;
    }
    if (best) scored.push({ x, score: best + x.fame });
  }
  scored.sort((a, b) => b.score - a.score);
  // one result per destination (an object can match under several of its names)
  const seen = new Set(), covered = new Set(), out = [];
  for (const { x } of scored) {
    const dest = x.kind === 'object' ? `o:${[...x.ids].sort()[0]}` : `${x.kind}:${x.id}:${x.kind === 'star' || x.kind === 'asterism' ? x.label : ''}`;
    const name = `${x.kind === 'object' ? 'o' : x.kind}:${norm(x.label)}`;
    // an object already covered by a better result (the Pleiades under its photo's title) isn't repeated
    if (seen.has(dest) || seen.has(name) || (x.kind === 'object' && x.ids.every((id) => covered.has(id)))) continue;
    seen.add(dest); seen.add(name); out.push(x);
    if (x.kind === 'object') x.ids.forEach((id) => covered.add(id));
    if (out.length === limit) break;
  }
  return out;
}

// For the collection search: a nickname typed in full ("seven sisters", "big dipper") becomes a test for
// the object or constellation it names. Returns null when the words aren't a known nickname.
export function aliasMatch(q) {
  const n = norm(q);
  if (!n) return null;
  const f = FAMOUS.find(([label, aliases]) => [label, ...aliases].some((a) => norm(a) === n));
  if (f) return (e) => f[2].test(`${e.q || ''} ${e.title}`.toLowerCase());
  const con = Object.entries(CON_ALIASES).find(([, al]) => al.some((a) => norm(a) === n));
  if (con) return (e) => e.con === con[0];
  const ast = ASTERISMS.find(([name, , al = []]) => [name, ...al].some((a) => norm(a) === n));
  if (ast) return (e) => e.con === ast[1];
  return null;
}
