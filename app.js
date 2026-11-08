(() => {
'use strict';

/* ---------- constants ---------- */
const SEX = {
  u:{t:'미확인', s:'?', c:'unk'}, pm:{t:'수컷 추정', s:'♂?', c:'male'}, pf:{t:'암컷 추정', s:'♀?', c:'female'},
  m:{t:'수컷', s:'♂', c:'male'}, f:{t:'암컷', s:'♀', c:'female'}
};
const STATUS = { active:'보유 중', sold:'분양 완료', dead:'사망', ref:'혈관리용' };
const STATUS_OPT = { active:'보유 중', sold:'분양 완료', dead:'사망', ref:'혈관리용 (내 개체 아님 · 혈통 관리에만 사용)' };
const ROLE_RO = { admin:'관리자로', keeper:'기록 담당으로', viewer:'보기 전용으로' };
const APP_NAME = '게코 관리노트';
const UA = navigator.userAgent || '';
const IN_KAKAO = /KAKAOTALK/i.test(UA);
const IN_APP = IN_KAKAO || /Instagram|FBAN|FBAV|Line\/|NAVER\(inapp|DaumApps|everytimeApp|; wv\)/i.test(UA);
const IS_IOS = /iPhone|iPad|iPod/i.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IS_ANDROID = /Android/i.test(UA);
const IS_SAMSUNG = /SamsungBrowser/i.test(UA);
const IS_IOS_SAFARI = IS_IOS && !/CriOS|FxiOS|EdgiOS|KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(UA);
const runningAsApp = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const ATE = { all:'다 먹음', some:'조금 먹음', none:'안 먹음' };
const LOGT = { weight:'무게', feed:'급여', shed:'탈피', poop:'배변', note:'메모' };
const SHEDQ = { ok:'정상', stuck:'불완전(잔여 탈피)' };
const POOPQ = { ok:'정상', soft:'묽음', urate:'요산만', other:'기타' };
const CLS = { incubating:'인큐 중', hatched:'해칭 완료', failed:'실패', infertile:'무정란' };
const SRC = { self:'자가 해칭', buy:'입양(구매)', other:'기타' };
const MORPHS = ['할리퀸','익스트림 할리퀸','핀스트라이프','풀 핀스트라이프','달마시안','슈퍼 달마시안','플레임','타이거','브린들','바이컬러','패턴리스','릴리화이트','아잔틱','카푸치노','소프트스케일','크림시클','팬텀','레드 베이스','옐로 베이스','올리브'];
const DEF = { feedAlertDays:3, feedMode:'interval', feedDays:[], foods:['슈퍼푸드(CGD)','귀뚜라미','듀비아','기타 곤충'], codePrefix:'CR-' };
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const WD_ORDER = [1, 2, 3, 4, 5, 6, 0];
const wdPicker = (name, days) => `<div class="wdpick" role="group">${WD_ORDER.map(d => `<label><input type="checkbox" name="${name}" value="${d}"${days && days.includes(d) ? ' checked' : ''}><span>${WD[d]}</span></label>`).join('')}</div>`;
const wdRead = (root, name) => [...root.querySelectorAll(`input[name=${name}]:checked`)].map(i => +i.value).sort();
const wdText = days => !days || !days.length ? '없음' : days.length === 7 ? '매일' : WD_ORDER.filter(d => days.includes(d)).map(d => WD[d]).join('·');
const CFG = window.GECKO_CONFIG || {};
const LCAT = { expense:['개체 입양', '먹이', '용품', '사육장·인테리어', '병원·약', '전기·난방', '택배·운송', '기타 지출'], income:['분양', '용품 판매', '기타 수입'] };
const LKIND = { expense:'지출', income:'수입' };
const ROLE = { admin:'관리자', keeper:'기록 담당', viewer:'보기 전용' };
const ROLE_HINT = { admin:'개체·브리딩·분양·설정·구성원까지 모두', keeper:'무게·급여·탈피·배변·메모 기록 추가와 수정', viewer:'보기만 가능' };
const HATCHM = { exact:'정확한 날짜', approx:'대략(추정)', unknown:'알 수 없음' };
const PUBF = [
  ['hatch', '해칭일·나이'], ['lineage', '혈통(부모·조부모)'], ['breeder', '브리더(이름·로고)'], ['weight', '무게 기록'],
  ['care', '급여·탈피·배변 기록'], ['sale', '분양일·분양가'], ['buyer', '분양받은 분 이름'], ['notes', '메모']
];
const pubT = (k, t) => k === 'breeder' ? `${U() === '브랜드' ? '브리더' : U()} 이름·로고` : t;
const PUB_DEF = { hatch:true, lineage:true, breeder:true, weight:false, care:false, sale:false, buyer:false, notes:false };
const FOOT = '<svg class="foot" viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><ellipse cx="32" cy="18" rx="7" ry="8"/><ellipse cx="32" cy="33" rx="8.5" ry="11.5"/><path d="M30 43c-1 8 3 13 11 16-4-4-6-9-5.5-16z"/><circle cx="17" cy="22" r="2.6"/><circle cx="47" cy="22" r="2.6"/><circle cx="17" cy="46" r="2.6"/><circle cx="47" cy="46" r="2.6"/></g><path d="M26 27l-8-4M38 27l8-4M26 39l-8 6M38 39l8 6" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" fill="none"/></svg>';
const EGG = '<svg width="22" height="26" viewBox="0 0 24 28" aria-hidden="true"><path d="M12 2C17 2 21 10.5 21 17a9 9 0 0 1-18 0C3 10.5 7 2 12 2z" fill="#FFFDF6" stroke="var(--edge)" stroke-width="2"/></svg>';
const tone = g => { let h = 0; const k = String((g && (g.id || g.code)) || ''); for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return 't' + (h % 5); };
const QICON = {
  weight:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20h14l-1.6-10.5H6.6z"/><circle cx="12" cy="6" r="2.2"/></svg>',
  feed:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 8.5c0-2 2-2 2-4.5M14 8.5c0-2 2-2 2-4.5"/></svg>',
  shed:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z"/><path d="M3.5 12.5l8.5 4.5 8.5-4.5"/><path d="M3.5 16.5l8.5 4.5 8.5-4.5"/></svg>',
  poop:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5c3 4 6 7.3 6 11a6 6 0 0 1-12 0c0-3.7 3-7 6-11z"/></svg>',
  note:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4.2L19.5 8.7l-4.2-4.2L4 15.8z"/><path d="M13.5 6.3l4.2 4.2"/></svg>'
};

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rid = () => { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; for (const b of crypto.getRandomValues(new Uint8Array(12))) s += a[b % a.length]; return s; };
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const dnum = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const daysSince = s => s ? Math.round(dnum(today()) - dnum(s)) : null;
const fmtD = s => s ? s.replace(/-/g, '.') : '—';
const fmtShort = s => { if (!s) return ''; const y = s.slice(0, 4); const md = `${+s.slice(5, 7)}.${+s.slice(8, 10)}`; return y === today().slice(0, 4) ? md : `${y.slice(2)}.${md}`; };
const fmtG = n => (Math.round(Number(n) * 10) / 10).toFixed(1);
const fmtWon = n => `${Number(n).toLocaleString('ko-KR')}원`;
const fmtDelta = d => { if (d == null || !isFinite(d)) return ''; const r = Math.round(d * 10) / 10; return `${r > 0 ? '+' : r < 0 ? '−' : '±'}${Math.abs(r).toFixed(1)}`; };
function ageText(h) {
  if (!h) return '';
  const [y1, m1, d1] = h.split('-').map(Number), [y2, m2, d2] = today().split('-').map(Number);
  const months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
  if (months < 1) { const days = daysSince(h); return days >= 0 ? `생후 ${days}일` : ''; }
  const y = Math.floor(months / 12), m = months % 12;
  return y ? (m ? `${y}년 ${m}개월` : `${y}년`) : `${m}개월`;
}
const hatchMode = g => (g && g.hatchMode) || 'exact';
function hatchText(g) {
  const m = hatchMode(g);
  if (m === 'unknown') return '알 수 없음';
  if (!g.hatchDate) return '—';
  return m === 'approx' ? `${g.hatchDate.slice(0, 7).replace('-', '.')}경 (추정)` : fmtD(g.hatchDate);
}
function hatchAge(g) {
  const m = hatchMode(g);
  if (m === 'unknown' || !g.hatchDate) return '';
  const a = ageText(g.hatchDate); return a && m === 'approx' ? `약 ${a}` : a;
}
function hatchLabel(g) {
  const m = hatchMode(g);
  if (m === 'unknown') return '해칭일 모름';
  if (!g.hatchDate) return '';
  return m === 'approx' ? `해칭 ${g.hatchDate.slice(0, 7).replace('-', '.')}경` : `해칭 ${g.hatchDate.replace(/-/g, '.')}`;
}
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const lsDel = k => { try { localStorage.removeItem(k); } catch {} };
// 받침에 따라 조사 고르기: jo('가족', '을', '를') → '가족을', jo('브랜드', '을', '를') → '브랜드를'
const jong = w => { const t = String(w || ''), c = t.charCodeAt(t.length - 1); return c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 : 0; };
const jo = (w, a, b) => w + (jong(w) ? a : b);
const joRo = w => w + (jong(w) && jong(w) !== 8 ? '으로' : '로');

/* ---------- state ---------- */
const S = {
  auth:'loading', user:null, conn:'ok', urls:new Map(),
  farms:[], farm:null, role:null, members:[], invites:[], needFarm:false,
  ledger:[], ledgerErr:'', lp:{mode:'month', y:+today().slice(0, 4), m:+today().slice(5, 7)},
  pub:new Map(), pubLoading:new Set(), join:new Map(), shop:new Map(), shopLoading:new Set(), shopSp:new Map(),
  board:null, boardLoading:false, bView:'items', bSp:'all', bSex:'all', bSort:'new', bOpen:false,
  geckos:new Map(), clutches:new Map(), pairings:new Map(), settings:{...DEF},
  loaded:{g:false, c:false, p:false},
  logs:[], logGid:null, logsLoaded:false,
  listFilter:'active', sexFilter:'all', spFilter:'all', sort:lsGet('gk.sort') || 'code', q:'',
  bulk:false, sel:new Set(), tl:'all', tlMore:false,
  labSel:new Set(), labAll:false, labOut:[], setupDirty:false
};
const G = id => id ? S.geckos.get(id) : null;
const can = need => need === 'admin' ? S.role === 'admin' : need === 'log' ? (S.role === 'admin' || S.role === 'keeper') : true;
// 부르는 이름(가족·브랜드)과 기능 켜기/끄기. 값이 없으면 '가족', 기능은 켜짐
const UNITS = { 가족:'집에서 함께 키워요', 브랜드:'브리더·샵으로 운영해요' };
const unitOf = f => { const u = f && (f.unit || (f.features && f.features.unit)); return UNITS[u] ? u : '가족'; };
const U = () => unitOf(S.farm);
const feat = k => !(S.farm && S.farm.features && S.farm.features[k] === false);
const shopCfg = () => (S.farm && S.farm.features && S.farm.features.shop && typeof S.farm.features.shop === 'object') ? S.farm.features.shop : {};
const shopOn = () => shopCfg().on === true;
/* ---------- 종류(종) ---------- */
// care 'full' = 크레형 관리: 크레스티드 게코처럼 기본 급여 요일 알림·무게 알림·브리딩까지
// care 'basic' = 기본 관리: 기록·사진·혈통·QR은 같고, 급여 알림은 그 개체에 따로 정한 주기가 있을 때만
const CLASS = { reptile:'파충류', amphibian:'양서류' };
const CARE = { full:'크레형 관리', basic:'기본 관리' };
const SPECIES = [
  {k:'crested', n:'크레스티드 게코', sci:'Correlophus ciliatus', c:'reptile', care:'full'},
  {k:'gargoyle', n:'가고일 게코', sci:'Rhacodactylus auriculatus', c:'reptile', care:'full'},
  {k:'leachianus', n:'리키에너스 게코', sci:'Rhacodactylus leachianus', c:'reptile', care:'full'},
  {k:'chahoua', n:'차후아 게코', sci:'Mniarogekko chahoua', c:'reptile', care:'full'},
  {k:'leopard', n:'레오파드 게코', sci:'Eublepharis macularius', c:'reptile', care:'full', foods:['귀뚜라미', '듀비아', '밀웜', '슈퍼웜']},
  {k:'fattail', n:'팻테일 게코', sci:'Hemitheconyx caudicinctus', c:'reptile', care:'full', foods:['귀뚜라미', '듀비아', '밀웜', '슈퍼웜']},
  {k:'ballpython', ic:'snake', n:'볼 파이톤', sci:'Python regius', c:'reptile', care:'basic', foods:['냉동 쥐', '냉동 랫', '생먹이']},
  {k:'cornsnake', ic:'snake', n:'콘 스네이크', sci:'Pantherophis guttatus', c:'reptile', care:'basic', foods:['냉동 쥐', '생먹이']},
  {k:'hognose', ic:'snake', n:'호그노즈 스네이크', sci:'Heterodon nasicus', c:'reptile', care:'basic', foods:['냉동 쥐', '생먹이']},
  {k:'bearded', n:'비어디 드래곤', sci:'Pogona vitticeps', c:'reptile', care:'basic', foods:['귀뚜라미', '듀비아', '채소', '사료']},
  {k:'bluetongue', n:'블루텅 스킨크', sci:'Tiliqua spp.', c:'reptile', care:'basic', foods:['채소·과일', '곤충', '사료']},
  {k:'tortoise', ic:'turtle', n:'육지거북', sci:'Testudinidae', c:'reptile', care:'basic', foods:['채소·풀', '사료', '과일']},
  {k:'pacman', n:'팩맨 (뿔개구리)', sci:'Ceratophrys spp.', c:'amphibian', care:'basic', foods:['귀뚜라미', '듀비아', '사료']},
  {k:'whitestree', n:'화이트 트리 프록', sci:'Litoria caerulea', c:'amphibian', care:'basic', foods:['귀뚜라미', '듀비아']},
  {k:'dartfrog', n:'다트 프록', sci:'Dendrobatidae', c:'amphibian', care:'basic', foods:['초파리', '톡토기']},
  {k:'axolotl', ic:'gecko', n:'아홀로틀 (우파루파)', sci:'Ambystoma mexicanum', c:'amphibian', care:'basic', foods:['냉동 블러드웜', '실지렁이', '사료']}
];
const SPK = Object.fromEntries(SPECIES.map(x => [x.k, x]));
// 설정에 저장한 종류 한 줄({k, care, p, n, c})을 기본 정보와 합침
function spInfo(e) {
  if (!e || !e.k) return null;
  const base = SPK[e.k];
  if (!base && !e.n) return null;
  return {foods:null, sci:'', ...(base || {c:'reptile', care:'basic'}), ...e, n:e.n || base.n, c:CLASS[e.c] ? e.c : (base ? base.c : 'reptile'), care:CARE[e.care] ? e.care : (base ? base.care : 'basic'), p:e.p || ''};
}
function farmSpecies() {
  const raw = S.farm && S.farm.features && Array.isArray(S.farm.features.species) ? S.farm.features.species : [];
  const list = raw.map(spInfo).filter(Boolean);
  return list.length ? list : [spInfo({k:'crested'})];
}
const gSp = g => (g && g.species) || 'crested';
function spOf(g) { const k = gSp(g); return farmSpecies().find(x => x.k === k) || spInfo({k}) || {k, n:'알 수 없는 종류', sci:'', c:'reptile', care:'basic', p:'', foods:null}; }
const fullCare = g => spOf(g).care === 'full';
// 종류가 둘 이상일 때만 화면에 종류를 보여 줌 (크레스티드만 키우면 지금과 같은 화면)
const multiSp = () => farmSpecies().length > 1 || [...S.geckos.values()].some(g => gSp(g) !== farmSpecies()[0].k);
const spFoods = sp => (sp && sp.foods && sp.foods.length) ? sp.foods : ((S.settings.foods && S.settings.foods.length) ? S.settings.foods : DEF.foods);
const MORPH_FOR = { crested:MORPHS };
// 사진이 없을 때 보여 줄 실루엣: 게코(도마뱀류) · 뱀 · 거북 · 개구리
const PH_ICONS = {
  snake:'<svg class="foot" viewBox="0 0 64 64" aria-hidden="true"><path d="M43 19c-9-2-21 1-21 9 0 9 18 6 20 13 2 8-8 12-17 11-6 0-11-3-13-6" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="47.5" cy="19.5" rx="8" ry="6" fill="currentColor"/></svg>',
  turtle:'<svg class="foot" viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><path d="M10 41a21 17 0 0 1 42 0z"/><ellipse cx="56" cy="37" rx="5.5" ry="4.5"/><rect x="15" y="40" width="7" height="9" rx="3"/><rect x="38" y="40" width="7" height="9" rx="3"/><path d="M9 40l-4 3 5 1z"/></g></svg>',
  frog:'<svg class="foot" viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><ellipse cx="32" cy="38" rx="15" ry="11.5"/><circle cx="23" cy="25" r="6"/><circle cx="41" cy="25" r="6"/></g><path d="M19 44l-9 7M45 44l9 7M24 48l-5 9M40 48l5 9" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" fill="none"/></svg>'
};
function phIcon(g) {
  const sp = g && g._pub ? (SPK[g.species] || {c:g._spc || 'reptile'}) : spOf(g);
  const ic = sp.ic || (sp.c === 'amphibian' ? 'frog' : 'gecko');
  return PH_ICONS[ic] || FOOT;
}
const pubVis = g => ({...PUB_DEF, ...((S.farm && S.farm.public_defaults) || {}), ...((g && g.publicFields) || {})});
const gStatus = g => g.status || 'active';
const gTitle = g => g ? (g.name || g.morph || g.code || '이름 없음') : '';
const gLabel = g => g ? [g.code, g.name].filter(Boolean).join(' ') || g.morph || '이름 없음' : '';
const sexGroup = s => (s === 'm' || s === 'pm') ? 'm' : (s === 'f' || s === 'pf') ? 'f' : 'u';
const activeGeckos = () => [...S.geckos.values()].filter(g => gStatus(g) === 'active');
const byCode = (a, b) => (a.code || '￿').localeCompare(b.code || '￿', 'ko', {numeric:true}) || gTitle(a).localeCompare(gTitle(b), 'ko');
const wdOf = ds => ((dnum(ds) % 7) + 11) % 7;
const addDays = (ds, n) => { const t = new Date((dnum(ds) + n) * 86400000); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
function feedSchedule(g) {
  if (g && Array.isArray(g.feedDays) && g.feedDays.length) return {mode:'weekdays', days:g.feedDays, own:true};
  if (g && g.feedEvery > 0) return {mode:'interval', limit:g.feedEvery, own:true};
  if (g && !fullCare(g)) return {mode:'none', own:false};
  if (S.settings.feedMode === 'weekdays' && S.settings.feedDays && S.settings.feedDays.length) return {mode:'weekdays', days:S.settings.feedDays, own:false};
  return {mode:'interval', limit:Number(S.settings.feedAlertDays) || DEF.feedAlertDays, own:false};
}
// state: 'missed' 급여 놓침 · 'today' 오늘 급여일 · 'done' 오늘 급여함 · 'ok'
function feedInfo(g) {
  const f = g.last && g.last.feed, last = f && f.d ? f.d : null;
  const days = last ? daysSince(last) : null, sc = feedSchedule(g), td = today();
  const res = {days, ate:f ? f.ate : null, sched:sc, state:'ok', over:false, next:null, missedSince:null};
  if (sc.mode === 'none') return res;
  if (sc.mode === 'weekdays') {
    const isToday = sc.days.includes(wdOf(td));
    let prev = null;
    for (let i = 1; i <= 7; i++) { const d = addDays(td, -i); if (sc.days.includes(wdOf(d))) { prev = d; break; } }
    for (let i = isToday && last !== td ? 0 : 1; i <= 7; i++) { const d = addDays(td, i); if (sc.days.includes(wdOf(d))) { res.next = d; break; } }
    if (!last || (prev && last < prev)) { res.state = 'missed'; res.missedSince = prev; }
    else if (isToday) res.state = last === td ? 'done' : 'today';
  } else {
    if (!last || days >= sc.limit) res.state = 'missed';
    else if (last === td) res.state = 'done';
  }
  res.over = res.state === 'missed' || res.state === 'today';
  return res;
}
/* ---------- 신고 도우미 ----------
   2025-12-14부터: 야생동물을 주고받으면(무료 포함) 양도·양수 신고 — 한 달 거래분을 다음 달 10일까지, 폐사는 30일 이내
   (2026년 1월 지자체 안내 기준. 기록·알림 도구이며 법령 해석이 아님) */
const REPORT_START = '2025-12-14';
const WIMS_URL = 'https://wims.mcee.go.kr';
const RPT = { in:'양수 신고', out:'양도 신고', dead:'폐사 신고' };
const RPT_WHAT = { in:'입양', out:'분양', dead:'폐사' };
const nextMonth10 = d => { const [y, m] = d.split('-').map(Number); return m === 12 ? `${y + 1}-01-10` : `${y}-${pad(m + 1)}-10`; };
function reportItems() {
  if (!feat('report')) return [];
  const out = [];
  for (const g of S.geckos.values()) {
    if (g.sample || gStatus(g) === 'ref') continue;
    const r = g.reports || {};
    if (g.source !== 'self' && g.acquiredDate && g.acquiredDate >= REPORT_START) out.push({g, t:'in', date:g.acquiredDate, due:nextMonth10(g.acquiredDate), done:r.in || null});
    if (gStatus(g) === 'sold' && g.sale && g.sale.date && g.sale.date >= REPORT_START) out.push({g, t:'out', date:g.sale.date, due:nextMonth10(g.sale.date), done:r.out || null});
    if (gStatus(g) === 'dead' && g.diedAt && g.diedAt >= REPORT_START) out.push({g, t:'dead', date:g.diedAt, due:addDays(g.diedAt, 30), done:r.dead || null});
  }
  return out.sort((a, b) => a.due.localeCompare(b.due) || byCode(a.g, b.g));
}
const dueText = due => { const n = Math.round(dnum(due) - dnum(today())); return n < 0 ? `<span class="pill bad">기한 ${-n}일 지남</span>` : n === 0 ? '<span class="pill bad">오늘까지</span>' : n <= 7 ? `<span class="pill warn">D-${n}</span>` : `<span class="pill">D-${n}</span>`; };
async function markReport(id, t, done) {
  const g = G(id); if (!g || !RPT[t]) return;
  const reports = {...(g.reports || {})};
  if (done) reports[t] = today(); else delete reports[t];
  try { await q(sb.from('geckos').update({reports, updated_at:new Date().toISOString()}).eq('id', id)); toast(done ? `${RPT[t]} 완료로 표시했습니다` : '완료 표시를 취소했습니다'); await refresh(); }
  catch (e) { toast(errMsg(e), 'bad'); }
}

function sorter(k) {
  if (k === 'feed') return (a, b) => ((feedInfo(b).days ?? 1e9) - (feedInfo(a).days ?? 1e9)) || byCode(a, b);
  if (k === 'name') return (a, b) => gTitle(a).localeCompare(gTitle(b), 'ko') || byCode(a, b);
  if (k === 'young') return (a, b) => (b.hatchDate || '').localeCompare(a.hatchDate || '') || byCode(a, b);
  if (k === 'recent') return (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
  return byCode;
}
const matchQ = g => { const q = S.q.trim().toLowerCase(); if (!q) return true; return [g.code, g.name, g.morph, g.notes, multiSp() ? spOf(g).n : ''].some(v => (v || '').toLowerCase().includes(q)); };
function parentRef(g, which) {
  const id = g[which + 'Id'];
  if (id) { const p = G(id); return p ? {kind:'id', g:p} : {kind:'ext', label:'삭제된 개체'}; }
  if (g[which + 'Ext']) return {kind:'ext', label:g[which + 'Ext']};
  return {kind:'none'};
}
function nextCode(spk) {
  const sp = spk ? farmSpecies().find(x => x.k === spk) : null;
  const p = (sp && sp.p) || (S.settings.codePrefix ?? DEF.codePrefix); let max = 0;
  for (const g of S.geckos.values()) {
    if (g.sample || !g.code || !g.code.startsWith(p)) continue;
    const n = parseInt(g.code.slice(p.length), 10); if (n > max) max = n;
  }
  return p + String(max + 1).padStart(3, '0');
}
const appUrl = () => location.origin + location.pathname;
const qrUrl = id => `${appUrl()}#g-${id}`;
const photoUrl = g => (g && g.photo && S.urls.get(g.photo)) || '';
function fallbackUrl(farm) {
  if (!farm) return '';
  if (farm.placeholder === 'google') return farm.placeholder_url || '';
  if (farm.placeholder === 'logo' && farm.logo_path) return S.urls.get(farm.logo_path) || '';
  return '';
}
const fallbackFor = g => g && g._pub ? (g._fb || '') : fallbackUrl(S.farm);
function photoTag(g, cls = 'thumb') {
  const u = photoUrl(g);
  if (u) return `<span class="${cls}"><img data-ph src="${esc(u)}" alt="" loading="lazy"></span>`;
  const fb = fallbackFor(g);
  if (fb) return `<span class="${cls} fb" title="사진 없음"><img data-ph src="${esc(fb)}" alt="" loading="lazy"></span>`;
  return `<span class="${cls} def ${tone(g)}" title="사진 없음">${phIcon(g)}</span>`;
}

/* ---------- server (Supabase) ---------- */
let sb = null;
async function q(p) { const {data, error} = await p; if (error) throw error; return data; }
function errMsg(e) {
  const m = String((e && (e.message || e.error_description || e.details)) || e || '');
  if (/last_admin/.test(m)) return '관리자가 최소 한 명 있어야 합니다. 다른 구성원을 관리자로 바꾼 뒤 다시 시도하세요.';
  if (/invite_used/.test(m)) return '이미 사용된 초대 링크입니다.';
  if (/invite_expired/.test(m)) return '기간이 지난 초대 링크입니다.';
  if (/invite_not_found/.test(m)) return '초대 링크가 올바르지 않습니다.';
  if (/fetch|network|load failed/i.test(m)) return '서버에 연결하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도하세요.';
  if ((e && e.code === '42501') || /row-level security|permission denied/i.test(m)) return '이 작업을 할 권한이 없습니다. 관리자에게 권한을 요청하세요.';
  if ((e && (e.code === '42P01' || e.code === '42883' || e.code === 'PGRST202' || e.code === 'PGRST205')) || /does not exist|schema cache/i.test(m)) return '데이터베이스가 최신이 아닙니다. 안내드린 SQL(schema.sql)을 Supabase에서 다시 실행해 주세요.';
  if (/jwt|session|not authenticated|not_signed_in/i.test(m)) return '로그인이 만료되었습니다. 페이지를 새로 고친 뒤 다시 로그인해 주세요.';
  return '저장하지 못했습니다. 잠시 후 다시 시도하세요.';
}
const nul = v => (v === '' || v === undefined) ? null : v;
const gFromRow = r => ({
  id:r.id, code:r.code || '', name:r.name || '', morph:r.morph || '', sex:r.sex || 'u', sexAt:r.sex_at, hatchDate:r.hatch_date,
  acquiredDate:r.acquired_date, source:r.source, sourceNote:r.source_note || '', sireId:r.sire_id, sireExt:r.sire_ext || '',
  damId:r.dam_id, damExt:r.dam_ext || '', notes:r.notes || '', photo:r.photo_path, status:r.status || 'active', sale:r.sale,
  sample:r.sample, createdAt:Date.parse(r.created_at) || 0, last:{},
  farmId:r.farm_id, acquiredPrice:r.acquired_price == null ? null : Number(r.acquired_price), feedDays:Array.isArray(r.feed_days) && r.feed_days.length ? r.feed_days : null, hatchMode:r.hatch_mode || 'exact', publicOn:r.public_on !== false, publicFields:r.public_fields || null,
  species:r.species || 'crested', feedEvery:r.feed_every > 0 ? Number(r.feed_every) : null,
  listing:r.listing && typeof r.listing === 'object' ? r.listing : null, diedAt:r.died_at || null, reports:r.reports && typeof r.reports === 'object' ? r.reports : {}
});
const logFromRow = r => ({id:r.id, t:r.type, d:r.date, g:r.grams == null ? null : Number(r.grams), food:r.food, ate:r.ate, q:r.quality, n:r.note, _i:Date.parse(r.created_at) || 0});
const logToRow = (gid, e) => ({gecko_id:gid, farm_id:S.farm && S.farm.id, type:e.t, date:e.d, grams:e.t === 'weight' ? e.g : null, food:e.t === 'feed' ? (e.food || null) : null, ate:e.t === 'feed' ? (e.ate || 'all') : null, quality:nul(e.q), note:nul(e.n)});
const cFromRow = r => ({id:r.id, damId:r.dam_id, sireId:r.sire_id, sireNone:r.sire_none, sireExt:r.sire_ext || '', laidAt:r.laid_at, eggs:r.eggs, infertile:r.infertile, incubStart:r.incub_start, expectAt:r.expect_at, incubNote:r.incub_note || '', status:r.status, hatchAt:r.hatch_at, hatchedIds:r.hatched_ids || [], note:r.note || '', sample:r.sample});
const pFromRow = r => ({id:r.id, maleId:r.male_id, femaleId:r.female_id, startAt:r.start_at, endAt:r.end_at, note:r.note || '', sample:r.sample});

async function loadAll() {
  try {
    const mem = await q(sb.from('farm_members').select('farm_id, role, farms(*)').eq('user_id', S.user.id));
    S.farms = (mem || []).filter(m => m.farms).map(m => ({id:m.farm_id, role:m.role, farm:m.farms}))
      .sort((x, y) => (x.farm.created_at || '').localeCompare(y.farm.created_at || ''));
    S.pub.clear();
    if (!S.farms.length) { S.needFarm = true; S.farm = null; S.role = null; S.loaded = {g:true, c:true, p:true}; S.conn = 'ok'; schedule(); return; }
    S.needFarm = false;
    const cur = S.farms.find(f => f.id === lsGet('gk.farm')) || S.farms[0];
    S.farm = cur.farm; S.role = cur.role; lsSet('gk.farm', cur.id);
    const fid = cur.id;
    const [gs, lat, cl, pr, members, invites] = await Promise.all([
      q(sb.from('geckos').select('*').eq('farm_id', fid)),
      q(sb.from('gecko_latest').select('*').eq('farm_id', fid)),
      q(sb.from('clutches').select('*').eq('farm_id', fid)),
      q(sb.from('pairings').select('*').eq('farm_id', fid)),
      q(sb.from('farm_members').select('*').eq('farm_id', fid).order('joined_at')),
      cur.role === 'admin' ? q(sb.from('farm_invites').select('*').eq('farm_id', fid).is('used_at', null).order('created_at', {ascending:false})) : Promise.resolve([])
    ]);
    S.oldCols = gs.length > 0 && !('listing' in gs[0]);
    const geckos = new Map(gs.map(r => [r.id, gFromRow(r)]));
    for (const r of lat) {
      const g = geckos.get(r.gecko_id); if (!g) continue;
      g.last[r.type] = r.type === 'weight' ? {d:r.date, g:Number(r.grams)} : r.type === 'feed' ? {d:r.date, ate:r.ate || 'all', food:r.food || ''} : {d:r.date};
    }
    S.geckos = geckos;
    S.clutches = new Map(cl.map(r => [r.id, cFromRow(r)]));
    S.pairings = new Map(pr.map(r => [r.id, pFromRow(r)]));
    const f = S.farm;
    S.settings = {feedAlertDays:f.feed_alert_days ?? DEF.feedAlertDays, feedMode:f.feed_mode || 'interval', feedDays:Array.isArray(f.feed_days) ? f.feed_days : [], foods:f.foods && f.foods.length ? f.foods : DEF.foods, codePrefix:f.code_prefix ?? DEF.codePrefix};
    S.members = members || []; S.invites = (invites || []).filter(i => Date.parse(i.expires_at) > Date.now());
    S.ledger = []; S.ledgerErr = '';
    if (cur.role === 'admin' && feat('ledger')) {
      try { S.ledger = (await q(sb.from('ledger').select('*').eq('farm_id', fid))).map(r => ({id:r.id, date:r.date, kind:r.kind, category:r.category, amount:Number(r.amount) || 0, gecko_id:r.gecko_id, memo:r.memo || '', src:'manual'})); }
      catch (e) { S.ledgerErr = errMsg(e); }
    }
    S.loaded = {g:true, c:true, p:true}; S.conn = 'ok';
    await refreshUrls();
    onRoute();
  } catch (e) {
    S.conn = 'err'; S.connMsg = errMsg(e); S.loaded = {g:true, c:true, p:true};
  }
  schedule();
}
async function signUrls(paths) {
  paths = [...new Set(paths.filter(Boolean))].filter(p => !S.urls.has(p));
  if (!paths.length || !sb) return;
  try {
    const {data} = await sb.storage.from('photos').createSignedUrls(paths, 60 * 60 * 24 * 7);
    (data || []).forEach(d => { if (d && d.signedUrl) S.urls.set(d.path, d.signedUrl); });
  } catch {}
}
const refreshUrls = () => signUrls([...[...S.geckos.values()].map(g => g.photo), S.farm && S.farm.logo_path]);
async function loadLogs(id) {
  S.logGid = id;
  try {
    const rows = await q(sb.from('logs').select('*').eq('gecko_id', id).order('date', {ascending:false}).order('created_at', {ascending:false}));
    if (S.logGid !== id) return;
    S.logs = rows.map(logFromRow);
  } catch { if (S.logGid === id) S.logs = []; }
  S.logsLoaded = true; schedule();
}
async function refresh() { await loadAll(); if (S.logGid) await loadLogs(S.logGid); }
async function addLogs(gids, entry) { await q(sb.from('logs').insert(gids.map(gid => ({id:rid(), ...logToRow(gid, entry)})))); await refresh(); }
async function editLog(gid, old, neu) { const r = logToRow(gid, neu); delete r.gecko_id; await q(sb.from('logs').update(r).eq('id', old.id)); await refresh(); }
async function deleteLog(gid, old) { await q(sb.from('logs').delete().eq('id', old.id)); await refresh(); }
function downloadBlob(blob, name) {
  if (!blob) { toast('파일을 만들지 못했습니다.', 'bad'); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}
async function backup() {
  toast('백업 파일을 만드는 중…');
  try {
    const fid = S.farm.id;
    const out = {app:APP_NAME, exportedAt:new Date().toISOString(), account:S.user && S.user.email, farm:S.farm};
    out.members = S.members.map(m => ({email:m.email, display_name:m.display_name, role:m.role, joined_at:m.joined_at}));
    for (const t of ['geckos', 'clutches', 'pairings']) out[t] = await q(sb.from(t).select('*').eq('farm_id', fid));
    try { out.ledger = await q(sb.from('ledger').select('*').eq('farm_id', fid)); } catch { out.ledger = []; }
    out.logs = [];
    for (let i = 0; ; i += 1000) { const r = await q(sb.from('logs').select('*').eq('farm_id', fid).order('id').range(i, i + 999)); out.logs.push(...r); if (r.length < 1000) break; }
    downloadBlob(new Blob([JSON.stringify(out, null, 2)], {type:'application/json'}), `크레개체노트_${safeName(S.farm.name)}_백업_${today()}.json`);
    toast('백업 파일을 내려받았습니다');
  } catch (e) { toast(errMsg(e), 'bad'); }
}
async function insertSamples() {
  const s = rid(), d = rid(), b = rid();
  const ago = n => { const t = new Date(); t.setDate(t.getDate() - n); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
  const fid = S.farm.id, base = {sample:true, farm_id:fid, source:'buy', source_note:'예시 입양처'};
  await q(sb.from('geckos').insert([
    {...base, id:s, code:'예시-01', name:'예시 수컷', morph:'할리퀸 핀스트라이프', sex:'m', sex_at:ago(970), hatch_date:ago(1236), acquired_date:ago(1138), sire_ext:'외부 수컷 · 익스트림 할리퀸', dam_ext:'외부 암컷 · 핀스트라이프', notes:'화면 확인용 예시 개체입니다. 설정에서 지울 수 있습니다.'},
    {...base, id:d, code:'예시-02', name:'예시 암컷', morph:'달마시안', sex:'f', sex_at:ago(920), hatch_date:ago(1183), acquired_date:ago(1088)},
    {...base, id:b, code:'예시-03', name:'', morph:'할리퀸', sex:'u', hatch_date:ago(105), source:'self', source_note:'', sire_id:s, dam_id:d}
  ]));
  const L = (gid, t, n, x = {}) => ({id:rid(), gecko_id:gid, farm_id:fid, type:t, date:ago(n), grams:x.g ?? null, food:x.food ?? null, ate:x.ate ?? null, quality:x.q ?? null, note:x.n ?? null});
  const C = '슈퍼푸드(CGD)';
  await q(sb.from('logs').insert([
    L(b, 'note', 105, {n:'예시: 해칭 확인'}), L(b, 'weight', 100, {g:1.8}), L(b, 'weight', 79, {g:2.4}), L(b, 'weight', 58, {g:3.1}), L(b, 'weight', 37, {g:3.9}), L(b, 'weight', 16, {g:4.3}),
    L(b, 'shed', 9, {q:'ok'}), L(b, 'feed', 7, {food:C, ate:'all'}), L(b, 'feed', 4, {food:C, ate:'some'}), L(b, 'weight', 2, {g:4.6}), L(b, 'feed', 1, {food:C, ate:'all'}),
    L(s, 'weight', 209, {g:40.8}), L(s, 'weight', 135, {g:41.9}), L(s, 'weight', 69, {g:42.1}), L(s, 'shed', 17, {q:'ok'}), L(s, 'weight', 8, {g:42.6}),
    L(s, 'feed', 4, {food:'귀뚜라미', ate:'all', n:'예시: 귀뚜라미 4마리'}), L(s, 'poop', 2, {q:'ok'}), L(s, 'feed', 1, {food:C, ate:'all'}),
    L(d, 'weight', 237, {g:45.0}), L(d, 'weight', 159, {g:43.8, n:'예시: 산란 직후'}), L(d, 'weight', 119, {g:45.9}), L(d, 'weight', 64, {g:46.3}),
    L(d, 'shed', 23, {q:'stuck', n:'예시: 발가락 잔여 탈피 제거'}), L(d, 'feed', 10, {food:C, ate:'all'}), L(d, 'weight', 8, {g:47.1}), L(d, 'poop', 7, {q:'ok'}), L(d, 'feed', 6, {food:C, ate:'some'})
  ]));
  await q(sb.from('clutches').insert([
    {id:rid(), sample:true, farm_id:fid, dam_id:d, sire_id:s, laid_at:ago(161), eggs:2, infertile:0, incub_start:ago(161), incub_note:'예시 인큐 조건', status:'hatched', hatch_at:ago(105), hatched_ids:[b]},
    {id:rid(), sample:true, farm_id:fid, dam_id:d, sire_id:s, laid_at:ago(56), eggs:2, infertile:1, incub_start:ago(56), incub_note:'예시 인큐 조건', status:'incubating'},
    {id:rid(), sample:true, farm_id:fid, dam_id:d, sire_none:true, laid_at:ago(260), eggs:2, infertile:2, status:'infertile', note:'예시: 합사 전 단독 산란'}
  ]));
  await q(sb.from('pairings').insert([{id:rid(), sample:true, farm_id:fid, male_id:s, female_id:d, start_at:ago(241)}]));
  await refresh();
}

/* ---------- routing & render ---------- */
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('g-')) return {v:'gecko', id:h.slice(2)};
  if (h.startsWith('pub-')) return {v:'pub', id:h.slice(4)};
  if (h.startsWith('join-')) return {v:'join', code:h.slice(5)};
  if (h.startsWith('map-')) return {v:'map', id:h.slice(4)};
  if (h.startsWith('shop-')) return {v:'shop', id:h.slice(5)};
  if (['breeding', 'sales', 'setup', 'labels', 'map', 'list', 'ledger', 'reports', 'board'].includes(h)) return {v:h};
  return {v:'home'};
}
function go(h) { if (location.hash.slice(1) === h) render(); else location.hash = h; }
let pending = false;
function schedule() { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; render(); }); }
const NEED = {
  'new-gecko':'admin', 'edit-gecko':'admin', 'sale':'admin', 'sale-cancel':'admin', 'new-pair':'admin', 'edit-pair':'admin',
  'new-clutch':'admin', 'edit-clutch':'admin', 'load-samples':'admin', 'clear-samples':'admin', 'backup':'admin',
  'new-ledger':'admin', 'edit-ledger':'admin', 'ledger-csv':'admin', 'listing':'admin', 'board-post':'admin', 'report-done':'admin', 'report-undo':'admin',
  'make-invite':'admin', 'revoke-invite':'admin', 'remove-member':'admin', 'to-ref':'admin',
  'log':'log', 'log-edit':'log', 'bulk':'log', 'bulk-feed':'log', 'feed-over':'log'
};
function setTabs(tab) { document.querySelectorAll('.tabs a').forEach(a => a.setAttribute('aria-current', a.dataset.tab === tab ? 'page' : 'false')); }
function render() {
  const r = route(), view = $('#view'), signedIn = S.auth === 'in';
  document.body.classList.toggle('signed-out', !signedIn || S.needFarm);
  const own = signedIn && S.farm && !S.needFarm;
  const bm = $('.brand b'), bs = $('.brand i');
  if (bm) bm.textContent = own ? S.farm.name : APP_NAME;
  if (bs) bs.textContent = own ? '관리노트' : 'Correlophus ciliatus';
  document.title = own ? `${S.farm.name} 관리노트` : APP_NAME;
  const av = $('.brand-av'), logo = own && S.farm.logo_path ? S.urls.get(S.farm.logo_path) : '';
  if (av && av.dataset.k !== (logo || 'g')) { av.dataset.k = logo || 'g'; av.innerHTML = logo ? `<img src="${esc(logo)}" alt="">` : FOOT; }
  const tb = $('.tabs a[data-tab=breeding]'); if (tb) tb.hidden = !!own && !feat('breeding');
  view.classList.remove('bulking');
  S.chartData = null;
  if (!signedIn) {
    if ((S.auth === 'out') && (r.v === 'gecko' || r.v === 'pub')) { view.innerHTML = vPublic(r.id, false); drawChart(); return; }
    if (S.auth === 'out' && r.v === 'join') { view.innerHTML = vJoin(r.code); return; }
    if (S.auth === 'out' && r.v === 'shop') { view.innerHTML = vShop(r.id); return; }
    if (S.auth === 'out' && r.v === 'board') { view.innerHTML = vBoard(); return; }
    view.innerHTML = vAuth(); return;
  }
  if (r.v === 'join') { view.innerHTML = vJoin(r.code); return; }
  if (r.v === 'shop') { view.innerHTML = vShop(r.id); setTabs('board'); return; }
  if (!S.loaded.g) { view.innerHTML = loadingHTML(); return; }
  if (S.conn === 'err') { view.innerHTML = connErr(); return; }
  if (S.needFarm) { view.innerHTML = vOnboard(); wireOnboard(); return; }
  if (r.v === 'setup' && S.setupDirty && $('#setform')) return;
  let html;
  if (r.v === 'gecko') html = G(r.id) ? vGecko(r.id) : vPublic(r.id, false);
  else if (r.v === 'pub') html = vPublic(r.id, true);
  else if (r.v === 'map') html = vMap(r.id);
  else if (r.v === 'home') html = vHome();
  else if (r.v === 'ledger') html = feat('ledger') ? vLedger() : offNote('가계부', '수입·지출 기록과 개체별 손익을 보는 기능입니다.');
  else if (r.v === 'breeding') html = feat('breeding') ? vBreeding() : offNote('브리딩', '메이팅·산란·인큐베이터·해칭을 기록하는 기능입니다.');
  else if (r.v === 'sales') html = vSales();
  else if (r.v === 'board') html = vBoard();
  else if (r.v === 'reports') html = feat('report') ? vReports() : offNote('신고 도우미', '분양·입양·폐사 때 야생동물 신고 기한을 챙기는 기능입니다.');
  else if (r.v === 'setup') html = vSetup();
  else if (r.v === 'labels') html = vLabels();
  else html = vList();
  view.innerHTML = html;
  view.classList.toggle('bulking', S.bulk && r.v === 'list');
  view.querySelectorAll('[data-act]').forEach(el => { const n = NEED[el.dataset.act]; if (n && !can(n) && !el.classList.contains('rowbtn') && !el.classList.contains('ck')) el.hidden = true; });
  view.querySelectorAll('.qlog,.actions,.acts').forEach(el => { if (el.children.length && ![...el.children].some(c => !c.hidden)) el.hidden = true; });
  setTabs(['gecko', 'labels', 'pub', 'sales'].includes(r.v) ? 'list' : ['ledger', 'reports'].includes(r.v) ? 'home' : r.v);
  if (r.v === 'gecko' || r.v === 'pub') drawChart();
  if (r.v === 'setup') wireSetup();
  if (r.v === 'map') drawMap();
}
const offNote = (name, what) => `<div class="empty off-note"><h2>${jo(name, '이', '가')} 꺼져 있습니다</h2><p>${what} 지금은 쓰지 않도록 꺼 두었고, 그동안의 기록은 그대로 남아 있습니다.</p>
  <div class="actions">${can('admin') ? '<a class="btn primary" href="#setup">설정에서 켜기</a>' : ''}<a class="btn" href="#home">홈으로</a></div>${can('admin') ? '' : '<p class="hint">관리자가 설정에서 켤 수 있습니다.</p>'}</div>`;
const loadingHTML = (t = '불러오는 중…') => `<div class="loading">${t}</div>`;
const connErr = () => `<div class="empty"><h2>데이터를 불러오지 못했습니다</h2><p>${esc(S.connMsg || '')}</p><button class="btn primary" data-act="retry">다시 시도</button></div>`;
const GOOGLE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="currentColor" opacity=".8" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="currentColor" opacity=".6" d="M6.4 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.1z"/><path fill="currentColor" opacity=".7" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z"/></svg>';
function vAuth() {
  if (S.auth === 'loading') return loadingHTML('로그인 상태를 확인하는 중…');
  if (S.auth === 'unconfigured') return `<div class="empty"><h2>서버 연결 정보가 없습니다</h2><p><code>config.js</code> 파일에 Supabase 주소(Project URL)와 공개 키(Publishable key)를 넣어야 합니다.</p></div>`;
  return `<section class="auth">
    <p class="auth-eyebrow">Correlophus ciliatus</p>
    <h1 class="auth-title">${APP_NAME}</h1>
    ${inAppNote()}
    <p class="auth-text">개체 등록, 무게·급여 기록, 혈통과 브리딩을 휴대폰과 PC에서 함께 관리합니다.</p>
    <button class="btn primary auth-btn" data-act="login">${GOOGLE_SVG}Google 계정으로 로그인</button>
    ${S.authErr ? `<p class="err">${esc(S.authErr)}</p>` : ''}
    <p class="hint">등록된 계정만 들어올 수 있습니다. 한 번 로그인하면 이 기기에서는 로그인이 유지됩니다.</p>
  </section>`;
}

/* ---------- public card (QR) ---------- */
const pubKey = (id, preview) => id + (preview ? ':p' : '');
async function fetchPublic(id, preview) {
  const k = pubKey(id, preview);
  if (S.pubLoading.has(k) || !sb) return;
  S.pubLoading.add(k);
  try {
    const d = await q(sb.rpc('public_gecko', {gid:id, preview:!!preview}));
    if (d && !d.private) {
      const paths = [d.photo, d.farm && d.farm.logo];
      const walk = n => { if (n && n.kind === 'id') { paths.push(n.photo); walk(n.sire); walk(n.dam); } };
      walk(d.sire); walk(d.dam);
      await signUrls(paths);
    }
    S.pub.set(k, {data:d});
  } catch (e) { S.pub.set(k, {err:errMsg(e)}); }
  S.pubLoading.delete(k); schedule();
}
function vPublic(id, preview) {
  const k = pubKey(id, preview), c = S.pub.get(k);
  if (!c) { fetchPublic(id, preview); return loadingHTML('개체 정보를 불러오는 중…'); }
  const top = preview ? `<div class="notice"><p><b>공개 카드 미리보기</b> · QR을 찍은 다른 사람에게 이렇게 보입니다.</p><a class="btn small" href="#g-${esc(id)}">개체 화면으로</a></div>` : '';
  const signIn = S.auth === 'in' ? '' : `<button class="btn" data-act="login">내 개체 관리하기 (로그인)</button>`;
  if (c.err) return `${top}<div class="empty"><h2>개체 정보를 불러오지 못했습니다</h2><p>${esc(c.err)}</p><button class="btn" data-act="pub-retry" data-id="${esc(id)}" data-preview="${preview ? 1 : ''}">다시 시도</button></div>`;
  const d = c.data;
  if (!d) return `${top}<div class="empty"><h2>개체를 찾을 수 없습니다</h2><p>삭제되었거나 QR이 가리키는 개체가 바뀌었을 수 있습니다.</p>${signIn}</div>`;
  let other = '';
  if (!preview && S.auth === 'in' && d.member && d.farm_id && (!S.farm || d.farm_id !== S.farm.id)) {
    const du = unitOf(d);
    other = `<div class="notice"><p>내가 속한 다른 ${du} <b>${esc(d.farm_name || '')}</b>의 개체입니다. 그 ${joRo(du)} 전환하면 관리 화면이 열립니다.</p><button class="btn small primary" data-act="switch-farm" data-farm="${esc(d.farm_id)}" data-go="g-${esc(id)}">그 ${joRo(du)} 전환</button></div>`;
  }
  if (d.private) return `${top}${other}<div class="empty"><h2>공개되지 않은 개체입니다</h2><p>이 개체는 공개 카드가 꺼져 있어 ${unitOf(d)} 구성원만 볼 수 있습니다.</p>${signIn}</div>`;
  const vis = d.vis || {}, farm = d.farm || null;
  const fb = farm ? (farm.placeholder === 'google' ? (farm.placeholder_url || '') : farm.placeholder === 'logo' && farm.logo ? (S.urls.get(farm.logo) || '') : '') : '';
  const pg = {id:d.id, code:d.code || '', name:d.name || '', morph:d.morph || '', sex:d.sex || 'u', photo:d.photo, hatchDate:d.hatch_date, hatchMode:d.hatch_mode, species:d.species, _spc:d.species_class, _pub:true, _fb:fb};
  const sx = SEX[pg.sex] || SEX.u;
  const real = photoUrl(pg);
  const photo = real ? `<img class="hero-photo" data-ph src="${esc(real)}" alt="${esc(gTitle(pg))} 사진">`
    : `<div class="hero-photo ph-empty ${tone(pg)}${fb ? ' has-fb' : ''}">${fb ? `<img data-ph src="${esc(fb)}" alt="" referrerpolicy="no-referrer">` : phIcon(pg)}<span class="ph-tag">사진 없음</span></div>`;
  document.title = `${[pg.code, pg.name].filter(Boolean).join(' ') || gTitle(pg)} · 공개 카드`;
  let h = `${top}${other}<article class="pcard">`;
  if (farm) {
    const logo = farm.logo && S.urls.get(farm.logo);
    h += `<header class="pc-farm">${logo ? `<img data-ph src="${esc(logo)}" alt="">` : `<span class="pc-ini">${esc((farm.name || '?').slice(0, 1))}</span>`}<span><span class="pc-k">${unitOf(d) === '브랜드' ? '브리더' : unitOf(d)}</span><b>${esc(farm.name || '')}</b></span></header>`;
  }
  const spx = d.species ? (SPK[d.species] || (d.species_name ? {n:d.species_name, sci:''} : null)) : null;
  h += `<section class="dhead"><div class="ph">${photo}</div><div class="dinfo">
      ${spx ? `<div class="dsp">${esc(spx.n)}${spx.sci ? ` <i>${esc(spx.sci)}</i>` : ''}</div>` : ''}
      <div class="dcode"><span>${esc(pg.code || '번호 없음')}</span>${d.sale ? `<span class="pill">분양 완료</span>` : ''}</div>
      <h1 class="dname">${esc(gTitle(pg))}</h1>
      <div class="dsub"><span class="sex ${sx.c}">${sx.s} ${sx.t}</span> · ${esc(pg.morph || '모프 미기록')}</div>
      ${vis.hatch ? `<dl class="facts"><dt>해칭일</dt><dd>${esc(hatchText(pg))} <span class="muted">${esc(hatchAge(pg))}</span></dd></dl>` : ''}
    </div></section>`;
  if (d.listing) h += listingPanel(d.listing, d.shop);
  if (vis.lineage) {
    const pref = n => !n ? {kind:'none'} : n.kind === 'id' ? {kind:'id', g:{id:n.id, code:n.code || '', name:n.name || '', morph:n.morph || '', sex:n.sex || 'u', photo:n.photo, _pub:true, _fb:fb}}
      : n.kind === 'private' ? {kind:'ext', label:'비공개 개체'} : n.kind === 'ext' ? {kind:'ext', label:n.label} : {kind:'none'};
    const s = d.sire || {}, m = d.dam || {};
    h += `<section class="panel"><div class="ph3"><h3>혈통</h3></div>${pedTree(pg, pref(d.sire), pref(d.dam), pref(s.sire), pref(s.dam), pref(m.sire), pref(m.dam))}<p class="hint">개체를 누르면 그 개체의 공개 카드로 이동합니다. 점선은 목록에 없거나 비공개인 개체입니다.</p></section>`;
  }
  if (vis.weight && Array.isArray(d.weights)) {
    const ws = d.weights.map((w, i) => ({d:w.d, g:Number(w.g), _i:i}));
    S.chartData = ws;
    const lw = ws[ws.length - 1];
    h += `<section class="panel"><div class="ph3"><h3>무게 변화</h3></div>${!ws.length ? '<p class="muted">무게 기록이 없습니다.</p>' : `<div class="wsum"><span class="big">${fmtG(lw.g)}<small>g</small></span><span class="muted">${fmtD(lw.d)}</span></div>${ws.length > 1 ? '<div class="wchart" id="wchart"></div>' : ''}`}</section>`;
  }
  if (vis.care && Array.isArray(d.care)) {
    h += `<section class="panel"><div class="ph3"><h3>최근 관리 기록</h3></div>${d.care.length ? `<ul class="rows">${d.care.map(e => `<li class="tl-row nobtn"><span class="td">${fmtD(e.d)}</span><span class="tt t-${esc(e.t)}">${LOGT[e.t] || ''}</span><span class="tx">${logLine(e)}</span></li>`).join('')}</ul>` : '<p class="muted">기록이 없습니다.</p>'}</section>`;
  }
  if (d.sale) {
    const sl = d.sale;
    h += `<section class="panel"><div class="ph3"><h3>분양 정보</h3></div><dl class="facts">${sl.date ? `<dt>분양일</dt><dd>${fmtD(sl.date)}</dd>` : ''}${sl.price ? `<dt>분양가</dt><dd>${fmtWon(sl.price)}</dd>` : ''}${sl.to ? `<dt>분양받은 분</dt><dd>${esc(sl.to)}</dd>` : ''}</dl></section>`;
  }
  if (vis.notes && d.notes) h += `<section class="panel"><div class="ph3"><h3>메모</h3></div><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(d.notes)}</p></section>`;
  h += `<footer class="pc-foot"><span>${APP_NAME} 공개 카드${farm ? ` · ${esc(farm.name || '')}에서 공개한 정보입니다` : ''}</span>${signIn}</footer></article>`;
  return h;
}

/* ---------- 분양 페이지 (공개) ---------- */
const LSTATE = { open:'분양 중', reserved:'예약 중' };
const priceText = p => (p != null && p !== '' && +p > 0) ? fmtWon(p) : '가격 문의';
const safeUrl = u => { u = String(u || '').trim(); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.hostname.includes('.') ? x.href : ''; } catch { return ''; } };
const instaUrl = v => { v = String(v || '').trim(); if (!v) return ''; const m = v.match(/instagram\.com\/([A-Za-z0-9._]+)/i); const h = (m ? m[1] : v.replace(/^@/, '')).replace(/[^A-Za-z0-9._]/g, ''); return h ? `https://www.instagram.com/${h}/` : ''; };
const telNum = v => String(v || '').replace(/[^0-9+]/g, '');
const shopUrl = fid => `${appUrl()}#shop-${fid}`;
function contactBtns(c) {
  if (!c) return '';
  const out = [], k = safeUrl(c.kakao), i = instaUrl(c.insta), t = telNum(c.phone), l = safeUrl(c.link);
  if (k) out.push(`<a class="btn primary" href="${esc(k)}" target="_blank" rel="noopener">카카오톡 문의</a>`);
  if (i) out.push(`<a class="btn" href="${esc(i)}" target="_blank" rel="noopener">인스타그램</a>`);
  if (t) out.push(`<a class="btn" href="tel:${esc(t)}">전화</a><a class="btn" href="sms:${esc(t)}">문자</a>`);
  if (l) out.push(`<a class="btn" href="${esc(l)}" target="_blank" rel="noopener">스토어·홈페이지</a>`);
  return out.length ? `<div class="actions contact">${out.join('')}</div>` : '';
}
const LAW_NOTE = '파충류·양서류를 주고받으면(무료 분양 포함) 분양하는 분과 받는 분 모두 야생동물 양도·양수 신고를 해야 합니다.';
function listingPanel(l, shop) {
  return `<section class="panel listing pop"><div class="ph3"><h3>${LSTATE[l.state] || '분양 중'}</h3><span class="price">${esc(priceText(l.price))}</span></div>
    ${l.note ? `<p class="l-note">${esc(l.note)}</p>` : ''}
    ${shop ? contactBtns(shop) : ''}
    ${shop ? `<a class="more" href="#shop-${esc(shop.id)}">${esc(shop.name || '')}의 분양 개체 모두 보기 →</a>` : ''}
    <a class="more" href="#board">분양 게시판에서 다른 개체 보기 →</a>
    <p class="hint">거래는 분양하는 분과 직접 진행합니다. ${LAW_NOTE}</p></section>`;
}
// 분양 카드 한 장 (분양 페이지·분양 게시판 공용). brand가 있으면 아래에 브랜드 줄을 붙임
function saleCard(x, sp, showSp, brand) {
  const sx = SEX[x.sex || 'u'];
  const pg = {id:x.id, code:x.code || '', name:x.name || '', morph:x.morph || '', photo:x.photo, species:x.species, _spc:sp.c, _pub:true, _fb:''};
  const age = x.hatch_date ? hatchAge({hatchDate:x.hatch_date, hatchMode:x.hatch_mode}) : '';
  const bl = brand && brand.logo ? S.urls.get(brand.logo) : '';
  return `<div class="scard"><a class="sc-main" href="#g-${esc(x.id)}">${photoTag(pg, 'sc-img')}<span class="sc-b">
      ${showSp || sp.k !== 'crested' || (brand && brand.mine) ? `<span class="sc-sp"><span>${showSp || sp.k !== 'crested' ? esc(sp.n) : ''}</span>${brand && brand.mine ? '<span class="pill sun">내 분양</span>' : ''}</span>` : ''}
      <span class="sc-t">${x.code ? `<span class="mono">${esc(x.code)}</span> ` : ''}${esc(x.name || x.morph || '')}</span>
      <span class="sc-m"><span class="sex ${sx.c}">${sx.s} ${sx.t}</span>${x.morph && x.name ? ` · ${esc(x.morph)}` : ''}${age ? ` · ${esc(age)}` : ''}</span>
      <span class="sc-p"><b>${esc(priceText(x.price))}</b>${x.state === 'reserved' ? '<span class="pill warn">예약 중</span>' : ''}</span>
    </span></a>${brand ? `<a class="sc-brand" href="#shop-${esc(brand.id)}">${bl ? `<img src="${esc(bl)}" alt="">` : `<span class="ini">${esc((brand.name || '?').slice(0, 1))}</span>`}<span>${esc(brand.name || '')}</span>${CHEV}</a>` : ''}</div>`;
}
async function fetchShop(fid) {
  if (S.shopLoading.has(fid) || !sb) return;
  S.shopLoading.add(fid);
  try {
    const d = await q(sb.rpc('public_shop', {fid}));
    if (d && !d.closed) await signUrls([d.logo, ...(d.items || []).map(x => x.photo)]);
    S.shop.set(fid, {data:d});
  } catch (e) { S.shop.set(fid, {err:errMsg(e)}); }
  S.shopLoading.delete(fid); schedule();
}
function vShop(fid) {
  if (!sb) return loadingHTML();
  const c = S.shop.get(fid);
  if (!c) { fetchShop(fid); return loadingHTML('분양 페이지를 불러오는 중…'); }
  if (c.err) return `<div class="empty"><h2>분양 페이지를 불러오지 못했습니다</h2><p>${esc(c.err)}</p><button class="btn" data-act="shop-retry" data-id="${esc(fid)}">다시 시도</button></div>`;
  const d = c.data;
  if (!d) return `<div class="empty"><h2>분양 페이지를 찾을 수 없습니다</h2><p>주소가 바뀌었거나 없어진 페이지입니다.</p></div>`;
  if (d.closed) return `<div class="empty"><h2>${esc(d.name || '')} 분양 페이지가 닫혀 있습니다</h2><p>지금은 분양 페이지를 쓰지 않고 있습니다.</p></div>`;
  document.title = `${d.name} 분양`;
  const spl = (d.species || []).map(spInfo).filter(Boolean);
  const spOfK = k => spl.find(x => x.k === k) || SPK[k] || {k, n:'기타', c:'reptile'};
  const items = d.items || [];
  const kinds = [...new Set(items.map(x => x.species || 'crested'))];
  let sel = S.shopSp.get(fid) || 'all'; if (sel !== 'all' && !kinds.includes(sel)) sel = 'all';
  const shown = items.filter(x => sel === 'all' || (x.species || 'crested') === sel);
  const logo = d.logo && S.urls.get(d.logo);
  const mine = S.auth === 'in' && S.farms.some(x => x.id === d.id);
  let h = mine ? `<div class="notice"><p><b>내 분양 페이지</b> · 링크를 받은 분에게 이렇게 보입니다. 개체 화면의 <b>분양 등록</b>으로 개체를 올리거나 내릴 수 있습니다.</p><a class="btn small" href="#setup">설정으로</a></div>` : '';
  h += `<article class="shop"><a class="back" href="#board">← 분양 게시판</a><header class="panel pop shop-h">
      <div class="shop-id">${logo ? `<img class="shop-logo" data-ph src="${esc(logo)}" alt="">` : `<span class="shop-logo ini">${esc((d.name || '?').slice(0, 1))}</span>`}
        <div><span class="pc-k">${d.unit === '브랜드' ? '브리더' : esc(d.unit || '')} · 분양</span><h1>${esc(d.name || '')}</h1></div></div>
      ${d.intro ? `<p class="shop-intro">${esc(d.intro)}</p>` : ''}
      ${contactBtns(d.contact)}
    </header>`;
  if (kinds.length > 1) h += `<div class="seg shop-seg">${[['all', '전체', items.length], ...kinds.map(k => [k, spOfK(k).n, items.filter(x => (x.species || 'crested') === k).length])].map(([k, t, n]) => `<button data-act="shop-sp" data-id="${esc(fid)}" data-v="${esc(k)}" aria-pressed="${sel === k}">${esc(t)}<span class="n">${n}</span></button>`).join('')}</div>`;
  if (!shown.length) h += `<div class="empty"><h2>지금 분양 중인 개체가 없습니다</h2><p>새 개체가 올라오면 이곳에 보입니다.</p></div>`;
  else h += `<div class="shop-grid">${shown.map(x => saleCard(x, spOfK(x.species || 'crested'), kinds.length > 1)).join('')}</div>`;
  h += `<footer class="pc-foot"><span>${APP_NAME}로 만든 분양 페이지 · 개체를 누르면 혈통 등 자세한 정보를 볼 수 있습니다.</span><span>거래는 분양하는 분과 직접 진행합니다. ${LAW_NOTE}</span></footer></article>`;
  return h;
}

/* ---------- 분양 게시판 ---------- */
// 분양 페이지를 켜고 '분양 게시판에 함께 올리기'를 고른 가족·브랜드의 분양 개체를 모아 보여 줌 (로그인 없이도 볼 수 있음)
async function fetchBoard() {
  if (S.boardLoading || !sb) return;
  S.boardLoading = true;
  try {
    const d = await q(sb.rpc('public_board', {lim:300}));
    const v = d || {brands:[], items:[]};
    await signUrls([...(v.items || []).flatMap(x => [x.photo, x.flogo]), ...(v.brands || []).map(b => b.logo)]);
    S.board = {data:v, at:Date.now()};
  } catch (e) { S.board = {err:errMsg(e), at:Date.now()}; }
  S.boardLoading = false; schedule();
}
function vBoard() {
  if (!sb) return loadingHTML();
  const c = S.board;
  if (!c || Date.now() - c.at > 60000) fetchBoard();
  if (!c) return loadingHTML('분양 게시판을 불러오는 중…');
  if (c.err) return `<div class="empty"><h2>분양 게시판을 불러오지 못했습니다</h2><p>${esc(c.err)}</p><button class="btn" data-act="board-retry">다시 시도</button></div>`;
  document.title = '분양 게시판';
  const d = c.data, items = d.items || [], brands = d.brands || [];
  const signed = S.auth === 'in' && S.farm && !S.needFarm, myId = signed ? S.farm.id : '';
  const spOfX = x => SPK[x.species || 'crested'] || {k:x.species, n:x.species_name || '기타', c:x.species_class || 'reptile'};
  const kinds = [...new Set(items.map(x => x.species || 'crested'))];
  if (S.bSp !== 'all' && !kinds.includes(S.bSp)) S.bSp = 'all';
  let h = `<div class="vhead"><div><h1 class="vtitle">분양 게시판</h1><p class="vsub">관리노트를 쓰는 가족·브랜드가 올린 분양 개체를 모아 봅니다.</p></div>
    ${signed ? '<div class="actions"><button class="btn primary" data-act="board-post">+ 분양 글 올리기</button></div>' : ''}</div>`;
  if (S.auth === 'out') h += `<div class="notice"><p>${APP_NAME}로 내 개체를 관리하고 분양 글도 올리려면 로그인하세요.</p><a class="btn small" href="#home">로그인</a></div>`;
  if (signed && can('admin')) {
    const sc = shopCfg();
    if (!sc.on) h += `<div class="notice"><p>내 개체를 이곳에 올리려면 먼저 <b>설정 → 분양 페이지</b>를 켜고 연락처를 적어 주세요.</p><a class="btn small" href="#setup">설정으로</a></div>`;
    else if (!sc.board) h += `<div class="notice"><p>내 분양 페이지는 링크로만 볼 수 있고 게시판에는 보이지 않습니다. <b>설정 → 분양 페이지</b>에서 ‘분양 게시판에 함께 올리기’를 켜면 함께 보입니다.</p><a class="btn small" href="#setup">설정으로</a></div>`;
  }
  h += `<div class="seg bview">${[['items', '개체 모아보기', items.length], ['brands', '브랜드별', brands.length]].map(([k, t, n]) => `<button data-act="board-view" data-v="${k}" aria-pressed="${S.bView === k}">${t}<span class="n">${n}</span></button>`).join('')}</div>`;
  if (S.bView === 'brands') {
    if (!brands.length) h += `<div class="empty"><h2>아직 참여한 곳이 없습니다</h2><p>분양 페이지를 켜고 게시판에 함께 올리기를 고른 가족·브랜드가 이곳에 보입니다.</p></div>`;
    else h += `<div class="bgrid">${brands.map(b => { const lg = b.logo ? S.urls.get(b.logo) : '';
      return `<a class="bcard" href="#shop-${esc(b.id)}">${lg ? `<img class="shop-logo" src="${esc(lg)}" alt="">` : `<span class="shop-logo ini">${esc((b.name || '?').slice(0, 1))}</span>`}
        <span class="bc-b"><span class="pc-k">${b.unit === '브랜드' ? '브리더' : esc(b.unit || '')}${b.id === myId ? ' · 내 분양 페이지' : ''}</span><b>${esc(b.name || '')}</b>${b.intro ? `<small>${esc(b.intro)}</small>` : ''}</span>
        <span class="pill${b.count ? ' sun' : ''}">${b.count ? `분양 중 ${b.count}` : '지금 분양 없음'}</span></a>`; }).join('')}</div>`;
  } else {
    let shown = items.filter(x => (S.bSp === 'all' || (x.species || 'crested') === S.bSp) && (S.bSex === 'all' || sexGroup(x.sex || 'u') === S.bSex) && (!S.bOpen || x.state !== 'reserved'));
    const pv = x => (x.price != null && +x.price > 0) ? +x.price : null;
    if (S.bSort === 'low') shown = [...shown].sort((a, b) => (pv(a) ?? Infinity) - (pv(b) ?? Infinity));
    if (S.bSort === 'high') shown = [...shown].sort((a, b) => (pv(b) ?? -1) - (pv(a) ?? -1));
    h += `<div class="toolbar btools">
      ${kinds.length > 1 ? `<select data-chg="b-sp" aria-label="종류"><option value="all">모든 종류</option>${kinds.map(k => `<option value="${esc(k)}"${S.bSp === k ? ' selected' : ''}>${esc(spOfX(items.find(x => (x.species || 'crested') === k)).n)}</option>`).join('')}</select>` : ''}
      <select data-chg="b-sex" aria-label="성별"><option value="all">모든 성별</option>${[['m', '수컷'], ['f', '암컷'], ['u', '미확인']].map(([k, t]) => `<option value="${k}"${S.bSex === k ? ' selected' : ''}>${t}</option>`).join('')}</select>
      <select data-chg="b-sort" aria-label="정렬">${[['new', '최근 올린 순'], ['low', '가격 낮은 순'], ['high', '가격 높은 순']].map(([k, t]) => `<option value="${k}"${S.bSort === k ? ' selected' : ''}>${t}</option>`).join('')}</select>
      <label class="check inline"><input type="checkbox" data-chg="b-open"${S.bOpen ? ' checked' : ''}><span>예약 중 빼기</span></label></div>`;
    if (!items.length) h += `<div class="empty"><h2>아직 올라온 분양 개체가 없습니다</h2><p>개체 화면의 ‘분양 등록’으로 올린 개체가 이곳에 모입니다.</p></div>`;
    else if (!shown.length) h += `<div class="empty"><h2>조건에 맞는 개체가 없습니다</h2><p>종류·성별 조건을 바꿔 보세요.</p></div>`;
    else h += `<div class="shop-grid">${shown.map(x => saleCard(x, spOfX(x), kinds.length > 1, {id:x.fid, name:x.fname, logo:x.flogo, mine:x.fid === myId})).join('')}</div>`;
  }
  h += `<footer class="pc-foot board-foot"><span>${APP_NAME}는 분양 글을 모아 보여 주는 곳이며 거래의 당사자가 아닙니다. 가격·건강 상태·거래 조건은 각 가족·브랜드에 직접 확인해 주세요.</span><span>${LAW_NOTE}</span></footer>`;
  return h;
}
function openBoardPost() {
  if (!can('admin')) return;
  if (!shopOn()) { go('setup'); toast('먼저 설정 → 분양 페이지를 켜 주세요'); return; }
  const cands = [...S.geckos.values()].filter(g => gStatus(g) === 'active' && !g.sample).sort(byCode);
  const sh = openSheet(`<div class="form">${sheetHead('분양 글 올리기')}<p class="hint">분양할 개체를 고르면 분양가와 소개 글을 적는 화면으로 넘어갑니다.${shopCfg().board ? '' : ' 지금은 분양 게시판에 함께 올리기가 꺼져 있어 내 분양 페이지에만 보입니다.'}</p>
    ${cands.length ? `<ul class="rows pick-list">${cands.map(g => `<li><button type="button" class="pick" data-pick="${esc(g.id)}">${photoTag(g, 'thumb')}<span class="pk-b"><b>${esc(gLabel(g))}</b><small>${[multiSp() ? spOf(g).n : '', g.morph, SEX[g.sex || 'u'].t].filter(Boolean).map(esc).join(' · ')}</small></span>${g.listing ? `<span class="pill sun">${LSTATE[g.listing.state] || '분양 중'}</span>` : !g.publicOn ? '<span class="pill">공개 카드 꺼짐</span>' : ''}</button></li>`).join('')}</ul>` : '<p class="muted">보유 중인 개체가 없습니다.</p>'}
    <div class="sh-foot"><span class="sp"></span><button type="button" class="btn" data-act="close-sheet">닫기</button></div></div>`, {label:'분양 글 올리기'});
  sh.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.pick; closeSheet(); openListingForm(id); }));
}

/* ---------- invite & first farm ---------- */
async function fetchJoin(code) {
  if (S.join.has(code) || !sb) return;
  S.join.set(code, {loading:true});
  try { S.join.set(code, {data:await q(sb.rpc('invite_info', {c:code}))}); }
  catch (e) { S.join.set(code, {err:errMsg(e)}); }
  schedule();
}
function vJoin(code) {
  const c = S.join.get(code);
  if (!c || c.loading) { fetchJoin(code); return loadingHTML('초대장을 확인하는 중…'); }
  if (c.err) return `<div class="empty"><h2>초대장을 확인하지 못했습니다</h2><p>${esc(c.err)}</p></div>`;
  const i = c.data || {};
  if (!i.ok) {
    const why = {not_found:'초대 링크가 올바르지 않습니다.', used:'이미 사용된 초대장입니다. 보낸 분께 새 초대장을 요청하세요.', expired:'기간(7일)이 지난 초대장입니다. 보낸 분께 새 초대장을 요청하세요.'}[i.reason] || '이 초대장은 쓸 수 없습니다.';
    return `<section class="auth invite-card"><p class="auth-eyebrow">초대장</p><h1 class="auth-title">${esc(i.farm || '초대장')}</h1><p class="auth-text">${why}</p>${S.auth === 'in' ? '<a class="btn" href="#list">개체 목록으로</a>' : ''}</section>`;
  }
  document.title = `${i.farm} 초대장`;
  const head = `<p class="auth-eyebrow">초대장</p><h1 class="auth-title">${esc(i.farm)}</h1>
    <p class="ic-from">${i.from ? `<b>${esc(i.from)}</b>님이 보낸 초대장입니다.` : `${unitOf(i)} 관리노트 초대장입니다.`}</p>
    <dl class="facts ic-facts"><dt>권한</dt><dd><b>${ROLE[i.role]}</b> · ${ROLE_HINT[i.role]}</dd>${i.expires ? `<dt>유효기간</dt><dd>${fmtD(String(i.expires).slice(0, 10))}까지</dd>` : ''}</dl>`;
  const foot = `<p class="ic-app">${APP_NAME} · 크레스티드 게코·파충류·양서류 개체 관리</p>`;
  if (S.auth !== 'in') {
    return `<section class="auth invite-card">${head}${inAppNote()}
      <button class="btn primary auth-btn" data-act="login">${GOOGLE_SVG}Google 계정으로 로그인하고 참여</button>
      <p class="hint">구글 로그인이 안 되면 초대한 분께 내 구글 계정을 사용자로 등록해 달라고 알려 주세요.</p>${foot}</section>`;
  }
  if (i.member) return `<section class="auth invite-card">${head}<p class="auth-text">이미 이 ${unitOf(i)}의 구성원입니다. 설정에서 ${jo(unitOf(i), '을', '를')} 전환할 수 있습니다.</p><a class="btn" href="#setup">설정으로</a>${foot}</section>`;
  return `<section class="auth invite-card">${head}
    <button class="btn primary auth-btn" data-act="accept-invite" data-code="${esc(code)}">초대 수락하고 참여하기</button>
    ${S.needFarm ? '' : '<a class="btn" href="#list">나중에</a>'}${foot}</section>`;
}
function inAppNote() {
  if (!IN_APP) return '';
  return IN_KAKAO
    ? `<div class="notice inapp"><p>카카오톡 안에서는 구글 로그인이 막혀 있습니다. 로그인 버튼을 누르면 휴대폰의 기본 브라우저로 열어 드립니다.</p></div>`
    : `<div class="notice inapp"><p>이 앱 안의 브라우저에서는 구글 로그인이 막혀 있습니다. 화면 위나 아래의 메뉴(⋮ 또는 …)에서 <b>‘다른 브라우저로 열기’</b>를 눌러 Chrome이나 Safari에서 열어 주세요.</p><button class="btn small" data-act="copy-here">주소 복사</button></div>`;
}
const NAME_EX = { 가족:'예: 우리집 게코', 브랜드:'예: OO 크레스티드' };
const unitPick = (name, cur) => `<div class="seg radio unitpick" role="radiogroup">${Object.entries(UNITS).map(([k, t]) => `<label><input type="radio" name="${name}" value="${k}"${cur === k ? ' checked' : ''}><span>${k}<small>${t}</small></span></label>`).join('')}</div>`;
// 부르는 이름을 바꾸면 이름 칸의 제목과 예시도 함께 바꿈
function wireUnit(root, name, labelSel, inputSel) {
  root.querySelectorAll(`input[name=${name}]`).forEach(r => r.addEventListener('change', () => {
    const u = (root.querySelector(`input[name=${name}]:checked`) || {}).value || '가족';
    const l = root.querySelector(labelSel), i = root.querySelector(inputSel);
    if (l) l.textContent = `${u} 이름`; if (i) i.placeholder = NAME_EX[u];
  }));
}
function vOnboard() {
  return `<section class="auth"><p class="auth-eyebrow">시작하기</p><h1 class="auth-title">관리노트 만들기</h1>
    <p class="auth-text">개체는 가족이나 브랜드 단위로 함께 관리합니다. 어떻게 부를지 고르고 이름을 정해 주세요. 나중에 설정에서 바꿀 수 있습니다.</p>
    <form id="onboard" class="form" style="width:100%" novalidate>
      <div class="field"><span class="lbl">어떻게 부를까요?</span>${unitPick('ob-unit', '가족')}</div>
      <div class="field"><label for="ob-name" id="ob-name-l">가족 이름</label><input id="ob-name" placeholder="${NAME_EX['가족']}" autocomplete="off"></div>
      <p class="err" hidden></p>
      <button class="btn primary auth-btn" type="submit" id="ob-save">만들기</button>
    </form>
    <p class="hint">브리딩·가계부·혈관리용 기능과 크레스티드 게코 외 다른 파충류·양서류 종류는 만든 뒤 설정에서 정할 수 있습니다.</p>
    <p class="hint">다른 가족이나 브랜드에 초대받았다면 받은 초대 링크를 다시 열어 주세요.</p></section>`;
}
function wireOnboard() {
  const f = $('#onboard'); if (!f || f.dataset.w) return; f.dataset.w = 1;
  wireUnit(f, 'ob-unit', '#ob-name-l', '#ob-name');
  f.addEventListener('submit', async ev => {
    ev.preventDefault();
    const btn = $('#ob-save'); busy(btn, true, '만드는 중…');
    try { await createFarm($('#ob-name').value.trim(), (f.querySelector('input[name=ob-unit]:checked') || {}).value); }
    catch (e) { busy(btn, false); const er = f.querySelector('.err'); er.textContent = errMsg(e); er.hidden = false; }
  });
}
async function createFarm(name, unit) {
  unit = UNITS[unit] ? unit : '가족';
  let fid;
  try { fid = await q(sb.rpc('create_farm', {fname:name || '우리 게코', funit:unit})); }
  catch (e) {
    // 데이터베이스를 아직 2.4판으로 올리지 않았을 때(부르는 이름 없이) 만들기
    if (!(e && (e.code === 'PGRST202' || /schema cache|funit/i.test(e.message || '')))) throw e;
    fid = await q(sb.rpc('create_farm', {fname:name || '우리 게코'}));
  }
  lsSet('gk.farm', fid); resetFarmView(); await loadAll(); go('home'); toast(`${jo(unit, '을', '를')} 만들었습니다`);
}
function resetFarmView() {
  S.loaded = {g:false, c:false, p:false}; S.logGid = null; S.logs = []; S.bulk = false; S.sel.clear();
  S.labSel.clear(); S.labInit = false; S.labOut = []; MM.viewKey = ''; MM.collapsed.clear(); S.setupDirty = false;
}
async function switchFarm(fid, goTo) {
  lsSet('gk.farm', fid); resetFarmView(); render(); await loadAll(); if (goTo) go(goTo); else render();
}

/* ---------- home ---------- */
const CHEV = '<svg class="go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
const SVG_FEED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 8.5c0-2 2-2 2-4.5M14 8.5c0-2 2-2 2-4.5"/></svg>';
const SVG_SCALE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 20h14l-1.6-10.5H6.6z"/><circle cx="12" cy="6" r="2.2"/></svg>';
const SVG_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const daysUntil = s => s ? -daysSince(s) : null;
function nextFarmFeedDay() {
  const d = S.settings.feedDays;
  if (S.settings.feedMode !== 'weekdays' || !d || !d.length) return null;
  for (let i = 1; i <= 7; i++) { const x = addDays(today(), i); if (d.includes(wdOf(x))) return x; }
  return null;
}
function incInfo(c) {
  const start = c.incubStart || c.laidAt, el = start ? daysSince(start) : null, left = c.expectAt ? daysUntil(c.expectAt) : null;
  let pct = null;
  if (start && c.expectAt) { const tot = dnum(c.expectAt) - dnum(start); pct = tot > 0 ? Math.max(0, Math.min(100, Math.round(el / tot * 100))) : 100; }
  return {el, left, pct, fertile:Math.max(0, (+c.eggs || 0) - (+c.infertile || 0))};
}
const namesOf = (list, n = 3) => list.slice(0, n).map(g => g.name || g.code || gTitle(g)).join(', ') + (list.length > n ? ` 외 ${list.length - n}마리` : '');
function incCard(c) {
  const ii = incInfo(c), late = ii.left != null && ii.left < 0;
  const dd = ii.left == null ? '' : ii.left > 0 ? `D-${ii.left}` : ii.left === 0 ? '오늘' : `+${-ii.left}일`;
  const inner = `<span class="egg">${EGG}</span><span class="ib"><span class="it">${esc(refName(c.damId))} × ${esc(refName(c.sireId, c.sireExt, c.sireNone))}</span>
    ${ii.pct != null ? `<span class="bar" role="img" aria-label="예상 해칭까지 ${ii.pct}% 진행"><span class="${late ? 'late' : ''}" style="width:${ii.pct}%"></span></span>` : ''}
    <span class="is">알 ${+c.eggs || 0}개 · 유정란 ${ii.fertile} · 인큐 D+${ii.el ?? '?'}${c.expectAt ? ` · 예상 해칭 ${fmtShort(c.expectAt)}` : ' · 예상 해칭일 미입력'}</span></span>${dd ? `<span class="dd${late ? ' late' : ''}">${dd}</span>` : ''}`;
  return can('admin') ? `<button class="inc" data-act="edit-clutch" data-id="${c.id}">${inner}</button>` : `<a class="inc" href="#breeding">${inner}</a>`;
}
function hatchCard(c) {
  const kids = (c.hatchedIds || []).map(G).filter(Boolean);
  return `<a class="inc hatched" href="${kids.length === 1 ? '#g-' + kids[0].id : '#breeding'}"><span class="egg">${SVG_OK}</span><span class="ib"><span class="it">해칭 완료 · ${esc(refName(c.damId))} × ${esc(refName(c.sireId, c.sireExt, c.sireNone))}</span>
    <span class="is">${fmtShort(c.hatchAt)} 해칭 · ${kids.length ? `${esc(namesOf(kids))} 등록` : '해칭 개체를 아직 등록하지 않았어요'}</span></span></a>`;
}
function vHome() {
  if (!S.loaded.g || !S.loaded.c) return loadingHTML();
  const all = [...S.geckos.values()], td = today(), [, m, d] = td.split('-').map(Number);
  const wdMode = S.settings.feedMode === 'weekdays' && S.settings.feedDays.length;
  const feedDay = wdMode && S.settings.feedDays.includes(wdOf(td)), nx = nextFarmFeedDay();
  const greet = wdMode ? (feedDay ? '급여하는 날이에요' : nx ? `다음 급여일은 ${WD[wdOf(nx)]}요일이에요` : '') : '';
  let h = `<div class="home"><div class="hello"><span>${m}월 ${d}일 ${WD[wdOf(td)]}요일${greet ? ', ' + greet : ''}</span><h1>${esc(S.farm.name)}</h1></div>`;
  if (!all.length) {
    return h + `<div class="empty"><h2>첫 개체를 등록해 보세요</h2><p>개체번호, 모프, 성별, 해칭일, 사진, 부모를 입력하면 이곳에 급여할 개체${feat('breeding') ? '와 인큐베이터 소식이' : '가'} 모입니다.</p>
      <div class="actions"><button class="btn primary" data-act="new-gecko">+ 개체 등록</button><button class="btn" data-act="load-samples">예시 3마리 넣어 보기</button></div>
      <p class="hint">예시는 화면을 둘러보는 용도이며, 설정에서 언제든 지울 수 있습니다.</p></div></div>`;
  }
  if (all.some(g => g.sample)) h += `<div class="notice"><p><b>예시 개체가 들어 있습니다.</b> 내 개체를 등록한 뒤 지우면 됩니다.</p><button class="btn small" data-act="clear-samples">예시 지우기</button></div>`;
  const act = activeGeckos(), fi = new Map(act.map(g => [g.id, feedInfo(g)]));
  const byOld = (a, b) => (fi.get(b.id).days ?? 1e9) - (fi.get(a.id).days ?? 1e9);
  const missed = act.filter(g => fi.get(g.id).state === 'missed').sort(byOld);
  const due = act.filter(g => fi.get(g.id).state === 'today').sort(byCode);
  const done = act.filter(g => fi.get(g.id).state === 'done');
  const total = missed.length + due.length + done.length;
  const inc = [...S.clutches.values()].filter(c => (c.status || 'incubating') === 'incubating')
    .sort((a, b) => (a.expectAt || '9999').localeCompare(b.expectAt || '9999') || (a.laidAt || '').localeCompare(b.laidAt || ''));
  const hatched = [...S.clutches.values()].filter(c => c.status === 'hatched' && c.hatchAt && daysSince(c.hatchAt) >= 0 && daysSince(c.hatchAt) <= 14)
    .sort((a, b) => b.hatchAt.localeCompare(a.hatchAt));
  const soon = feat('breeding') ? inc.filter(c => c.expectAt && daysUntil(c.expectAt) <= 14) : [];
  const stale = act.filter(g => fullCare(g) && (!g.last.weight || daysSince(g.last.weight.d) >= 30));

  let ck = '';
  if (missed.length === 1) {
    const g = missed[0], f = fi.get(g.id);
    ck += `<a class="ck miss" href="#g-${g.id}"><span class="ic">!</span><span class="tx"><b>${esc(g.name || g.code || gTitle(g))}</b> 급여를 놓쳤어요 <span class="miss-n">(${f.days == null ? '기록 없음' : f.days + '일째'})</span></span>${CHEV}</a>`;
  } else if (missed.length > 1) {
    ck += `<div class="ck miss"><span class="ic">!</span><span class="tx"><b>급여 놓침 ${missed.length}마리</b><small>${esc(namesOf(missed, 4))}</small></span></div>`;
  }
  if (due.length) ck += `<button class="ck feed" data-act="feed-over"><span class="ic">${SVG_FEED}</span><span class="tx">급여할 개체 <b>${due.length}마리</b> 남았어요<small>${esc(namesOf(due))} · 눌러서 한 번에 기록</small></span>${CHEV}</button>`;
  else if (!missed.length && done.length) ck += `<div class="ck ok"><span class="ic">${SVG_OK}</span><span class="tx">오늘 급여를 모두 기록했어요<small>${done.length}마리</small></span></div>`;
  for (const c of soon) {
    const ii = incInfo(c);
    ck += `<a class="ck egg" href="#breeding"><span class="ic">${EGG}</span><span class="tx">${ii.left >= 0 ? `알 ${+c.eggs || 0}개, 해칭까지 <b>${ii.left === 0 ? '오늘' : ii.left + '일'}</b>` : `예상 해칭일이 <b>${-ii.left}일</b> 지났어요`}<small>${esc(refName(c.damId))} × ${esc(refName(c.sireId, c.sireExt, c.sireNone))}</small></span>${CHEV}</a>`;
  }
  const rp = can('admin') ? reportItems().filter(x => !x.done) : [];
  if (rp.length) {
    const late = rp.filter(x => x.due < td).length, first = rp[0];
    ck += `<a class="ck rpt${late ? ' miss' : ''}" href="#reports"><span class="ic">${SVG_DOC}</span><span class="tx">야생동물 신고할 일 <b>${rp.length}건</b>${late ? ` <span class="miss-n">(기한 지남 ${late}건)</span>` : ''}<small>${esc(RPT[first.t])} · ${esc(first.g.name || first.g.code || gTitle(first.g))} · ${fmtShort(first.due)}까지</small></span>${CHEV}</a>`;
  }
  if (stale.length) ck += `<a class="ck scale" href="#list"><span class="ic">${SVG_SCALE}</span><span class="tx">몸무게 기록이 30일 넘은 개체 <b>${stale.length}마리</b><small>${esc(namesOf(stale))}</small></span>${CHEV}</a>`;
  if (!ck) ck = `<div class="ck ok"><span class="ic">${SVG_OK}</span><span class="tx">지금 확인할 일이 없어요</span></div>`;
  const check = `<section class="panel pop" aria-label="Check"><div class="check-h"><h2>Check</h2>${total ? `<span class="ck-badge">${done.length} / ${total} 완료</span>` : ''}</div><div class="cks">${ck}</div>
    ${!wdMode && can('admin') ? '<p class="hint">설정에서 급여 요일을 정하면 급여일마다 여기에서 알려 드려요.</p>' : ''}</section>`;

  const friends = [...missed, ...due];
  const fr = friends.length ? `<section class="home-sec"><div class="sec-h"><h2>밥 줄 친구들</h2><button class="btn small sun" data-act="feed-over">모두 줬어요</button></div>
    <div class="friends">${friends.slice(0, 12).map(g => {
      const f = fi.get(g.id), miss = f.state === 'missed', sx = SEX[g.sex || 'u'];
      return `<a class="friend" href="#g-${g.id}">${photoTag(g)}<span class="fn">${esc(g.name || g.code || gTitle(g))} <span class="sex ${sx.c}">${sx.s}</span></span><span class="fs2${miss ? ' miss' : ''}">${f.days == null ? '기록 없음' : miss ? `놓침 · ${f.days}일째` : f.days === 0 ? '오늘 먹음' : `${f.days}일 전에 먹음`}</span></a>`;
    }).join('')}</div>${friends.length > 12 ? `<a class="hint" href="#list">외 ${friends.length - 12}마리 더 보기</a>` : ''}</section>` : '';

  const incs = `<section class="home-sec"><div class="sec-h"><h2>인큐베이터</h2><a href="#breeding">브리딩 보기</a></div>
    ${inc.length || hatched.length ? `<div class="incs">${inc.map(incCard).join('')}${hatched.map(hatchCard).join('')}</div>`
      : `<p class="hint">인큐 중인 알이 없어요.${can('admin') ? ' 브리딩에서 산란을 기록하면 여기에서 해칭까지 남은 날을 볼 수 있어요.' : ''}</p>`}</section>`;

  const right = (feat('breeding') ? incs : '') + (can('admin') && feat('ledger') ? homeMoney() : '');
  h += `<div class="home-grid${right ? '' : ' one'}"><div class="col2">${check}${fr}</div>${right ? `<div class="col2">${right}</div>` : ''}</div>
    <div class="home-foot"><a class="btn" href="#list">개체 ${act.length}마리 모두 보기</a></div></div>`;
  return h;
}

/* ---------- 신고 도우미 화면 ---------- */
const SVG_DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>';
function vReports() {
  if (!S.loaded.g) return loadingHTML();
  if (!can('admin')) return `<div class="empty"><h2>신고 도우미는 관리자만 볼 수 있습니다</h2><a class="btn" href="#home">홈으로</a></div>`;
  const all = reportItems(), todo = all.filter(x => !x.done), done = all.filter(x => x.done).sort((a, b) => b.done.localeCompare(a.done)).slice(0, 30);
  const who = x => { const g = x.g, s = g.sale || {};
    return x.t === 'out' ? `분양일 ${fmtD(x.date)}${s.to ? ` · 받는 분 ${esc(s.to)}` : ''}${s.contact ? ` · ${esc(s.contact)}` : ''}`
      : x.t === 'in' ? `입양일 ${fmtD(x.date)}${g.sourceNote ? ` · ${esc(g.sourceNote)}` : ''}` : `사망일 ${fmtD(x.date)}`; };
  const row = (x, isDone) => `<li class="rp-row"><span class="rp-t pill ${x.t}">${RPT[x.t]}</span>
      <span class="rp-b"><a href="#g-${x.g.id}"><b>${esc(gLabel(x.g))}</b>${multiSp() ? ` <span class="muted">${esc(spOf(x.g).n)}</span>` : ''}</a><small>${who(x)}</small></span>
      <span class="rp-d">${isDone ? `<small>${fmtD(x.done)} 신고함</small>` : `<small>${fmtD(x.due)}까지</small>${dueText(x.due)}`}</span>
      <span class="rp-a">${isDone ? `<button class="icon-btn" data-act="report-undo" data-id="${x.g.id}" data-t="${x.t}">되돌리기</button>` : `<button class="btn small primary" data-act="report-done" data-id="${x.g.id}" data-t="${x.t}">신고했어요</button>`}</span></li>`;
  let h = `<a class="back" href="#home">← 홈</a><div class="vhead"><div><h1 class="vtitle">신고 도우미</h1><p class="vsub">분양·입양·폐사 때 야생동물 신고 기한을 챙깁니다.</p></div>
    <div class="actions"><a class="btn primary" href="${WIMS_URL}" target="_blank" rel="noopener">야생동물종합관리시스템 열기</a></div></div>`;
  h += `<section class="panel"><div class="ph3"><h3>해야 할 신고</h3><span class="hint">${todo.length}건</span></div>${todo.length ? `<ul class="rows rp-list">${todo.map(x => row(x, false)).join('')}</ul>` : '<p class="muted">지금 해야 할 신고가 없습니다.</p>'}</section>`;
  if (done.length) h += `<section class="panel"><div class="ph3"><h3>신고한 기록</h3></div><ul class="rows rp-list">${done.map(x => row(x, true)).join('')}</ul></section>`;
  h += `<section class="panel rp-info"><div class="ph3"><h3>알아 두기</h3></div><ul class="dots">
      <li>2025년 12월 14일부터 파충류·양서류 등 야생동물을 주고받으면(무료 분양 포함) <b>분양하는 분과 받는 분 모두</b> 양도·양수 신고를 합니다. 한 달 동안의 거래를 <b>다음 달 10일까지</b> 신고합니다.</li>
      <li>죽었을 때는 <b>사망일부터 30일 이내</b>에 폐사 신고를 합니다.</li>
      <li>백색목록 종을 보관 신고한 뒤 직접 번식한 새끼는 따로 신고하지 않아도 된다고 안내되어 있어, 출처가 ‘자가 해칭’인 개체는 목록에 넣지 않습니다.</li>
      <li>입양일·분양일·사망일이 적힌 개체만 계산합니다. 2025년 12월 14일 이전 거래는 넣지 않습니다.</li>
      <li>신고 대상인지와 정확한 기한은 종과 지역에 따라 다를 수 있으니 시스템의 ‘생물종정보’와 관할 시·군·구에서 확인해 주세요. 이 화면은 기록과 알림을 돕는 도구이며 법령 해석이 아닙니다. (2026년 1월 지자체 안내 기준)</li>
    </ul></section>`;
  return h;
}

/* ---------- ledger (가계부) ---------- */
const ymdLocal = ms => { const t = new Date(ms); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
const won = n => `${Math.round(Number(n) || 0).toLocaleString('ko-KR')}원`;
const signedWon = (kind, n) => `${kind === 'income' ? '+' : '−'}${won(n)}`;
function ledgerEntries() {
  const out = S.ledger.slice();
  for (const g of S.geckos.values()) {
    if (gStatus(g) === 'ref') continue;
    if (g.acquiredPrice > 0) out.push({id:'acq-' + g.id, date:g.acquiredDate || (g.createdAt ? ymdLocal(g.createdAt) : today()), kind:'expense', category:'개체 입양', amount:+g.acquiredPrice, gecko_id:g.id, memo:g.sourceNote || '', src:'acq'});
    const sp = g.sale && Number(g.sale.price);
    if (gStatus(g) === 'sold' && sp > 0 && g.sale.date) out.push({id:'sale-' + g.id, date:g.sale.date, kind:'income', category:'분양', amount:sp, gecko_id:g.id, memo:g.sale.to ? `분양받은 분: ${g.sale.to}` : '', src:'sale'});
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || (a.src === 'manual' ? 1 : -1));
}
const lpPrefix = P => P.mode === 'year' ? `${P.y}` : `${P.y}-${pad(P.m)}`;
const lpLabel = P => P.mode === 'year' ? `${P.y}년` : `${P.y}년 ${P.m}월`;
function sums(list) {
  let inc = 0, exp = 0;
  for (const e of list) { if (e.kind === 'income') inc += e.amount; else exp += e.amount; }
  return {inc, exp, net:inc - exp};
}
function geckoLedger(gid, all) {
  const es = (all || ledgerEntries()).filter(e => e.gecko_id === gid);
  const acq = es.filter(e => e.src === 'acq').reduce((n, e) => n + e.amount, 0);
  const care = es.filter(e => e.kind === 'expense' && e.src !== 'acq').reduce((n, e) => n + e.amount, 0);
  const sale = es.filter(e => e.kind === 'income').reduce((n, e) => n + e.amount, 0);
  return {acq, care, sale, net:sale - acq - care, count:es.length};
}
function ledgerTitle(e) {
  const g = e.gecko_id ? G(e.gecko_id) : null;
  return [g ? gLabel(g) : '', e.memo].filter(Boolean).join(' · ') || (e.gecko_id ? '삭제된 개체' : `${U()} 전체`);
}
function ledgerRow(e) {
  const inner = `<span class="ld-d mono">${fmtShort(e.date)}</span><span class="ld-t"><span class="pill${e.kind === 'income' ? ' good' : ''}">${esc(e.category)}</span> ${esc(ledgerTitle(e))}${e.src !== 'manual' ? ' <span class="tag nw">자동</span>' : ''}</span><span class="ld-a ${e.kind}">${signedWon(e.kind, e.amount)}</span>`;
  return e.src === 'manual'
    ? `<li><button class="ld-row" data-act="edit-ledger" data-id="${esc(e.id)}">${inner}</button></li>`
    : `<li><a class="ld-row" href="#g-${esc(e.gecko_id)}">${inner}</a></li>`;
}
function vLedger() {
  if (!S.loaded.g) return loadingHTML();
  if (!can('admin')) return `<div class="empty"><h2>가계부는 관리자만 볼 수 있습니다</h2><p>${U()}의 수입·지출 정보라서 관리자 권한이 있어야 열 수 있습니다.</p><a class="btn" href="#home">홈으로</a></div>`;
  const P = S.lp, all = ledgerEntries(), pre = lpPrefix(P), list = all.filter(e => e.date.startsWith(pre)), t = sums(list);
  let h = `<a class="back" href="#home">← 홈</a><div class="vhead"><div><h1 class="vtitle">가계부</h1><p class="vsub">입양·분양·관리비를 한곳에 모아 봅니다.</p></div>
    <div class="actions"><button class="btn primary" data-act="new-ledger" data-kind="expense">+ 지출</button><button class="btn" data-act="new-ledger" data-kind="income">+ 수입</button></div></div>`;
  if (S.ledgerErr) h += `<div class="notice"><p><b>가계부를 불러오지 못했습니다.</b> ${esc(S.ledgerErr)}</p></div>`;
  h += `<div class="lbar"><div class="lnav"><button class="icon-btn" data-act="ledger-step" data-d="-1" aria-label="이전">‹</button><b>${lpLabel(P)}</b><button class="icon-btn" data-act="ledger-step" data-d="1" aria-label="다음">›</button></div>
    <div class="seg">${[['month', '월별'], ['year', '연도별']].map(([v, l]) => `<button data-act="ledger-mode" data-v="${v}" aria-pressed="${P.mode === v}">${l}</button>`).join('')}</div></div>
  <section class="lkpis" aria-label="${lpLabel(P)} 요약">
    <div class="stat"><span class="k">수입</span><span class="v pos">${won(t.inc)}</span></div>
    <div class="stat"><span class="k">지출</span><span class="v">${won(t.exp)}</span></div>
    <div class="stat"><span class="k">손익</span><span class="v ${t.net >= 0 ? 'pos' : 'bad'}">${t.net >= 0 ? '+' : '−'}${won(Math.abs(t.net))}</span></div>
  </section>`;
  let left = '', right = '';
  // expense by category
  const cats = new Map();
  list.filter(e => e.kind === 'expense').forEach(e => cats.set(e.category, (cats.get(e.category) || 0) + e.amount));
  const catRows = [...cats.entries()].sort((a, b) => b[1] - a[1]);
  right += `<section class="panel"><div class="ph3"><h3>지출 항목</h3></div>${catRows.length ? `<ul class="lcats">${catRows.map(([c, v]) => { const pct = t.exp ? Math.round(v / t.exp * 100) : 0; return `<li><span class="lc-n">${esc(c)}</span><span class="lc-bar" aria-hidden="true"><span style="width:${Math.max(pct, 2)}%"></span></span><span class="lc-v">${won(v)} <small>${pct}%</small></span></li>`; }).join('')}</ul>` : '<p class="muted">이 기간에 지출이 없습니다.</p>'}</section>`;
  if (P.mode === 'year') {
    const rows = [];
    for (let m = 1; m <= 12; m++) { const pm = `${P.y}-${pad(m)}`, st = sums(all.filter(e => e.date.startsWith(pm))); if (st.inc || st.exp) rows.push([m, st]); }
    right += `<section class="panel"><div class="ph3"><h3>월별 손익</h3></div>${rows.length ? `<ul class="rows">${rows.map(([m, st]) => `<li><button class="rowbtn" data-act="ledger-month" data-m="${m}"><span class="r1">${m}월</span><span class="r2">수입 ${won(st.inc)} · 지출 ${won(st.exp)}</span><span class="rr"><span class="ld-a ${st.net >= 0 ? 'income' : 'expense'}">${st.net >= 0 ? '+' : '−'}${won(Math.abs(st.net))}</span></span></button></li>`).join('')}</ul>` : '<p class="muted">이 해에 기록이 없습니다.</p>'}</section>`;
  }
  // entries
  left += `<section class="panel"><div class="ph3"><h3>내역</h3><div class="acts"><button class="btn small" data-act="ledger-csv"${list.length ? '' : ' disabled'}>CSV(엑셀) 내려받기</button></div></div>
    ${list.length ? `<ul class="rows">${list.map(ledgerRow).join('')}</ul>` : `<p class="muted">${lpLabel(P)}에 기록이 없습니다. 위의 <b>+ 지출</b>, <b>+ 수입</b>으로 기록해 보세요.</p>`}
    <p class="hint">‘자동’ 표시가 붙은 줄은 개체의 입양가(개체 정보 수정)와 분양가(분양 처리)에서 자동으로 들어온 금액입니다. 고치려면 해당 개체에서 바꾸세요.</p></section>`;
  // per-gecko P&L (all time)
  const per = [...S.geckos.values()].filter(g => gStatus(g) !== 'ref').map(g => ({g, ...geckoLedger(g.id, all)})).filter(x => x.count).sort((a, b) => b.net - a.net);
  right += `<section class="panel"><div class="ph3"><h3>개체별 손익 <small class="muted">전체 기간</small></h3></div>${per.length ? `<ul class="rows">${per.slice(0, 30).map(x => `<li><a class="rowbtn" href="#g-${x.g.id}"><span class="r1">${esc(gLabel(x.g))}</span><span class="r2">입양 ${won(x.acq)} · 관리비 ${won(x.care)} · 분양 ${won(x.sale)}</span><span class="rr"><span class="ld-a ${x.net >= 0 ? 'income' : 'expense'}">${x.net >= 0 ? '+' : '−'}${won(Math.abs(x.net))}</span></span></a></li>`).join('')}</ul>` : '<p class="muted">개체와 연결된 금액이 아직 없습니다. 지출을 기록할 때 개체를 고르면 개체별 손익이 계산됩니다.</p>'}</section>`;
  h += `<div class="cols2"><div class="col" style="display:flex;flex-direction:column;gap:16px">${left}</div><div class="col" style="display:flex;flex-direction:column;gap:16px">${right}</div></div>
    <p class="hint">가계부는 관리자만 볼 수 있습니다. 개인 기록용이며 세무 신고용 장부를 대신하지 않습니다.</p>`;
  return h;
}
function homeMoney() {
  const pm = today().slice(0, 7), t = sums(ledgerEntries().filter(e => e.date.startsWith(pm)));
  return `<section class="home-sec"><div class="sec-h"><h2>이번 달 가계부</h2><a href="#ledger">가계부 열기</a></div>
    <a class="money" href="#ledger"><span><small>수입</small><b class="pos">${won(t.inc)}</b></span><span><small>지출</small><b>${won(t.exp)}</b></span><span><small>손익</small><b class="${t.net >= 0 ? 'pos' : 'bad'}">${t.net >= 0 ? '+' : '−'}${won(Math.abs(t.net))}</b></span></a></section>`;
}
function geckoMoney(g) {
  const x = geckoLedger(g.id);
  return `<section class="panel o6"><div class="ph3"><h3>가계부</h3><div class="acts"><button class="btn small" data-act="new-ledger" data-kind="expense" data-gecko="${g.id}">+ 지출 기록</button></div></div>
    <dl class="facts"><dt>입양가</dt><dd>${x.acq ? won(x.acq) : '—'}</dd><dt>관리비</dt><dd>${won(x.care)}</dd><dt>분양가</dt><dd>${x.sale ? won(x.sale) : '—'}</dd><dt>손익</dt><dd><b class="${x.net >= 0 ? 'pos' : 'bad'}">${x.net >= 0 ? '+' : '−'}${won(Math.abs(x.net))}</b></dd></dl>
    <a class="hint" href="#ledger">가계부 전체 보기</a></section>`;
}
function openLedgerForm(id, pre = {}) {
  const e = id ? S.ledger.find(x => x.id === id) : {kind:pre.kind || 'expense', date:today(), category:'', amount:'', gecko_id:pre.gecko || '', memo:''};
  if (!e) return;
  const cats = k => LCAT[k].map(c => `<option${e.category === c ? ' selected' : ''}>${c}</option>`).join('');
  const gopts = [...S.geckos.values()].filter(g => gStatus(g) !== 'ref' || g.id === e.gecko_id).sort(byCode)
    .map(g => `<option value="${g.id}"${e.gecko_id === g.id ? ' selected' : ''}>${esc(gLabel(g))}${gStatus(g) !== 'active' ? ` (${STATUS[gStatus(g)]})` : ''}</option>`).join('');
  const sh = openSheet(`<form class="form" id="ledform" novalidate>${sheetHead(id ? '가계부 수정' : '가계부 기록')}
    <div class="field"><span class="lbl">구분</span>${seg('ld-kind', LKIND, e.kind)}</div>
    <div class="grid2"><div class="field"><label for="ld-date">날짜</label><input id="ld-date" type="date" value="${esc(e.date)}"></div>
      <div class="field"><label for="ld-amt">금액 (원)</label><input id="ld-amt" inputmode="numeric" autocomplete="off" placeholder="예: 32,000" value="${e.amount ? Number(e.amount).toLocaleString('ko-KR') : ''}"></div></div>
    <div class="grid2"><div class="field"><label for="ld-cat">항목</label><select id="ld-cat">${cats(e.kind)}</select></div>
      <div class="field"><label for="ld-g">개체 (선택)</label><select id="ld-g"><option value="">${U()} 전체</option>${gopts}</select></div></div>
    <div class="field"><label for="ld-memo">메모</label><input id="ld-memo" value="${esc(e.memo || '')}" autocomplete="off" placeholder="예: CGD 2봉, 동물병원 진료"></div>
    <p class="hint">개체를 고르면 개체별 손익에 관리비로 들어갑니다. 입양가와 분양가는 개체 정보 수정·분양 처리에서 입력하면 자동으로 들어옵니다.</p>
    <p class="err" hidden></p>
    <div class="sh-foot">${id ? '<button type="button" class="btn danger" id="ld-del">삭제</button>' : ''}<span class="sp"></span><button type="button" class="btn" data-act="close-sheet">취소</button><button type="submit" class="btn primary" id="ld-save">저장</button></div></form>`, {label:'가계부 기록'});
  sh.querySelectorAll('input[name=ld-kind]').forEach(r => r.addEventListener('change', () => { const k = sh.querySelector('input[name=ld-kind]:checked').value; e.category = ''; sh.querySelector('#ld-cat').innerHTML = cats(k); }));
  const amt = sh.querySelector('#ld-amt');
  amt.addEventListener('input', () => { const d = amt.value.replace(/[^0-9]/g, ''); amt.value = d ? parseInt(d, 10).toLocaleString('ko-KR') : ''; });
  sh.querySelector('#ledform').addEventListener('submit', async ev => {
    ev.preventDefault();
    const kind = (sh.querySelector('input[name=ld-kind]:checked') || {}).value || 'expense';
    const date = fval(sh, 'ld-date'), amount = parseInt(amt.value.replace(/[^0-9]/g, '') || '0', 10);
    if (!date) return showErr(sh, '날짜를 입력해 주세요.');
    if (!(amount > 0)) return showErr(sh, '금액을 원 단위 숫자로 입력해 주세요.');
    const row = {date, kind, amount, category:fval(sh, 'ld-cat') || LCAT[kind][0], gecko_id:fval(sh, 'ld-g') || null, memo:fval(sh, 'ld-memo'), updated_at:new Date().toISOString()};
    const btn = sh.querySelector('#ld-save'); busy(btn, true);
    try {
      if (id) await q(sb.from('ledger').update(row).eq('id', id)); else await q(sb.from('ledger').insert({id:rid(), farm_id:S.farm.id, ...row}));
      closeSheet(); toast('가계부에 기록했습니다');
      const [y, m] = date.split('-').map(Number); if (S.lp.mode === 'month') { S.lp.y = y; S.lp.m = m; } else S.lp.y = y;
      await refresh();
    } catch (err) { busy(btn, false); showErr(sh, errMsg(err)); }
  });
  const del = sh.querySelector('#ld-del');
  if (del) del.addEventListener('click', async () => {
    if (!await confirmSheet('이 기록을 삭제할까요?', `${fmtD(e.date)} ${esc(e.category)} ${won(e.amount)}`, '삭제', true)) return;
    try { await q(sb.from('ledger').delete().eq('id', id)); closeSheet(); toast('삭제했습니다'); await refresh(); } catch (err) { showErr(sh, errMsg(err)); }
  });
}
function ledgerCsv() {
  const P = S.lp, list = ledgerEntries().filter(e => e.date.startsWith(lpPrefix(P))).sort((a, b) => a.date.localeCompare(b.date));
  const cell = v => { const t = String(v ?? ''); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const lines = [['날짜', '구분', '항목', '금액', '개체', '메모', '출처'].join(',')];
  for (const e of list) { const g = e.gecko_id ? G(e.gecko_id) : null; lines.push([e.date, LKIND[e.kind], e.category, e.kind === 'income' ? e.amount : -e.amount, g ? gLabel(g) : '', e.memo, e.src === 'manual' ? '직접 입력' : e.src === 'acq' ? '입양가' : '분양가'].map(cell).join(',')); }
  const t = sums(list); lines.push(''); lines.push(['합계', '', '수입', t.inc].join(',')); lines.push(['', '', '지출', -t.exp].join(',')); lines.push(['', '', '손익', t.net].join(','));
  downloadBlob(new Blob(['﻿' + lines.join('\r\n')], {type:'text/csv;charset=utf-8'}), `가계부_${safeName(S.farm.name)}_${lpPrefix(P)}.csv`);
}

/* ---------- list ---------- */
function vList() {
  if (!S.loaded.g) return loadingHTML('개체 목록을 불러오는 중…');
  const all = [...S.geckos.values()];
  if (S.listFilter === 'ref' && !feat('ref')) S.listFilter = 'active';
  const cnt = {active:0, sold:0, dead:0, ref:0};
  all.forEach(g => { cnt[gStatus(g)] = (cnt[gStatus(g)] || 0) + 1; });
  let arr = all.filter(g => S.listFilter === 'all' ? gStatus(g) !== 'ref' : gStatus(g) === S.listFilter);
  if (S.sexFilter !== 'all') arr = arr.filter(g => sexGroup(g.sex) === S.sexFilter);
  const showSp = multiSp();
  if (!showSp) S.spFilter = 'all';
  if (S.spFilter !== 'all') arr = arr.filter(g => gSp(g) === S.spFilter);
  if (S.q) arr = arr.filter(matchQ);
  arr.sort(sorter(S.sort));
  let h = '';
  if (all.some(g => g.sample)) h += `<div class="notice"><p><b>예시 개체가 들어 있습니다.</b> 화면을 둘러보는 용도입니다. 내 개체를 등록한 뒤 지우면 됩니다.</p><button class="btn small" data-act="clear-samples">예시 지우기</button></div>`;
  h += `<div class="vhead"><div><h1 class="vtitle">개체</h1></div></div>`;
  const segs = [['active', '보유 중'], ['sold', '분양'], ['dead', '사망'], ['ref', '혈관리용'], ['all', '전체']].filter(([v]) => (v !== 'dead' || cnt.dead) && (v !== 'ref' || (cnt.ref && feat('ref'))));
  h += `<div class="toolbar">
    <div class="seg">${segs.map(([v, t]) => `<button data-act="filter" data-v="${v}" aria-pressed="${S.listFilter === v}">${t}<span class="n">${v === 'all' ? all.length - cnt.ref : (cnt[v] || 0)}</span></button>`).join('')}</div>
    <div class="tb-right">
      ${showSp ? `<select id="spf" data-chg="spf" aria-label="종류로 보기"><option value="all">모든 종류</option>${(() => { const ks = [...new Set([...farmSpecies().map(x => x.k), ...all.map(gSp)])]; return ks.map(k => { const n = all.filter(g => gSp(g) === k && gStatus(g) !== 'ref').length; return `<option value="${esc(k)}"${S.spFilter === k ? ' selected' : ''}>${esc(spOf({species:k}).n)} (${n})</option>`; }).join(''); })()}</select>` : ''}
      <select id="sexf" data-chg="sexf" aria-label="성별로 보기">${[['all', '모든 성별'], ['m', '수컷·추정'], ['f', '암컷·추정'], ['u', '미확인']].map(([v, t]) => `<option value="${v}"${S.sexFilter === v ? ' selected' : ''}>${t}</option>`).join('')}</select>
      <select id="sortf" data-chg="sort" aria-label="정렬">${[['code', '번호순'], ['feed', '급여 오래된 순'], ['young', '어린 개체 순'], ['name', '이름순'], ['recent', '최근 등록순']].map(([v, t]) => `<option value="${v}"${S.sort === v ? ' selected' : ''}>${t}</option>`).join('')}</select>
      <button class="btn" data-act="bulk" aria-pressed="${S.bulk}">일괄 급여</button>
      <a class="btn" href="#map">마인드맵</a>
      <a class="btn" href="#labels">QR 라벨</a>
      <a class="btn" href="#sales">분양 기록</a>
      <button class="btn primary" data-act="new-gecko">+ 개체 등록</button>
    </div></div>`;
  if (!all.length) {
    h += `<div class="empty"><h2>첫 개체를 등록해 보세요</h2><p>개체번호, 모프, 성별, 해칭일, 사진, 부모를 입력하면 이곳에 카드로 쌓입니다. 부모를 지정해 두면 혈통도와 마인드맵이 자동으로 그려집니다.</p>
      <div class="actions"><button class="btn primary" data-act="new-gecko">+ 개체 등록</button><button class="btn" data-act="load-samples">예시 3마리 넣어 보기</button></div>
      <p class="hint">예시는 화면을 둘러보는 용도이며, 설정에서 언제든 지울 수 있습니다.</p></div>`;
  } else if (!arr.length) {
    h += `<div class="empty"><h2>조건에 맞는 개체가 없습니다</h2><p>${S.q ? `“${esc(S.q)}” 검색 결과가 없습니다.` : '다른 보기를 선택해 보세요.'}</p></div>`;
  } else {
    h += `<div class="glist">${arr.map(card).join('')}</div>`;
  }
  if (S.bulk) {
    h += `<div class="bulkbar"><div class="in"><span class="cnt">${S.sel.size}마리 선택</span>
      <button class="btn small" data-act="sel-all">보이는 개체 전체</button>
      <button class="btn small" data-act="sel-none">선택 해제</button>
      <button class="btn small primary" data-act="bulk-feed"${S.sel.size ? '' : ' disabled'}>급여 기록</button>
      <button class="btn small" data-act="bulk">닫기</button></div></div>`;
  }
  return h;
}
function card(g) {
  const sx = SEX[g.sex || 'u'], fi = feedInfo(g), st = gStatus(g), w = g.last && g.last.weight;
  const sub = [multiSp() ? spOf(g).n : null, g.name ? (g.morph || '모프 미기록') : null, hatchAge(g) || null].filter(Boolean).join(' · ');
  let pills = w ? `<span class="pill">${fmtG(w.g)} g</span>` : '';
  if (st !== 'active') pills += `<span class="pill">${STATUS[st]}</span>`;
  else if (g.listing) pills += `<span class="pill sun">${LSTATE[g.listing.state] || '분양 중'}</span>`;
  else {
    pills += fi.sched.mode === 'none' ? (fi.days == null ? '' : fi.days === 0 ? `<span class="pill good">오늘 급여함</span>` : `<span class="pill">급여 D+${fi.days}</span>`)
      : fi.days == null ? `<span class="pill bad">급여 기록 없음</span>`
      : fi.state === 'missed' ? `<span class="pill bad">급여 놓침 · D+${fi.days}</span>`
      : fi.state === 'today' ? `<span class="pill warn">오늘 급여일 · D+${fi.days}</span>`
      : fi.days === 0 ? `<span class="pill good">오늘 급여함</span>` : `<span class="pill">급여 D+${fi.days}</span>`;
    if (fi.ate === 'none') pills += `<span class="pill warn">최근 거식</span>`;
  }
  const inner = `${photoTag(g)}<span class="gc-body"><span class="gc-top"><span class="code">${esc(g.code || '번호 없음')}</span><span class="sex ${sx.c}" title="${sx.t}">${sx.s}</span>${g.sample ? '<span class="tag">예시</span>' : ''}</span><span class="nm">${esc(gTitle(g))}</span>${sub ? `<span class="mf">${esc(sub)}</span>` : ''}<span class="meta">${pills}</span></span>`;
  if (S.bulk) {
    const on = S.sel.has(g.id);
    return `<button type="button" class="gcard${on ? ' on' : ''}" data-act="sel" data-id="${g.id}" aria-pressed="${on}"><span class="chk" aria-hidden="true"></span>${inner}</button>`;
  }
  return `<a class="gcard" href="#g-${g.id}">${inner}</a>`;
}

/* ---------- gecko page ---------- */
function vGecko(id) {
  if (!S.loaded.g) return loadingHTML();
  const g = G(id);
  if (!g) return `<div class="empty"><h2>개체를 찾을 수 없습니다</h2><p>삭제된 개체이거나 QR이 가리키는 개체가 바뀌었을 수 있습니다.</p><a class="btn" href="#list">개체 목록으로</a></div>`;
  const sx = SEX[g.sex || 'u'], st = gStatus(g), fi = feedInfo(g), L = g.last || {};
  const src = SRC[g.source] ? SRC[g.source] + (g.sourceNote ? ` · ${g.sourceNote}` : '') : (g.sourceNote || '—');
  let h = `<a class="back" href="#list">← 개체 목록</a>
  <section class="dhead">
    <div class="ph">${photoUrl(g) ? `<img class="hero-photo" data-ph src="${esc(photoUrl(g))}" alt="${esc(gTitle(g))} 사진">`
      : `<div class="hero-photo ph-empty ${tone(g)}${fallbackFor(g) ? ' has-fb' : ''}">${fallbackFor(g) ? `<img data-ph src="${esc(fallbackFor(g))}" alt="" referrerpolicy="no-referrer">` : phIcon(g)}<span class="ph-tag">사진 없음</span>${can('admin') ? `<button class="btn small ph-add" data-act="edit-gecko" data-id="${id}">+ 사진 추가</button>` : ''}</div>`}</div>
    <div class="dinfo">
      <div class="dcode"><span>${esc(g.code || '번호 없음')}</span>${g.sample ? '<span class="tag">예시</span>' : ''}${st !== 'active' ? `<span class="pill">${STATUS[st]}</span>` : ''}${st === 'active' && g.listing ? `<span class="pill sun">${LSTATE[g.listing.state] || '분양 중'} · ${esc(priceText(g.listing.price))}</span>` : ''}${g.publicOn ? '' : '<span class="pill">공개 카드 꺼짐</span>'}</div>
      <h1 class="dname">${esc(gTitle(g))}</h1>
      <div class="dsub">${multiSp() ? `<span class="sp-n">${esc(spOf(g).n)}</span> · ` : ''}<span class="sex ${sx.c}">${sx.s} ${sx.t}</span>${g.sexAt ? ` <span class="muted">(${fmtD(g.sexAt)} 확인)</span>` : ''} · ${esc(g.morph || '모프 미기록')}</div>
      <dl class="facts">
        <dt>해칭일</dt><dd>${esc(hatchText(g))} <span class="muted">${esc(hatchAge(g))}</span></dd>
        <dt>입양일</dt><dd>${fmtD(g.acquiredDate)}</dd>
        ${st === 'dead' ? `<dt>사망일</dt><dd>${fmtD(g.diedAt)}</dd>` : ''}
        <dt>출처</dt><dd>${esc(src)}</dd>
        ${st === 'active' ? `<dt>급여</dt><dd>${fi.sched.mode === 'none' ? '알림 없음 <span class="muted">(기록만)</span>' : fi.sched.mode === 'weekdays' ? `${wdText(fi.sched.days)} <span class="muted">${fi.sched.own ? '(이 개체만)' : '(기본 요일)'}</span>` : `${fi.sched.limit}일마다 확인 <span class="muted">${fi.sched.own ? '(이 개체만)' : '(기본 설정)'}</span>`}${fi.state === 'missed' ? ' <span class="pill bad">급여 놓침</span>' : fi.state === 'today' ? ' <span class="pill warn">오늘 급여일</span>' : fi.next ? ` <span class="muted">· 다음 ${fmtShort(fi.next)}(${WD[wdOf(fi.next)]})</span>` : ''}</dd>` : ''}
      </dl>
      <div class="actions">
        <button class="btn" data-act="edit-gecko" data-id="${id}">정보 수정</button>
        <button class="btn" data-act="qr" data-id="${id}">QR 라벨</button>
        <a class="btn" href="#pub-${id}">공개 카드 보기</a>
        ${st === 'active' && shopOn() ? `<button class="btn" data-act="listing" data-id="${id}">${g.listing ? '분양 글 수정' : '분양 등록'}</button>` : ''}
        ${st === 'active' ? `<button class="btn" data-act="sale" data-id="${id}">분양 처리</button>` : ''}
      </div>
    </div>
  </section>
  ${can('admin') ? reportItems().filter(x => x.g.id === id && !x.done).map(x => `<div class="notice rpt${x.due < today() ? ' late' : ''}"><p><b>${RPT[x.t]}가 필요합니다</b> · ${fmtD(x.due)}까지 ${dueText(x.due)}</p><span class="acts"><button class="btn small primary" data-act="report-done" data-id="${id}" data-t="${x.t}">신고했어요</button><a class="btn small" href="#reports">신고 도우미</a></span></div>`).join('') : ''}
  ${st === 'ref' ? `<div class="notice"><p><b>혈관리용 개체입니다.</b> 내 보유 개체가 아니라 혈통도를 잇기 위해 등록한 개체라서 보유 목록·급여 알림·분양 목록에는 나오지 않습니다.</p></div>` : ''}
  <section class="qlog" aria-label="빠른 기록"${st === 'ref' ? ' hidden' : ''}>${['feed', 'weight', 'shed', 'poop', 'note'].map(t => `<button class="qbtn${t === 'feed' ? ' hot' : ''}" data-act="log" data-t="${t}" data-id="${id}"><span class="qi">${QICON[t]}</span>${LOGT[t]}</button>`).join('')}</section>
  <section class="stats" aria-label="최근 상태"${st === 'ref' ? ' hidden' : ''}>
    ${stat('최근 무게', L.weight ? `${fmtG(L.weight.g)} g` : '—', L.weight ? fmtD(L.weight.d) : '기록 없음')}
    ${stat('마지막 급여', fi.days == null ? '—' : fi.days === 0 ? '오늘' : `D+${fi.days}`, L.feed ? `${ATE[L.feed.ate] || ''}${L.feed.food ? ' · ' + L.feed.food : ''}` : '기록 없음', st === 'active' && fi.state === 'missed')}
    ${stat('마지막 탈피', L.shed ? (daysSince(L.shed.d) === 0 ? '오늘' : `D+${daysSince(L.shed.d)}`) : '—', L.shed ? fmtD(L.shed.d) : '기록 없음')}
    ${stat('마지막 배변', L.poop ? (daysSince(L.poop.d) === 0 ? '오늘' : `D+${daysSince(L.poop.d)}`) : '—', L.poop ? fmtD(L.poop.d) : '기록 없음')}
  </section>`;
  const loaded = S.logGid === id && S.logsLoaded;
  const weights = loaded ? S.logs.filter(e => e.t === 'weight').slice().sort((a, b) => a.d.localeCompare(b.d) || a._i - b._i) : [];
  S.chartData = weights;
  let wsum = '';
  if (weights.length) {
    const lw = weights[weights.length - 1], pw = weights[weights.length - 2];
    wsum = `<div class="wsum"><span class="big">${fmtG(lw.g)}<small>g</small></span><span class="muted">${fmtD(lw.d)}${pw ? ` · 직전 기록(${fmtShort(pw.d)}) 대비 ${fmtDelta(lw.g - pw.g)} g` : ''}</span></div>`;
  }
  const chartPanel = `<section class="panel o1"><div class="ph3"><h3>무게 변화</h3><div class="acts"><button class="btn small" data-act="log" data-t="weight" data-id="${id}">+ 무게</button></div></div>
    ${!loaded ? loadingHTML('기록을 불러오는 중…') : weights.length === 0 ? `<p class="muted">아직 무게 기록이 없습니다. 위의 <b>무게</b> 버튼으로 첫 기록을 남겨 보세요.</p>` : weights.length === 1 ? `${wsum}<p class="hint">두 번 이상 기록하면 변화 그래프가 그려집니다.</p>` : `${wsum}<div class="wchart" id="wchart"></div>`}</section>`;
  const pedPanel = `<section class="panel o2"><div class="ph3"><h3>혈통</h3><div class="acts"><a class="btn small" href="#map-${id}">마인드맵으로 보기</a><button class="btn small" data-act="edit-gecko" data-id="${id}">부모 지정</button></div></div>${pedigree(g)}<p class="hint">개체를 누르면 해당 개체 화면으로 이동합니다. 점선은 목록에 없는 개체입니다.</p></section>`;
  const breedPanel = feat('breeding') && fullCare(g) ? geckoBreeding(g) : '';
  const tlPanel = timeline(g, loaded);
  const notesPanel = g.notes ? `<section class="panel o5"><div class="ph3"><h3>메모</h3></div><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(g.notes)}</p></section>` : '';
  const salePanel = st === 'sold' ? salePanelHTML(g) : '';
  const moneyPanel = can('admin') && feat('ledger') && st !== 'ref' ? geckoMoney(g) : '';
  h += st === 'ref'
    ? `<div class="dgrid"><div class="col">${pedPanel}</div><div class="col">${breedPanel}${notesPanel}</div></div>`
    : `<div class="dgrid"><div class="col">${chartPanel}${tlPanel}</div><div class="col">${pedPanel}${breedPanel}${notesPanel}${salePanel}${moneyPanel}</div></div>`;
  return h;
}
const stat = (k, v, s, bad) => `<div class="stat"><span class="k">${k}</span><span class="v${bad ? ' bad' : ''}">${esc(v)}</span><span class="s">${esc(s)}</span></div>`;
function salePanelHTML(g) {
  const s = g.sale || {};
  return `<section class="panel o6"><div class="ph3"><h3>분양 정보</h3><div class="acts"><button class="btn small" data-act="sale" data-id="${g.id}">수정</button><button class="btn small" data-act="sale-cancel" data-id="${g.id}">분양 취소</button></div></div>
    <dl class="facts"><dt>분양일</dt><dd>${fmtD(s.date)}</dd><dt>분양받은 분</dt><dd>${esc(s.to || '—')}</dd>${s.contact ? `<dt>연락처</dt><dd>${esc(s.contact)}</dd>` : ''}${s.price ? `<dt>분양가</dt><dd>${fmtWon(s.price)}</dd>` : ''}${s.note ? `<dt>메모</dt><dd>${esc(s.note)}</dd>` : ''}</dl></section>`;
}

/* pedigree */
function pedNode(ref, role, self) {
  if (ref.kind === 'id') {
    const g = ref.g, sx = SEX[g.sex || 'u'];
    const inner = `${photoTag(g, 'pav')}<span class="pt"><span class="pr">${role}${role ? ' · ' : ''}<span class="mono">${esc(g.code || '')}</span> <span class="sex ${sx.c}">${sx.s}</span></span><span class="pn">${esc(gTitle(g))}</span></span><span class="pm">${esc(g.morph || '모프 미기록')}</span>`;
    return self ? `<div class="pnode self">${inner}</div>` : `<a class="pnode" href="#g-${g.id}">${inner}</a>`;
  }
  if (ref.kind === 'ext') return `<div class="pnode ext"><span class="pav">외</span><span class="pt"><span class="pr">${role}</span><span class="pn">${esc(ref.label)}</span></span><span class="pm">목록에 없는 개체</span></div>`;
  return `<div class="pnode none"><span class="pav">?</span><span class="pt"><span class="pr">${role}</span><span class="pn">미상</span></span></div>`;
}
function pedigree(g) {
  const s = parentRef(g, 'sire'), d = parentRef(g, 'dam');
  const up = r => r.kind === 'id' ? [parentRef(r.g, 'sire'), parentRef(r.g, 'dam')] : [{kind:'none'}, {kind:'none'}];
  const [ss, sd] = up(s), [ds, dd] = up(d);
  return pedTree(g, s, d, ss, sd, ds, dd);
}
function pedTree(g, s, d, ss, sd, ds, dd) {
  const leaf = (r, role) => `<div class="pit">${pedNode(r, role)}</div>`;
  return `<div class="ped-scroll"><div class="ped-cols"><span>본 개체</span><span>부모</span><span>조부모</span></div>
    <div class="ped">${pedNode({kind:'id', g}, '', true)}<div class="pbr">
      <div class="pit">${pedNode(s, '부')}<div class="pbr">${leaf(ss, '부의 부')}${leaf(sd, '부의 모')}</div></div>
      <div class="pit">${pedNode(d, '모')}<div class="pbr">${leaf(ds, '모의 부')}${leaf(dd, '모의 모')}</div></div>
    </div></div></div>`;
}

/* breeding panel on a gecko page */
function geckoBreeding(g) {
  const id = g.id, isF = sexGroup(g.sex) === 'f', isM = sexGroup(g.sex) === 'm';
  const cls = [...S.clutches.values()].filter(c => c.damId === id || c.sireId === id).sort((a, b) => (b.laidAt || '').localeCompare(a.laidAt || ''));
  const prs = [...S.pairings.values()].filter(p => p.maleId === id || p.femaleId === id).sort((a, b) => (b.startAt || '').localeCompare(a.startAt || ''));
  const kids = [...S.geckos.values()].filter(k => k.sireId === id || k.damId === id).sort((a, b) => (b.hatchDate || '').localeCompare(a.hatchDate || ''));
  if (!cls.length && !prs.length && !kids.length && !isF && !isM) return '';
  const eggs = cls.reduce((n, c) => n + (+c.eggs || 0), 0), inf = cls.reduce((n, c) => n + (+c.infertile || 0), 0);
  let h = `<section class="panel o3"><div class="ph3"><h3>번식</h3><div class="acts">
    ${isF ? `<button class="btn small" data-act="new-clutch" data-dam="${id}">+ 산란 기록</button>` : ''}
    ${isF || isM ? `<button class="btn small" data-act="new-pair" data-${isF ? 'female' : 'male'}="${id}">+ 메이팅</button>` : ''}</div></div>`;
  if (cls.length) h += `<div class="sumline"><span>산란 <b>${cls.length}회</b></span><span>알 <b>${eggs}개</b></span><span>무정란 <b>${inf}개</b></span><span>자손 <b>${kids.length}마리</b></span></div>`;
  if (kids.length) h += `<div><div class="lbl" style="margin-bottom:6px">자손 ${kids.length}마리</div><div class="kids">${kids.map(k => `<a class="kid" href="#g-${k.id}">${photoTag(k, 'pav')}<span><span class="mono">${esc(k.code || '')}</span> ${esc(k.name || k.morph || '')}</span></a>`).join('')}</div></div>`;
  if (cls.length) h += `<div><div class="lbl">산란 기록</div><ul class="rows">${cls.map(clutchRow).join('')}</ul></div>`;
  if (prs.length) h += `<div><div class="lbl">메이팅</div><ul class="rows">${prs.map(pairRow).join('')}</ul></div>`;
  if (!cls.length && !prs.length && !kids.length) h += `<p class="muted">아직 번식 기록이 없습니다.</p>`;
  return h + `</section>`;
}
const refName = (id, ext, none) => { if (none) return '수컷 없음'; const g = G(id); return g ? gLabel(g) : (id ? '삭제된 개체' : (ext || '미상')); };
function clutchRow(c) {
  const fertile = Math.max(0, (+c.eggs || 0) - (+c.infertile || 0));
  const st = c.status || 'incubating';
  const dayFrom = c.incubStart || c.laidAt;
  const pillCls = st === 'incubating' ? 'good' : st === 'hatched' ? '' : 'warn';
  const extra = st === 'incubating' && dayFrom ? `인큐 D+${daysSince(dayFrom)}` : st === 'hatched' && c.hatchAt ? `${fmtShort(c.hatchAt)} 해칭` : '';
  return `<li><button class="rowbtn" data-act="edit-clutch" data-id="${c.id}">
    <span class="r1"><span class="mono">${fmtD(c.laidAt)}</span> 산란 · ${esc(refName(c.damId))} × ${esc(refName(c.sireId, c.sireExt, c.sireNone))}</span>
    <span class="r2">알 ${+c.eggs || 0}개 · 유정란 ${fertile} · 무정란 ${+c.infertile || 0}${(c.hatchedIds || []).length ? ` · 해칭 개체 ${(c.hatchedIds || []).length}마리 등록` : ''}${c.expectAt && st === 'incubating' ? ` · 예상 해칭 ${fmtShort(c.expectAt)}` : ''}</span>
    <span class="rr"><span class="pill ${pillCls}">${CLS[st]}</span>${extra ? `<span class="hint mono">${extra}</span>` : ''}</span></button></li>`;
}
/* ---------- inbreeding check (5촌 이내, 입력된 혈통만) ---------- */
const KIN_MAX = 5;
function ancestorsWithin(id, max) {
  const out = new Map(), queue = [[id, 0]];
  while (queue.length) {
    const [x, d] = queue.shift();
    if (out.has(x) && out.get(x) <= d) continue;
    out.set(x, d);
    if (d >= max) continue;
    const g = G(x); if (!g) continue;
    if (g.sireId) queue.push([g.sireId, d + 1]);
    if (g.damId) queue.push([g.damId, d + 1]);
  }
  return out;
}
function kinship(aId, bId, max = KIN_MAX) {
  if (!aId || !bId || aId === bId) return [];
  const A = ancestorsWithin(aId, max), B = ancestorsWithin(bId, max), res = [];
  for (const [x, da] of A) {
    if (!B.has(x)) continue;
    const db = B.get(x), total = da + db;
    if (total > 0 && total <= max) res.push({id:x, da, db, total});
  }
  return res.sort((p, q) => p.total - q.total || p.da - q.da);
}
function kinLabel(list) {
  const c = list[0]; if (!c) return '';
  const t = c.total;
  if (c.da === 0 || c.db === 0) return t === 1 ? '부모와 자식 (1촌)' : t === 2 ? '조부모와 손주 (2촌)' : `${t}대 직계 (${t}촌)`;
  if (t === 2) return list.filter(x => x.total === 2).length >= 2 ? '형제자매 (2촌)' : '한쪽 부모만 같은 형제자매 (2촌)';
  if (t === 3) return '삼촌·조카 관계 (3촌)';
  if (t === 4) return '사촌 (4촌)';
  return '오촌 (5촌)';
}
const KIN_NOTE = '이 확인은 이 앱에 입력된 혈통 정보(지금 보고 있는 가족·브랜드에 등록된 개체와 부모 연결)만으로 계산합니다. ‘이름만 적기’로 입력한 부모나 등록하지 않은 조상은 비교하지 못하므로, 경고가 없어도 혈연이 없다고 보장하지는 않습니다.';
function kinBox(maleId, femaleId) {
  const mg = G(maleId), fg = G(femaleId);
  if (mg && fg && gSp(mg) !== gSp(fg)) return `<div class="kin warn" role="alert"><b>서로 다른 종류입니다: ${esc(spOf(mg).n)} × ${esc(spOf(fg).n)}</b><p>다른 종끼리의 교배(교잡)는 혈통 관리와 분양에 문제가 될 수 있습니다. 개체 선택을 다시 확인해 주세요.</p></div>`;
  if (!maleId || !femaleId) return `<p class="hint kin-note">수컷과 암컷을 고르면 입력된 혈통 안에서 5촌 이내 공통 조상이 있는지 확인합니다.</p>`;
  const list = kinship(maleId, femaleId);
  const note = `<p class="hint kin-note">${KIN_NOTE}</p>`;
  if (!list.length) return `<div class="kin ok">입력된 혈통 기준으로 <b>5촌 이내 공통 조상이 없습니다.</b></div>${note}`;
  const best = list[0].total;
  const who = list.filter(x => x.total === best).map(x => {
    const g = G(x.id), nm = g ? gLabel(g) : '알 수 없는 개체';
    if (x.da === 0) return `${esc(nm)} — 수컷 본인이 암컷의 ${x.db}대 위 조상`;
    if (x.db === 0) return `${esc(nm)} — 암컷 본인이 수컷의 ${x.da}대 위 조상`;
    return `${esc(nm)} — 수컷 쪽 ${x.da}대 위 · 암컷 쪽 ${x.db}대 위`;
  });
  return `<div class="kin warn" role="alert"><b>인브리딩 위험: ${kinLabel(list)}</b>
    <p>두 개체가 5촌 이내에서 혈통이 겹칩니다. ${list[0].da === 0 || list[0].db === 0 ? '한쪽이 다른 쪽의 직계 조상입니다:' : '가장 가까운 공통 조상:'}</p><ul>${who.map(w => `<li>${w}</li>`).join('')}</ul>
    ${list.length > who.length ? `<p class="hint">더 먼 공통 조상도 ${list.length - who.length}마리 있습니다.</p>` : ''}</div>${note}`;
}
function pairRow(p) {
  const on = !p.endAt;
  return `<li><button class="rowbtn" data-act="edit-pair" data-id="${p.id}">
    <span class="r1">${esc(refName(p.maleId))} × ${esc(refName(p.femaleId))}</span>
    <span class="r2"><span class="mono">${fmtD(p.startAt)}</span> 합사${p.endAt ? ` · <span class="mono">${fmtD(p.endAt)}</span> 분리` : ''}${p.note ? ` · ${esc(p.note)}` : ''}</span>
    <span class="rr"><span class="pill ${on ? 'good' : ''}">${on ? `합사 중 D+${daysSince(p.startAt)}` : '종료'}</span>${(() => { const k = kinship(p.maleId, p.femaleId); return k.length ? `<span class="pill bad" title="입력된 혈통 기준">근친 주의 ${k[0].total}촌</span>` : ''; })()}</span></button></li>`;
}

/* timeline */
function logLine(e) {
  if (e.t === 'weight') return `${fmtG(e.g)} g`;
  if (e.t === 'feed') return `${esc(e.food || '급여')} · ${ATE[e.ate || 'all']}`;
  if (e.t === 'shed') return SHEDQ[e.q || 'ok'];
  if (e.t === 'poop') return POOPQ[e.q || 'ok'];
  return '';
}
function timeline(g, loaded) {
  let h = `<section class="panel o4"><div class="ph3"><h3>기록</h3></div>
    <div class="filt">${[['all', '전체'], ...Object.entries(LOGT)].map(([v, t]) => `<button data-act="tl" data-v="${v}" aria-pressed="${S.tl === v}">${t}</button>`).join('')}</div>`;
  if (!loaded) return h + loadingHTML('기록을 불러오는 중…') + '</section>';
  const ws = S.logs.filter(e => e.t === 'weight').slice().sort((a, b) => a.d.localeCompare(b.d) || a._i - b._i);
  const delta = new Map(); ws.forEach((e, i) => { if (i) delta.set(e.id, e.g - ws[i - 1].g); });
  const list = S.logs.filter(e => S.tl === 'all' || e.t === S.tl);
  if (!list.length) return h + `<p class="muted">${S.tl === 'all' ? '아직 기록이 없습니다. 위의 빠른 기록 버튼으로 시작해 보세요.' : `${LOGT[S.tl]} 기록이 없습니다.`}</p></section>`;
  const shown = S.tlMore ? list : list.slice(0, 30);
  h += `<ul class="rows">${shown.map(e => `<li class="tl-row"><span class="td">${fmtD(e.d)}</span><span class="tt t-${e.t}">${LOGT[e.t] || ''}</span><span class="tx">${logLine(e)}${delta.has(e.id) ? `<span class="delta">${fmtDelta(delta.get(e.id))}</span>` : ''}${e.n ? `<span class="tn">${esc(e.n)}</span>` : ''}</span><button class="icon-btn" data-act="log-edit" data-id="${g.id}" data-e="${e.id}">수정</button></li>`).join('')}</ul>`;
  if (list.length > shown.length) h += `<button class="btn small" data-act="tl-more">이전 기록 ${list.length - shown.length}건 더 보기</button>`;
  return h + '</section>';
}

/* weight chart — drawn after layout so text stays at real pixel size */
let chartPts = null;
function niceRange(min, max) {
  if (min === max) { min -= 1; max += 1; }
  const raw = (max - min) / 4, mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw);
  return {lo:Math.max(0, Math.floor(min / step) * step), hi:Math.ceil(max / step) * step, step};
}
function drawChart() {
  const box = $('#wchart'); if (!box) return;
  const pts = S.chartData || [];
  if (pts.length < 2) return;
  const W = Math.max(260, box.clientWidth), H = 220, L = 42, R = 18, T = 26, B = 26;
  const xs = pts.map(p => dnum(p.d)); let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x1 === x0) { x0 -= 1; x1 += 1; }
  const {lo, hi, step} = niceRange(Math.min(...pts.map(p => p.g)), Math.max(...pts.map(p => p.g)));
  const X = v => L + (v - x0) / (x1 - x0) * (W - L - R), Y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  const dec = step < 1 ? 1 : 0;
  let g = '';
  for (let v = lo; v <= hi + 1e-9; v += step) { const y = Y(v).toFixed(1); g += `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="c-axis" x="${L - 8}" y="${y}" text-anchor="end" dominant-baseline="middle">${v.toFixed(dec)}</text>`; }
  const mp = pts.map((p, i) => ({x:X(dnum(p.d)), y:Y(p.g), g:p.g, d:p.d, delta:i ? p.g - pts[i - 1].g : null}));
  const line = mp.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
  const area = `${line}L${mp[mp.length - 1].x.toFixed(1)},${(H - B)}L${mp[0].x.toFixed(1)},${H - B}Z`;
  const last = mp[mp.length - 1];
  const dots = mp.length <= 40 ? mp.slice(0, -1).map(p => `<circle class="c-pt" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5"/>`).join('') : '';
  box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="무게 변화 그래프, ${fmtShort(pts[0].d)}부터 ${fmtShort(last.d)}까지, 최근 ${fmtG(last.g)} 그램">
    ${g}<text class="c-axis" x="${L - 8}" y="12" text-anchor="end">g</text>
    <path class="c-area" d="${area}"/><path class="c-line" d="${line}"/>${dots}
    <circle class="c-end" cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="5"/>
    <text class="c-endlbl" x="${last.x.toFixed(1)}" y="${(last.y - 10).toFixed(1)}" text-anchor="end">${fmtG(last.g)} g</text>
    <text class="c-axis" x="${L}" y="${H - 6}" text-anchor="start">${fmtShort(pts[0].d)}</text>
    <text class="c-axis" x="${W - R}" y="${H - 6}" text-anchor="end">${fmtShort(last.d)}</text>
    <line class="c-x" x1="0" x2="0" y1="${T}" y2="${H - B}"/><circle class="c-focus" r="5.5" cx="0" cy="0"/>
    <rect x="${L}" y="0" width="${W - L - R}" height="${H}" fill="transparent"/></svg><div class="ctip" hidden></div>`;
  chartPts = mp;
  const svg = box.querySelector('svg'), tip = box.querySelector('.ctip'), vl = svg.querySelector('.c-x'), fd = svg.querySelector('.c-focus');
  const at = cx => {
    const rc = svg.getBoundingClientRect(), vx = (cx - rc.left) * (W / rc.width);
    let b = 0, bd = Infinity; mp.forEach((p, i) => { const d = Math.abs(p.x - vx); if (d < bd) { bd = d; b = i; } });
    const p = mp[b];
    vl.setAttribute('x1', p.x); vl.setAttribute('x2', p.x); vl.style.opacity = 1;
    fd.setAttribute('cx', p.x); fd.setAttribute('cy', p.y); fd.style.opacity = 1;
    tip.hidden = false;
    tip.innerHTML = `<b>${fmtG(p.g)} g</b><span>${fmtD(p.d)}${p.delta != null ? ` · ${fmtDelta(p.delta)} g` : ''}</span>`;
    const k = rc.width / W;
    tip.style.left = Math.min(Math.max(p.x * k, 70), rc.width - 70) + 'px';
    tip.style.top = (p.y * k) + 'px';
  };
  svg.addEventListener('pointermove', e => at(e.clientX));
  svg.addEventListener('pointerdown', e => at(e.clientX));
  svg.addEventListener('pointerleave', () => { tip.hidden = true; vl.style.opacity = 0; fd.style.opacity = 0; });
}
let rsz; window.addEventListener('resize', () => { clearTimeout(rsz); rsz = setTimeout(drawChart, 150); });

/* ---------- breeding ---------- */
function vBreeding() {
  if (!S.loaded.c || !S.loaded.p || !S.loaded.g) return loadingHTML();
  const cl = [...S.clutches.values()].sort((a, b) => (b.laidAt || '').localeCompare(a.laidAt || ''));
  const pr = [...S.pairings.values()].sort((a, b) => (b.startAt || '').localeCompare(a.startAt || ''));
  const inc = cl.filter(c => (c.status || 'incubating') === 'incubating').sort((a, b) => (a.incubStart || a.laidAt || '').localeCompare(b.incubStart || b.laidAt || ''));
  const prOn = pr.filter(p => !p.endAt), prOff = pr.filter(p => p.endAt);
  const y = today().slice(0, 4), cy = cl.filter(c => (c.laidAt || '').startsWith(y));
  const eggs = cy.reduce((n, c) => n + (+c.eggs || 0), 0), inf = cy.reduce((n, c) => n + (+c.infertile || 0), 0);
  const hatched = cy.reduce((n, c) => n + (c.hatchedIds || []).length, 0);
  let h = `<div class="vhead"><div><h1 class="vtitle">브리딩</h1><p class="vsub">메이팅 → 산란 → 인큐베이팅 → 해칭 순서로 기록합니다.</p></div>
    <div class="actions"><button class="btn" data-act="new-pair">+ 메이팅 기록</button><button class="btn primary" data-act="new-clutch">+ 산란 기록</button></div></div>
    <section class="kpis" aria-label="${y}년 요약">${stat(`${y}년 산란`, `${cy.length}회`, `알 ${eggs}개`)}${stat('무정란', `${inf}개`, eggs ? `전체 알의 ${Math.round(inf / eggs * 100)}%` : '—')}${stat('인큐 중', `${inc.reduce((n, c) => n + Math.max(0, (+c.eggs || 0) - (+c.infertile || 0)), 0)}개`, `${inc.length}개 클러치`)}${stat(`${y}년 해칭 등록`, `${hatched}마리`, '해칭 개체 등록 기준')}</section>
    <div class="cols2"><div class="col" style="display:flex;flex-direction:column;gap:16px">
      <section class="panel"><div class="ph3"><h3>인큐 중</h3></div>${inc.length ? `<ul class="rows">${inc.map(clutchRow).join('')}</ul>` : '<p class="muted">인큐 중인 알이 없습니다.</p>'}</section>
      <section class="panel"><div class="ph3"><h3>합사 중인 페어</h3></div>${prOn.length ? `<ul class="rows">${prOn.map(pairRow).join('')}</ul>` : '<p class="muted">합사 중인 페어가 없습니다.</p>'}</section>
    </div><div class="col" style="display:flex;flex-direction:column;gap:16px">
      <section class="panel"><div class="ph3"><h3>전체 산란 기록</h3><span class="hint">${cl.length}건</span></div>${cl.length ? `<ul class="rows">${cl.map(clutchRow).join('')}</ul>` : '<p class="muted">아직 산란 기록이 없습니다. 무정란도 함께 기록할 수 있습니다.</p>'}</section>
      ${prOff.length ? `<section class="panel"><div class="ph3"><h3>지난 메이팅</h3></div><ul class="rows">${prOff.map(pairRow).join('')}</ul></section>` : ''}
    </div></div>`;
  return h;
}

/* ---------- sales ---------- */
function vSales() {
  if (!S.loaded.g) return loadingHTML();
  const sold = [...S.geckos.values()].filter(g => gStatus(g) === 'sold').sort((a, b) => ((b.sale || {}).date || '').localeCompare((a.sale || {}).date || ''));
  let h = `<div class="vhead"><div><h1 class="vtitle">분양 기록</h1><p class="vsub">개체 화면의 <b>분양 처리</b> 버튼으로 기록합니다.</p></div></div>`;
  if (!sold.length) return h + `<div class="empty"><h2>아직 분양한 개체가 없습니다</h2><p>개체 화면에서 분양 처리를 하면 날짜, 분양받은 분, 분양가가 이곳에 연도별로 모입니다.</p></div>`;
  const years = new Map();
  for (const g of sold) { const y = ((g.sale || {}).date || '날짜 미기록').slice(0, 4); if (!years.has(y)) years.set(y, []); years.get(y).push(g); }
  for (const [y, list] of years) {
    const sum = list.reduce((n, g) => n + (+(g.sale || {}).price || 0), 0);
    h += `<section class="panel"><div class="ph3"><h3>${/^\d{4}$/.test(y) ? y + '년' : y}</h3><span class="sumline"><span><b>${list.length}마리</b></span>${sum ? `<span>합계 <b>${fmtWon(sum)}</b></span>` : ''}</span></div>
      <ul class="rows">${list.map(g => { const s = g.sale || {}, sx = SEX[g.sex || 'u']; return `<li class="sale-li"><a class="rowbtn" href="#g-${g.id}"><span class="r1"><span class="mono">${esc(g.code || '')}</span> ${esc(gTitle(g))} <span class="sex ${sx.c}">${sx.s}</span></span><span class="r2">${esc(g.morph || '모프 미기록')} · ${esc(s.to || '분양받은 분 미기록')}</span><span class="rr"><span class="mono hint">${fmtD(s.date)}</span>${s.price ? `<span class="pill">${fmtWon(s.price)}</span>` : ''}</span></a>${feat('ref') ? `<button class="icon-btn to-ref" data-act="to-ref" data-id="${g.id}" title="실제로 분양한 개체가 아니라 혈통을 잇기 위해 등록한 개체라면 혈관리용으로 옮기세요">혈관리용으로</button>` : ''}</li>`; }).join('')}</ul></section>`;
  }
  return h;
}

/* ---------- setup ---------- */
const shopLinkBox = () => `<div class="shop-link"><input id="shop-link" readonly value="${esc(shopUrl(S.farm.id))}" aria-label="분양 페이지 링크"><div class="actions"><button type="button" class="btn small primary" data-act="shop-copy">링크 복사</button>${navigator.share ? '<button type="button" class="btn small" data-act="shop-share">보내기</button>' : ''}<a class="btn small" href="#shop-${esc(S.farm.id)}">페이지 보기</a></div></div>`;
const roleOpts = cur => Object.entries(ROLE).map(([k, t]) => `<option value="${k}"${cur === k ? ' selected' : ''}>${t}</option>`).join('');
const inviteLink = code => `${appUrl()}#join-${code}`;
function vSetup() {
  const s = S.settings, f = S.farm, admin = S.role === 'admin', me = S.user && S.user.id;
  const sampleN = [...S.geckos.values()].filter(g => g.sample).length;
  const logo = f.logo_path && S.urls.get(f.logo_path);
  const pd = {...PUB_DEF, ...(f.public_defaults || {})};
  const gAvatar = S.user && S.user.user_metadata && (S.user.user_metadata.avatar_url || S.user.user_metadata.picture);
  let h = `<div class="vhead"><div><h1 class="vtitle">설정</h1><p class="vsub">${esc(f.name)} · 내 권한: <b>${ROLE[S.role]}</b></p></div></div>`;
  if (admin) {
    const u = U(), refN = [...S.geckos.values()].filter(g => gStatus(g) === 'ref').length, sc = shopCfg();
    const FEATS = [
      ['breeding', '브리딩', '메이팅·산란·인큐베이터·해칭 기록, 메뉴의 브리딩 탭, 홈의 인큐베이터'],
      ['ledger', '가계부', '수입·지출 기록, 홈의 이번 달 가계부, 개체별 손익, 입양가 입력. 관리자만 봅니다'],
      ['report', '신고 도우미', '분양·입양·폐사 때 야생동물 양도·양수·폐사 신고 기한을 Check에 알려 줍니다'],
      ['ref', '혈관리용 개체', `내 개체가 아닌 부모·조부모를 등록해 혈통을 잇는 기능. 끄면 목록의 혈관리용 탭과 등록 버튼이 숨겨집니다${refN ? `. 이미 등록한 ${refN}마리는 혈통도에 그대로 보입니다` : ''}`]
    ];
    h += `<form id="setform" class="panel form" novalidate>
      ${f.features === undefined || S.oldCols ? `<div class="notice warn"><p><b>데이터베이스 업데이트가 필요합니다.</b> 새 기능(부르는 이름·기능 켜기/끄기·여러 종류)을 저장하려면 안내드린 SQL(schema.sql)을 Supabase에서 한 번 다시 실행해 주세요.</p></div>` : ''}
      <div class="ph3"><h3>이름과 로고</h3></div>
      <div class="field"><span class="lbl">어떻게 부를까요?</span>${unitPick('s-unit', u)}<p class="hint">화면의 안내 문구와 초대장에 이 말이 쓰입니다.</p></div>
      <div class="field"><label for="s-name" id="s-name-l">${u} 이름</label><input id="s-name" value="${esc(f.name)}" autocomplete="off" placeholder="${NAME_EX[u]}"><p class="hint">맨 위 제목과 초대장에 쓰이고, 공개 카드에도 표시할 수 있습니다.</p></div>
      <div class="photo-pick"><div class="pp-prev logo" id="s-logo-prev">${logo ? `<img src="${esc(logo)}" alt="">` : '<span>로고 없음</span>'}</div>
        <div class="pp-ctl"><span class="lbl">브랜드 로고</span><div class="actions"><label class="btn small" for="s-logo">${logo ? '로고 바꾸기' : '로고 올리기'}</label>${logo ? '<button type="button" class="btn small" id="s-logo-del">로고 빼기</button>' : ''}</div><input id="s-logo" type="file" accept="image/*" hidden><p class="hint" id="s-logo-st">원 안에 꽉 차게 보여 줍니다. 정사각형이나 원형 로고가 잘 어울리고, 네모난 로고는 모서리가 잘릴 수 있습니다.</p></div></div>
      <div class="field"><span class="lbl">사진이 없는 개체에 보여 줄 이미지</span>
        <div class="seg radio">${[['logo', '브랜드 로고'], ['google', '내 구글 프로필'], ['default', '기본 게코 그림']].map(([k, t]) => `<label><input type="radio" name="s-ph" value="${k}"${(f.placeholder || 'logo') === k ? ' checked' : ''}${k === 'google' && !gAvatar ? ' disabled' : ''}><span>${t}</span></label>`).join('')}</div>
        <p class="hint">로고를 고르고 로고를 올리지 않았다면 기본 게코 그림이 나옵니다. 어느 경우든 ‘사진 없음’ 표시가 함께 붙습니다.</p></div>
      <div class="ph3"><h3>사용할 기능</h3></div>
      <p class="hint">쓰지 않는 기능은 꺼 두면 메뉴와 화면에서 숨겨집니다. 꺼도 기록은 지워지지 않고, 다시 켜면 그대로 보입니다.</p>
      <div class="feats">${FEATS.map(([k, t, d]) => `<label class="feat"><span class="ft"><b>${t}</b><small>${d}</small></span><input type="checkbox" name="s-feat" value="${k}"${feat(k) ? ' checked' : ''} aria-label="${t} 사용"></label>`).join('')}</div>
      <div class="ph3"><h3>분양 페이지</h3></div>
      <div class="feats"><label class="feat"><span class="ft"><b>분양 페이지 사용</b><small>개체 화면에서 ‘분양 등록’한 개체를 모아 보여 주는 공개 페이지입니다. 로그인 없이 볼 수 있어 인스타그램 프로필이나 카카오톡에 링크를 걸어 두기 좋습니다.</small></span><input type="checkbox" id="s-shop"${sc.on ? ' checked' : ''} aria-label="분양 페이지 사용"></label></div>
      <div id="s-shop-f"${sc.on ? '' : ' hidden'}>
        <div class="feats"><label class="feat"><span class="ft"><b>분양 게시판에 함께 올리기</b><small>다른 가족·브랜드의 분양 개체와 함께 ‘분양 게시판’ 탭에 보입니다. 끄면 링크를 받은 사람만 내 분양 페이지를 볼 수 있습니다.</small></span><input type="checkbox" id="s-shop-board"${sc.board === true || !sc.on ? ' checked' : ''} aria-label="분양 게시판에 함께 올리기"></label></div>
        <div class="field"><label for="s-shop-intro">소개 글</label><textarea id="s-shop-intro" rows="3" maxlength="500" placeholder="예: 크레스티드 게코 전문 브리더입니다. 분양 문의는 카카오톡으로 주세요.">${esc(sc.intro || '')}</textarea></div>
        <div class="grid2"><div class="field"><label for="s-shop-kakao">카카오톡 오픈채팅 주소</label><input id="s-shop-kakao" value="${esc(sc.kakao || '')}" placeholder="https://open.kakao.com/o/…" autocomplete="off" inputmode="url"></div>
          <div class="field"><label for="s-shop-insta">인스타그램 아이디</label><input id="s-shop-insta" value="${esc(sc.insta || '')}" placeholder="예: @amazing_crace" autocomplete="off"></div></div>
        <div class="grid2"><div class="field"><label for="s-shop-phone">전화번호 (선택)</label><input id="s-shop-phone" value="${esc(sc.phone || '')}" placeholder="비워 두면 표시하지 않음" autocomplete="off" inputmode="tel"></div>
          <div class="field"><label for="s-shop-link">스토어·홈페이지 주소 (선택)</label><input id="s-shop-link" value="${esc(sc.link || '')}" placeholder="https://…" autocomplete="off" inputmode="url"></div></div>
        <p class="hint">적은 연락처는 분양 페이지와 분양 중인 개체의 공개 카드에 누구나 볼 수 있게 표시됩니다. 거래와 결제는 앱 밖에서 직접 진행하며, 앱은 소개와 연결만 돕습니다.</p>
        ${sc.on ? shopLinkBox() : '<p class="hint">켜고 설정 저장을 누르면 이곳에 분양 페이지 링크가 생깁니다.</p>'}
      </div>
      <div class="ph3"><h3>키우는 종류</h3></div>
      <p class="hint">개체를 등록할 때 고르는 종류입니다. <b>크레형</b>을 켠 종류는 크레스티드 게코처럼 기본 급여 요일 알림·무게 알림·브리딩을 함께 쓰고, 끈 종류는 <b>기본 관리</b>(기록·사진·혈통·QR은 같고, 급여 알림은 개체마다 정한 주기가 있을 때만)로 관리합니다. 종류가 하나뿐이면 화면에 종류가 표시되지 않습니다.</p>
      <div id="sp-box"></div>
      <div class="ph3"><h3>QR 공개 카드 기본값</h3></div>
      <p class="hint">항상 공개: 사진, 개체번호, 이름, 모프, 성별. 아래 항목은 여기서 정한 값이 기본이고, 개체마다 따로 바꿀 수 있습니다. 분양받은 분의 연락처는 공개되지 않습니다.</p>
      <div class="pubgrid">${PUBF.map(([k, t]) => `<label class="check"><input type="checkbox" name="s-pub" value="${k}"${pd[k] ? ' checked' : ''}><span>${pubT(k, t)}</span></label>`).join('')}</div>
      <div class="ph3"><h3>급여 확인</h3></div>
      <div class="field"><span class="lbl">확인 방식</span>
        <div class="seg radio">${[['weekdays', '요일 지정'], ['interval', '며칠마다']].map(([k, t]) => `<label><input type="radio" name="s-fmode" value="${k}"${(s.feedMode || 'interval') === k ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div></div>
      <div class="field" id="s-wd-f"${s.feedMode === 'weekdays' ? '' : ' hidden'}><span class="lbl">급여 요일 (기본)</span>${wdPicker('s-wd', s.feedDays)}
        <p class="hint">급여 요일에는 목록 위에 ‘오늘 급여할 개체’가 뜨고, 지정 요일이 지났는데 기록이 없으면 ‘급여 놓침’으로 표시합니다. 해츨링처럼 주기가 다른 개체는 개체 정보 수정에서 따로 정할 수 있습니다.</p></div>
      <div class="field" id="s-days-f"${s.feedMode === 'weekdays' ? ' hidden' : ''}><label for="s-days">급여 확인 기준 (일)</label><input id="s-days" type="number" min="1" max="60" inputmode="numeric" value="${esc(s.feedAlertDays ?? DEF.feedAlertDays)}"><p class="hint">마지막 급여 후 이 날수가 지나면 목록 위에 표시합니다.</p></div>
      <div class="ph3"><h3>기록</h3></div>
      <div class="grid2">
        <div class="field"><label for="s-prefix">개체번호 앞글자</label><input id="s-prefix" value="${esc(s.codePrefix ?? DEF.codePrefix)}" autocomplete="off"><p class="hint">새 개체에 ${esc((s.codePrefix ?? DEF.codePrefix) + '001')}처럼 번호를 제안합니다.</p></div>
      </div>
        <div class="field"><label for="s-foods">먹이 목록</label><input id="s-foods" value="${esc((s.foods || DEF.foods).join(', '))}" autocomplete="off"><p class="hint">쉼표(,)로 구분합니다.</p></div>
      </div>
      <p class="err" id="s-err" hidden></p>
      <div class="sh-foot"><button class="btn primary" type="submit" id="s-save">설정 저장</button></div>
    </form>`;
  } else {
    h += `<section class="panel"><div class="ph3"><h3>${U()}</h3></div><div class="farmline">${logo ? `<img data-ph src="${esc(logo)}" alt="">` : ''}<b>${esc(f.name)}</b></div><p class="hint">이름·기능·공개 설정은 관리자만 바꿀 수 있습니다.</p>${shopOn() ? `<div class="lbl" style="margin-top:6px">분양 페이지</div>${shopLinkBox()}` : ''}</section>`;
  }
  h += `<section class="panel"><div class="ph3"><h3>구성원</h3><span class="hint">${S.members.length}명</span></div>
    <ul class="rows">${S.members.map(m => {
      const mine = m.user_id === me, nm = m.display_name || m.email || '이름 없음';
      return `<li class="mem"><span class="mem-av">${m.avatar_url ? `<img data-ph src="${esc(m.avatar_url)}" alt="" referrerpolicy="no-referrer">` : ''}<span>${esc(nm.slice(0, 1))}</span></span>
        <span class="mem-t"><b>${esc(nm)}</b>${mine ? ' <span class="pill good">나</span>' : ''}<small>${esc(m.email || '')}</small></span>
        <span class="mem-r">${admin && !mine ? `<select data-chg="member-role" data-uid="${esc(m.user_id)}" aria-label="${esc(nm)} 권한">${roleOpts(m.role)}</select><button class="icon-btn" data-act="remove-member" data-uid="${esc(m.user_id)}">내보내기</button>` : `<span class="pill">${ROLE[m.role]}</span>`}</span></li>`;
    }).join('')}</ul>`;
  if (admin) {
    h += `<div class="invite"><div class="field"><label for="inv-role">초대할 권한</label><select id="inv-role">${roleOpts('keeper')}</select></div><button class="btn primary" data-act="make-invite">초대 링크 만들기</button></div>
      <p class="hint">관리자: ${ROLE_HINT.admin} · 기록 담당: ${ROLE_HINT.keeper} · 보기 전용: ${ROLE_HINT.viewer}</p>
      ${S.invites.length ? `<div><div class="lbl" style="margin-bottom:4px">사용 대기 중인 초대 링크</div><ul class="rows">${S.invites.map(i => `<li class="inv"><span><b>${ROLE[i.role]}</b> <span class="hint">· ${fmtD(i.expires_at.slice(0, 10))}까지</span></span><span class="acts"><button class="btn small" data-act="copy-invite" data-code="${esc(i.code)}">초대장 다시 보기</button><button class="icon-btn" data-act="revoke-invite" data-code="${esc(i.code)}">취소</button></span></li>`).join('')}</ul></div>` : ''}
      <p class="hint">구글 로그인이 ‘테스트’ 상태라면, 초대받는 분의 구글 계정을 Google Cloud 콘솔의 테스트 사용자에 먼저 추가해야 로그인할 수 있습니다.</p>`;
  }
  h += `</section>`;
  h += `<section class="panel"><div class="ph3"><h3>참여 중인 곳</h3><span class="hint">${S.farms.length}곳</span></div>
    ${S.farms.length > 1 ? `<div class="field"><label for="farm-sw">지금 보고 있는 곳</label><select id="farm-sw" data-chg="farm-switch">${S.farms.map(x => `<option value="${esc(x.id)}"${x.id === f.id ? ' selected' : ''}>${esc(x.farm.name)} · ${unitOf(x.farm)} (${ROLE[x.role]})</option>`).join('')}</select></div>` : ''}
    <div class="actions"><button class="btn" data-act="new-farm">새로 만들기</button><button class="btn danger" data-act="leave-farm">이 ${U()}에서 나가기</button></div>
    <p class="hint">가족과 브랜드를 따로 만들어 오가며 볼 수 있습니다. 나가면 이 ${U()}의 개체를 더 이상 볼 수 없고, 관리자는 최소 한 명 있어야 합니다.</p></section>`;
  if (admin) h += `<section class="panel"><div class="ph3"><h3>백업</h3></div>
    <p class="hint">이 ${U()}의 개체·기록·산란·메이팅·가계부·설정을 파일 하나(JSON)로 내려받습니다. 사진 파일은 포함되지 않습니다. 가끔 한 번씩 받아 두면 안심입니다.</p>
    <div class="actions">${feat('ledger') ? '<a class="btn" href="#ledger">가계부 열기</a>' : ''}<button class="btn" data-act="backup">전체 데이터 백업 내려받기</button>${sampleN ? `<button class="btn danger" data-act="clear-samples">예시 개체 ${sampleN}마리 지우기</button>` : ''}</div></section>`;
  h += `<section class="panel"><div class="ph3"><h3>계정</h3></div>
    <dl class="facts"><dt>로그인</dt><dd>${esc((S.user && S.user.email) || '—')}</dd><dt>QR 주소</dt><dd class="mono" style="font-size:13px">${esc(appUrl())}</dd></dl>
    <div class="actions"><a class="btn" href="#labels">QR 라벨 만들기</a><button class="btn" data-act="logout">로그아웃</button></div></section>`;
  h += installPanel();
  return h;
}

/* ---------- 앱으로 설치 (테스터용) ---------- */
// 휴대폰 홈 화면·PC에서 앱처럼 바로 열 수 있게 설치를 돕는 기능. 테스트 기간에 테스터분들이 쉽게 쓰도록 넣어 둠
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; schedule(); });
window.addEventListener('appinstalled', () => { installEvt = null; toast('앱으로 설치했습니다. 홈 화면에서 ‘관리노트’를 찾아 열어 주세요'); schedule(); });
const INSTALL_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 7.5v7M9 11.5l3 3 3-3M10.5 18.5h3"/></svg>';
const SHARE_SVG = '<svg class="ib-ic" viewBox="0 0 24 24" width="18" height="18" aria-label="공유 버튼" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>';
function installPanel() {
  const memo = `<p class="tester-memo"><span class="pill tester">테스터용</span>테스트 기간에 테스터분들이 홈 화면에서 바로 열 수 있도록 넣어 둔 기능입니다.</p>`;
  let body;
  if (runningAsApp()) body = `<p class="inst-ok">${SVG_OK}<span>지금 앱으로 열려 있습니다. 설치가 끝난 상태예요.</span></p>`;
  else {
    const how = installEvt ? '누르면 바로 설치 창이 뜹니다.'
      : IS_IOS ? '아이폰·아이패드는 누르면 Safari에서 홈 화면에 추가하는 순서를 보여 드립니다.'
      : IS_ANDROID ? '누르면 설치 방법을 보여 드립니다.'
      : 'PC에서도 Chrome이나 Edge로 설치하면 창 하나로 바로 열 수 있습니다.';
    body = `<div class="inst-row"><button class="btn primary" data-act="install-app">${INSTALL_SVG}앱으로 설치</button>${memo}</div>
      <p class="hint">${how} 설치해도 내용은 지금과 같고, 업데이트는 자동으로 반영됩니다.</p>`;
  }
  return `<section class="panel install-p" id="install"><div class="ph3"><h3>앱으로 설치</h3></div>${runningAsApp() ? memo : ''}${body}</section>`;
}
function installGuide() {
  const step = (n, t) => `<li><span class="sn">${n}</span><span>${t}</span></li>`;
  let title, steps, foot = '';
  if (IS_IOS) {
    title = '아이폰에 설치하기';
    steps = [
      IS_IOS_SAFARI ? '지금처럼 <b>Safari</b>에서 이 화면을 엽니다.' : '이 화면을 <b>Safari</b>에서 엽니다. 다른 앱 안에서 열었다면 메뉴의 ‘Safari로 열기’를 눌러 주세요.',
      `화면 아래쪽(또는 위쪽)의 <b>공유 버튼</b> ${SHARE_SVG} 을 누릅니다. 보이지 않으면 <b>⋯</b> 버튼을 먼저 누르세요.`,
      '목록을 아래로 내려 <b>‘홈 화면에 추가’</b>를 누릅니다.',
      '<b>‘웹 앱으로 열기’</b>가 보이면 켜 둔 채로, 오른쪽 위 <b>‘추가’</b>를 누릅니다.'
    ];
    foot = '홈 화면의 ‘관리노트’ 아이콘으로 처음 열 때는 구글 로그인을 한 번 더 해야 할 수 있습니다.';
  } else if (IS_ANDROID) {
    title = '안드로이드에 설치하기';
    steps = [
      IS_SAMSUNG ? '이 화면을 <b>Chrome</b>에서 엽니다. 삼성 인터넷이라면 메뉴(≡)에서 홈 화면에 추가하는 항목을 눌러도 됩니다.' : '이 화면을 <b>Chrome</b>에서 엽니다.',
      '오른쪽 위 <b>⋮</b> 메뉴를 누릅니다.',
      '<b>‘앱 설치’</b> 또는 <b>‘홈 화면에 추가’</b>를 누릅니다. ‘바로가기 만들기’와 ‘설치’를 고르는 창이 나오면 <b>‘설치’</b>를 고르세요.',
      '앱 목록과 홈 화면에 생긴 <b>‘관리노트’</b>를 눌러 엽니다.'
    ];
    foot = '이미 설치했다면 메뉴에 ‘앱 열기’가 보입니다.';
  } else {
    title = 'PC에 설치하기';
    steps = [
      '이 화면을 <b>Chrome</b>이나 <b>Edge</b>에서 엽니다.',
      '주소창 오른쪽의 <b>설치 아이콘</b>을 누르거나, 메뉴(⋮ 또는 …)에서 <b>‘앱 설치’</b> 항목을 찾아 누릅니다.',
      '설치하면 바탕화면이나 시작 메뉴에서 ‘게코 관리노트’를 바로 열 수 있습니다.'
    ];
    foot = 'Mac의 Safari는 메뉴 막대의 파일 → ‘Dock에 추가’로 설치할 수 있습니다.';
  }
  openSheet(`<div class="form">${sheetHead(title)}<ol class="steps">${steps.map((t, i) => step(i + 1, t)).join('')}</ol>
    ${foot ? `<p class="hint">${foot}</p>` : ''}
    <p class="tester-memo"><span class="pill tester">테스터용</span>테스트 기간에 쉽게 설치하도록 넣어 둔 안내입니다.</p>
    <div class="sh-foot"><span class="sp"></span><button type="button" class="btn" data-act="close-sheet">닫기</button></div></div>`, {label:title});
}
async function installApp() {
  if (!installEvt) { installGuide(); return; }
  const e = installEvt;
  try {
    await e.prompt();
    const choice = await e.userChoice;
    if (choice && choice.outcome === 'accepted') installEvt = null;
  } catch { installGuide(); }
  schedule();
}
function wireSetup() {
  const f = $('#setform'); if (!f || f.dataset.w) return; f.dataset.w = 1;
  let logoPath = S.farm.logo_path || null;
  f.addEventListener('input', () => { S.setupDirty = true; });
  f.addEventListener('change', () => { S.setupDirty = true; });
  const lf = $('#s-logo');
  lf.addEventListener('change', async () => {
    const file = lf.files && lf.files[0]; if (!file) return;
    const st = $('#s-logo-st'), save = $('#s-save');
    save.disabled = true; st.textContent = '로고 올리는 중…';
    try {
      const blob = await compress(file, 800, 'image/png');
      const ext = blob.type === 'image/png' ? 'png' : 'jpg';
      const path = `${S.user.id}/logo-${Date.now()}.${ext}`;
      await q(sb.storage.from('photos').upload(path, blob, {contentType:blob.type || 'image/png', upsert:false, cacheControl:'3600'}));
      const local = URL.createObjectURL(blob); S.urls.set(path, local); logoPath = path; S.setupDirty = true;
      $('#s-logo-prev').innerHTML = `<img src="${local}" alt="">`; st.textContent = '로고를 올렸습니다. 설정 저장을 눌러야 반영됩니다.';
    } catch { st.textContent = '로고를 올리지 못했습니다. 다른 이미지로 다시 시도해 주세요.'; }
    finally { save.disabled = false; lf.value = ''; }
  });
  wireUnit(f, 's-unit', '#s-name-l', '#s-name');
  const shopSw = $('#s-shop'); shopSw.addEventListener('change', () => { $('#s-shop-f').hidden = !shopSw.checked; });
  // 키우는 종류 편집 (설정 저장을 눌러야 반영)
  const spList = farmSpecies().map(x => ({k:x.k, care:x.care, p:x.p || '', n:x.n, c:x.c}));
  const spBox = $('#sp-box');
  const spCount = k => [...S.geckos.values()].filter(g => gSp(g) === k).length;
  const drawSp = () => {
    const have = new Set(spList.map(e => e.k));
    const addOpts = Object.entries(CLASS).map(([c, t]) => `<optgroup label="${t}">${SPECIES.filter(x => x.c === c && !have.has(x.k)).map(x => `<option value="${x.k}">${esc(x.n)}</option>`).join('')}<option value="__c-${c}">직접 입력 (${t})</option></optgroup>`).join('');
    spBox.innerHTML = `<div class="feats sp-list">${spList.map((e, i) => { const x = spInfo(e), n = spCount(e.k);
      return `<div class="sp-row" data-i="${i}"><div class="ft"><b>${esc(x.n)}</b><small>${CLASS[x.c]}${x.sci ? ` · <i>${esc(x.sci)}</i>` : ''} · ${n}마리</small></div>
        <label class="sp-care"><span>크레형</span><input type="checkbox" class="sw" data-sp="care"${x.care === 'full' ? ' checked' : ''} aria-label="${esc(x.n)} 크레형 관리"></label>
        <label class="sp-pre"><span>번호 앞글자</span><input data-sp="p" value="${esc(e.p || '')}" placeholder="${esc(S.settings.codePrefix ?? DEF.codePrefix)}" autocomplete="off" maxlength="8"></label>
        ${spList.length > 1 && !n ? '<button type="button" class="icon-btn" data-sp="del">빼기</button>' : '<span></span>'}</div>`; }).join('')}</div>
      <div class="sp-add"><select id="sp-new" aria-label="추가할 종류"><option value="">+ 종류 추가하기…</option>${addOpts}</select><input id="sp-custom" placeholder="종류 이름 (예: 레드아이 트리프록)" autocomplete="off" maxlength="30" hidden><button type="button" class="btn" id="sp-add" hidden>추가</button></div>
      <p class="hint">번호 앞글자를 비워 두면 아래 ‘기록’의 개체번호 앞글자를 씁니다. 개체가 있는 종류는 뺄 수 없습니다.</p>`;
  };
  drawSp();
  spBox.addEventListener('change', ev => {
    const t = ev.target, row = t.closest('.sp-row');
    if (row && t.dataset.sp === 'care') spList[+row.dataset.i].care = t.checked ? 'full' : 'basic';
    if (t.id === 'sp-new') {
      const v = t.value, custom = v.startsWith('__c-');
      $('#sp-custom').hidden = !custom; $('#sp-add').hidden = !custom;
      if (custom) { $('#sp-custom').focus(); return; }
      if (v && SPK[v]) { spList.push({k:v, care:SPK[v].care, p:''}); drawSp(); }
    }
  });
  spBox.addEventListener('input', ev => { const t = ev.target, row = t.closest('.sp-row'); if (row && t.dataset.sp === 'p') spList[+row.dataset.i].p = t.value.trim(); });
  const addCustom = () => {
    const nm = $('#sp-custom').value.trim(), c = ($('#sp-new').value || '').replace('__c-', '');
    if (!nm || !CLASS[c]) return;
    const same = spList.find(e => spInfo(e).n === nm); if (same) { $('#sp-custom').value = ''; return; }
    spList.push({k:'x-' + rid().slice(0, 8), n:nm, c, care:'basic', p:''}); drawSp();
  };
  spBox.addEventListener('click', ev => {
    const t = ev.target, row = t.closest('.sp-row');
    if (row && t.dataset.sp === 'del') { spList.splice(+row.dataset.i, 1); S.setupDirty = true; drawSp(); }
    if (t.id === 'sp-add') addCustom();
  });
  spBox.addEventListener('keydown', ev => { if (ev.target.id === 'sp-custom' && ev.key === 'Enter') { ev.preventDefault(); addCustom(); } });
  f.querySelectorAll('input[name=s-fmode]').forEach(r => r.addEventListener('change', () => {
    const wd = (f.querySelector('input[name=s-fmode]:checked') || {}).value === 'weekdays';
    $('#s-wd-f').hidden = !wd; $('#s-days-f').hidden = wd;
  }));
  const ld = $('#s-logo-del');
  if (ld) ld.addEventListener('click', () => { logoPath = null; S.setupDirty = true; $('#s-logo-prev').innerHTML = '<span>로고 없음</span>'; $('#s-logo-st').textContent = '설정 저장을 누르면 로고가 빠집니다.'; });
  f.addEventListener('submit', async ev => {
    ev.preventDefault();
    const days = parseInt($('#s-days').value, 10), err = $('#s-err');
    const fmode = (f.querySelector('input[name=s-fmode]:checked') || {}).value || 'interval', fdays = wdRead(f, 's-wd');
    if (fmode === 'interval' && !(days >= 1 && days <= 60)) { err.textContent = '급여 확인 기준은 1~60일 사이로 입력하세요.'; err.hidden = false; return; }
    if (fmode === 'weekdays' && !fdays.length) { err.textContent = '급여 요일을 하나 이상 골라 주세요.'; err.hidden = false; return; }
    const foods = $('#s-foods').value.split(',').map(x => x.trim()).filter(Boolean);
    const ph = (f.querySelector('input[name=s-ph]:checked') || {}).value || 'logo';
    const meta = (S.user && S.user.user_metadata) || {};
    const pub = Object.fromEntries(PUBF.map(([k]) => [k, !!f.querySelector(`input[name=s-pub][value=${k}]`).checked]));
    const unit = (f.querySelector('input[name=s-unit]:checked') || {}).value || '가족';
    const fe = {...(S.farm.features || {}), unit, ...Object.fromEntries([...f.querySelectorAll('input[name=s-feat]')].map(i => [i.value, i.checked]))};
    // 데이터베이스가 2.4판 전이면(features 칸 없음) 기능 설정은 빼고 저장
    const kakao = $('#s-shop-kakao').value.trim(), link = $('#s-shop-link').value.trim();
    if (kakao && !safeUrl(kakao)) { err.textContent = '카카오톡 오픈채팅 주소를 다시 확인해 주세요. 예: https://open.kakao.com/o/…'; err.hidden = false; return; }
    if (link && !safeUrl(link)) { err.textContent = '스토어·홈페이지 주소를 다시 확인해 주세요.'; err.hidden = false; return; }
    fe.shop = {on:shopSw.checked, board:$('#s-shop-board').checked, intro:$('#s-shop-intro').value.trim(), kakao:kakao ? safeUrl(kakao) : '', insta:$('#s-shop-insta').value.trim(), phone:$('#s-shop-phone').value.trim(), link:link ? safeUrl(link) : ''};
    fe.species = spList.map(e => { const o = {k:e.k, care:e.care === 'full' ? 'full' : 'basic'}; if (e.p) o.p = e.p; if (!SPK[e.k]) { o.n = e.n; o.c = e.c; } return o; });
    const features = S.farm.features === undefined ? {} : {features:fe};
    const btn = $('#s-save'); btn.disabled = true; btn.textContent = '저장 중…';
    try {
      const old = S.farm.logo_path;
      await q(sb.from('farms').update({
        name:$('#s-name').value.trim() || '우리 게코', logo_path:logoPath, placeholder:ph, ...features,
        placeholder_url:ph === 'google' ? (meta.avatar_url || meta.picture || null) : null,
        public_defaults:pub, feed_alert_days:days >= 1 && days <= 60 ? days : (S.settings.feedAlertDays || 3), feed_mode:fmode, feed_days:fdays, code_prefix:$('#s-prefix').value.trim(), foods:foods.length ? foods : DEF.foods,
        updated_at:new Date().toISOString()
      }).eq('id', S.farm.id));
      if (old && old !== logoPath) sb.storage.from('photos').remove([old]).catch(() => {});
      S.setupDirty = false; S.shop.delete(S.farm.id); S.board = null; toast('설정을 저장했습니다'); await refresh();
    } catch (e) { err.textContent = errMsg(e); err.hidden = false; btn.disabled = false; btn.textContent = '설정 저장'; }
  });
}
async function makeInvite() {
  const role = ($('#inv-role') || {}).value || 'keeper';
  const code = (rid() + rid()).slice(0, 16);
  try {
    await q(sb.from('farm_invites').insert({code, farm_id:S.farm.id, role}));
    openInviteSheet(code, role); refresh();
  } catch (e) { toast(errMsg(e), 'bad'); }
}
function inviteMessage(code, role) {
  const mine = S.members.find(m => m.user_id === (S.user && S.user.id));
  const from = (mine && (mine.display_name || mine.email)) || '';
  return `[${S.farm.name} 초대장]\n${from ? `${from}님이 ` : ''}${S.farm.name} 관리노트에 ${ROLE_RO[role]} 초대했습니다.\n아래 링크를 눌러 구글 계정으로 로그인하면 바로 참여할 수 있어요. (7일 동안 한 번 사용 가능)\n${inviteLink(code)}\n\n휴대폰 앱처럼 쓰려면 로그인 후 설정 맨 아래 ‘앱으로 설치’를 눌러 주세요.`;
}
function openInviteSheet(code, role) {
  const msg = inviteMessage(code, role);
  const sh = openSheet(`<div class="form">${sheetHead(`${esc(S.farm.name)} 초대장`)}
    <p><b>${ROLE[role]}</b> 권한으로 초대하는 초대장입니다. 아래 문구를 그대로 카카오톡이나 문자로 보내 주세요.</p>
    <textarea id="inv-msg" rows="5" readonly class="inv-msg">${esc(msg)}</textarea>
    <div class="actions">${navigator.share ? '<button type="button" class="btn primary" id="inv-share">초대장 보내기</button>' : ''}<button type="button" class="btn${navigator.share ? '' : ' primary'}" id="inv-copy">초대 문구 복사</button><button type="button" class="btn" id="inv-copy-link">링크만 복사</button></div>
    <input id="inv-link" class="vh" readonly value="${esc(inviteLink(code))}" tabindex="-1">
    <p class="hint">링크를 열면 ‘${esc(S.farm.name)} 초대장’ 화면이 보내는 분 이름과 함께 열립니다. 7일 동안 한 번만 쓸 수 있습니다.</p>
    <p class="hint">구글 로그인이 ‘테스트’ 상태라면 받는 분의 구글 계정을 Google Cloud 콘솔의 테스트 사용자에 먼저 추가해 주세요.</p>
    <div class="sh-foot"><span class="sp"></span><button type="button" class="btn" data-act="close-sheet">닫기</button></div></div>`, {label:'초대장'});
  sh.querySelector('#inv-copy').addEventListener('click', () => copyText(sh.querySelector('#inv-msg'), '초대 문구를 복사했습니다'));
  sh.querySelector('#inv-copy-link').addEventListener('click', () => copyText(sh.querySelector('#inv-link')));
  const shb = sh.querySelector('#inv-share');
  if (shb) shb.addEventListener('click', async () => {
    try { await navigator.share({title:`${S.farm.name} 초대장`, text:msg}); }
    catch (e) { if (e && e.name !== 'AbortError') copyText(sh.querySelector('#inv-msg'), '초대 문구를 복사했습니다'); }
  });
}
async function copyText(input, msg = '링크를 복사했습니다') {
  try { await navigator.clipboard.writeText(input.value); toast(msg); }
  catch { input.focus(); input.select(); toast('링크를 선택했습니다. 길게 눌러 복사하세요.'); }
}

/* ---------- labels ---------- */
function vLabels() {
  if (!S.loaded.g) return loadingHTML();
  const list = [...S.geckos.values()].filter(g => S.labAll ? gStatus(g) !== 'ref' : gStatus(g) === 'active').sort(byCode);
  let h = `<a class="back" href="#list">← 개체 목록</a><div class="vhead"><div><h1 class="vtitle">QR 라벨</h1><p class="vsub">A4 한 장에 24칸(3×8) 라벨을 이미지로 만듭니다. 잘라서 사육장에 붙이고, 휴대폰 카메라로 찍으면 해당 개체 화면이 열립니다.</p></div></div>`;
  h += `<section class="panel"><div class="ph3"><h3>라벨에 넣을 개체</h3><div class="acts">
      <button class="btn small" data-act="lab-all">전체 선택</button><button class="btn small" data-act="lab-none">선택 해제</button>
      <button class="btn small" data-act="lab-scope" aria-pressed="${S.labAll}">분양·사망 개체도 보기</button></div></div>
    ${list.length ? `<div class="lab-list">${list.map(g => `<label class="lab-item"><input type="checkbox" data-chg="lab" data-id="${g.id}"${S.labSel.has(g.id) ? ' checked' : ''}><span><span class="mono">${esc(g.code || '번호 없음')}</span> ${esc(g.name || g.morph || '')}</span></label>`).join('')}</div>` : '<p class="muted">등록된 개체가 없습니다.</p>'}
    <div class="actions"><button class="btn primary" data-act="lab-make"${S.labSel.size ? '' : ' disabled'}>선택한 ${S.labSel.size}마리 라벨 만들기</button></div></section>`;
  if (S.labOut.length) h += `<section class="panel"><div class="ph3"><h3>만든 라벨</h3><span class="hint">${S.labOut.length}장</span></div><div class="lab-out">${S.labOut.map((p, i) => `<div class="lab-page"><img src="${p.url}" alt="라벨 ${i + 1}쪽 미리보기"><button class="btn small" data-act="lab-save" data-i="${i}">${S.labOut.length > 1 ? `${i + 1}쪽 ` : ''}이미지로 저장</button></div>`).join('')}</div>
    <p class="hint">저장한 이미지를 A4 용지에 실제 크기(100%)로 인쇄하세요. 휴대폰에서 저장이 안 되면 미리보기 이미지를 길게 눌러 저장할 수 있습니다.</p></section>`;
  return h;
}

/* ---------- sheets, toast ---------- */
const sheets = [];
function openSheet(html, {label = '입력'} = {}) {
  const bd = document.createElement('div'); bd.className = 'backdrop';
  bd.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1">${html}</div>`;
  bd.addEventListener('pointerdown', e => { bd._down = e.target === bd; });
  bd.addEventListener('click', e => { if (e.target === bd && bd._down) closeSheet(bd); });
  document.body.appendChild(bd); sheets.push(bd);
  document.body.style.overflow = 'hidden';
  const sh = bd.firstElementChild;
  setTimeout(() => {
    const f = sh.querySelector('input:not([type=hidden]):not([hidden]):not([readonly]),select,textarea');
    (f && matchMedia('(min-width:700px)').matches ? f : sh).focus({preventScroll:true});
  }, 30);
  return sh;
}
function closeSheet(bd) {
  bd = bd || sheets[sheets.length - 1]; if (!bd) return;
  const i = sheets.indexOf(bd); if (i >= 0) sheets.splice(i, 1);
  bd.remove(); if (bd._onclose) bd._onclose();
  if (!sheets.length) document.body.style.overflow = '';
}
function confirmSheet(title, body, ok = '확인', danger = false) {
  return new Promise(res => {
    const sh = openSheet(`<div class="form"><div class="sh-head"><h2>${esc(title)}</h2></div><p>${body}</p><div class="sh-foot"><span class="sp"></span><button type="button" class="btn" data-x="no">취소</button><button type="button" class="btn ${danger ? 'solid-bad' : 'primary'}" data-x="yes">${esc(ok)}</button></div></div>`, {label:title});
    const bd = sh.parentElement; let done = false;
    const fin = v => { if (done) return; done = true; closeSheet(bd); res(v); };
    sh.querySelector('[data-x=no]').onclick = () => fin(false);
    sh.querySelector('[data-x=yes]').onclick = () => fin(true);
    bd._onclose = () => { if (!done) { done = true; res(false); } };
  });
}
let toastT;
function toast(msg, kind) { const t = $('#toast'); t.textContent = msg; t.className = kind || ''; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2800); }
const sheetHead = t => `<div class="sh-head"><h2>${t}</h2><button type="button" class="icon-btn" data-act="close-sheet">닫기</button></div>`;
const seg = (name, opts, cur) => `<div class="seg radio" role="radiogroup">${Object.entries(opts).map(([k, v]) => `<label><input type="radio" name="${name}" value="${k}"${cur === k ? ' checked' : ''}><span>${v}</span></label>`).join('')}</div>`;
const isMaleish = x => ['m', 'pm', 'u'].includes(x.sex || 'u');
const isFemaleish = x => ['f', 'pf', 'u'].includes(x.sex || 'u');
function geckoOptions(fn, cur, excludeId) {
  return [...S.geckos.values()].filter(x => x.id !== excludeId && (fn(x) || x.id === cur)).sort(byCode)
    .map(x => `<option value="id:${x.id}"${cur === x.id ? ' selected' : ''}>${esc(gLabel(x))}${x.morph ? ' · ' + esc(x.morph) : ''}${multiSp() ? ' · ' + esc(spOf(x).n) : ''}${gStatus(x) !== 'active' ? ` (${STATUS[gStatus(x)]})` : ''}</option>`).join('');
}
function busy(btn, on, txt) { btn.disabled = on; if (on) { btn.dataset.t = btn.textContent; btn.textContent = txt || '저장 중…'; } else if (btn.dataset.t) btn.textContent = btn.dataset.t; }
function showErr(sh, msg) { const e = sh.querySelector('.err'); e.textContent = msg; e.hidden = false; e.scrollIntoView({block:'nearest'}); }
const fval = (sh, id) => ((sh.querySelector('#' + id) || {}).value || '').trim();

/* ---------- gecko form ---------- */
async function compress(file, max = 1400, type = 'image/jpeg') {
  try {
    let src;
    try { src = await createImageBitmap(file, {imageOrientation:'from-image'}); }
    catch { src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); }); }
    const k = Math.min(1, max / Math.max(src.width, src.height));
    const c = document.createElement('canvas'); c.width = Math.round(src.width * k); c.height = Math.round(src.height * k);
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    const b = await new Promise(r => c.toBlob(r, type, 0.86));
    if (b) return b;
  } catch {}
  return file;
}
function openGeckoForm(id, pre = {}) {
  const g = id ? G(id) : null;
  if (id && !g) return;
  const isRef = g ? gStatus(g) === 'ref' : pre.status === 'ref';
  // 종류: 수정이면 그대로, 새 개체면 부모 → 직전에 고른 종류 → 첫 번째 종류 순서로 정함
  const sps = farmSpecies(), showSp = multiSp();
  const parentSp = [pre.sireId, pre.damId].map(G).filter(Boolean).map(gSp)[0];
  const lastSp = lsGet('gk.sp');
  const spk0 = g ? gSp(g) : pre.species || parentSp || (sps.some(x => x.k === lastSp) ? lastSp : sps[0].k);
  const v = g ? {...g} : {code:pre.status === 'ref' ? '' : nextCode(spk0), sex:'u', source:pre.status === 'ref' ? 'other' : 'buy', ...pre, species:spk0};
  const gid = id || rid();
  let photo = v.photo || null, uploading = false, curSp = spk0, autoCode = g ? null : v.code;
  const sameSp = x => !showSp || gSp(x) === curSp;
  const spOpts = () => {
    const list = [...sps]; if (!list.some(x => x.k === curSp)) list.push(spOf(v));
    return Object.entries(CLASS).map(([c, t]) => { const xs = list.filter(x => x.c === c); return xs.length ? `<optgroup label="${t}">${xs.map(x => `<option value="${esc(x.k)}"${x.k === curSp ? ' selected' : ''}>${esc(x.n)}</option>`).join('')}</optgroup>` : ''; }).join('');
  };
  const parentOpts = w => { const isS = w === 'sire', cur = v[w + 'Id'] ? 'id:' + v[w + 'Id'] : v[w + 'Ext'] ? 'ext' : '';
    return `<option value="">미상</option>${geckoOptions(x => (isS ? isMaleish(x) : isFemaleish(x)) && sameSp(x), v[w + 'Id'], id)}<option value="ext"${cur === 'ext' ? ' selected' : ''}>이름만 적기 (직접 입력)</option>${feat('ref') ? '<option value="__new">+ 새 혈관리용 개체 등록 (조부모까지 이을 때)</option>' : ''}`; };
  const morphList = () => (MORPH_FOR[curSp] || []).map(m => `<option value="${m}"></option>`).join('');
  const feedMode0 = v.feedDays && v.feedDays.length ? 'wd' : v.feedEvery ? 'every' : 'def';
  const defFeedText = () => fullCare({species:curSp})
    ? (S.settings.feedMode === 'weekdays' && S.settings.feedDays.length ? `지금 기본: ${wdText(S.settings.feedDays)}` : `지금 기본: ${Number(S.settings.feedAlertDays) || DEF.feedAlertDays}일마다 확인`)
    : '기본 관리 종류라서 급여 알림 없이 기록만 남깁니다.';
  const parentField = w => {
    const cur = v[w + 'Id'] ? 'id:' + v[w + 'Id'] : v[w + 'Ext'] ? 'ext' : '', isS = w === 'sire';
    return `<div class="field"><label for="f-${w}">${isS ? '부 (아빠)' : '모 (엄마)'}</label><select id="f-${w}" data-ext="f-${w}-ext" data-role="${w}">${parentOpts(w)}</select>
      <input id="f-${w}-ext" placeholder="${isS ? '예: OO파충류 수컷, 릴리화이트' : '예: OO파충류 암컷, 할리퀸'}" value="${esc(v[w + 'Ext'] || '')}" autocomplete="off"${cur === 'ext' ? '' : ' hidden'}></div>`;
  };
  const sh = openSheet(`<form class="form" id="gform" novalidate>${sheetHead(g ? '개체 정보 수정' : isRef ? '혈관리용 개체 등록' : '개체 등록')}
    ${isRef && !g ? `<p class="who">내 개체가 아니라 혈통도를 잇기 위한 개체입니다(예: 부모의 부모). 보유 목록·급여 알림·분양 목록에는 나오지 않고, 혈통도와 마인드맵에만 쓰입니다. 이 개체의 부모도 이어서 지정할 수 있습니다.</p>` : ''}
    <div class="photo-pick"><div class="pp-prev" id="pp-prev">${photoUrl(v) ? `<img src="${esc(photoUrl(v))}" alt="">` : '<span>사진 없음</span>'}</div>
      <div class="pp-ctl"><label class="btn small" for="f-photo">${photo ? '사진 바꾸기' : '사진 선택'}</label><input id="f-photo" type="file" accept="image/*" hidden><p class="hint" id="pp-st">휴대폰에서는 바로 촬영할 수도 있습니다.</p></div></div>
    <div class="grid2"><div class="field"><label for="f-code">개체번호</label><input id="f-code" value="${esc(v.code || '')}" autocomplete="off" placeholder="${isRef ? '선택 (예: 브리더 개체번호)' : '예: CR-001'}"></div>
      <div class="field"><label for="f-name">이름(애칭)</label><input id="f-name" value="${esc(v.name || '')}" autocomplete="off" placeholder="선택"></div></div>
    ${showSp ? `<div class="field"><label for="f-sp">종류</label><select id="f-sp">${spOpts()}</select><p class="hint" id="f-sp-h">${esc(CARE[spOf(v).care])} · ${esc(CLASS[spOf(v).c])}</p></div>` : ''}
    <div class="field"><label for="f-morph">모프</label><input id="f-morph" list="morph-list" value="${esc(v.morph || '')}" autocomplete="off" placeholder="${curSp === 'crested' ? '예: 할리퀸 핀스트라이프' : '예: 노멀, 알비노'}"><datalist id="morph-list">${morphList()}</datalist></div>
    <div class="grid2"><div class="field"><label for="f-sex">성별</label><select id="f-sex">${Object.entries(SEX).map(([k, s]) => `<option value="${k}"${(v.sex || 'u') === k ? ' selected' : ''}>${s.t}</option>`).join('')}</select></div>
      <div class="field"><label for="f-sexat">성별 확인일</label><input id="f-sexat" type="date" value="${esc(v.sexAt || '')}"></div></div>
    <div class="grid2"><div class="field"><label for="f-hmode">해칭일</label><select id="f-hmode">${Object.entries(HATCHM).map(([k, t]) => `<option value="${k}"${hatchMode(v) === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="field" id="f-hatch-f"${hatchMode(v) === 'unknown' ? ' hidden' : ''}><label for="f-hatch">${hatchMode(v) === 'approx' ? '대략적인 날짜' : '날짜'}</label><input id="f-hatch" type="date" value="${esc(v.hatchDate || '')}"></div>
      <p class="hint" id="f-hatch-u"${hatchMode(v) === 'unknown' ? '' : ' hidden'}>택 분실 등으로 해칭일을 모를 때 고릅니다. 나이는 표시되지 않습니다.</p></div>
    <div class="grid2"><div class="field"><label for="f-acq">입양일</label><input id="f-acq" type="date" value="${esc(v.acquiredDate || '')}"></div>
      <div class="field"><label for="f-src">출처</label><select id="f-src">${Object.entries(SRC).map(([k, t]) => `<option value="${k}"${(v.source || 'buy') === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="grid2"><div class="field"><label for="f-srcn">입양처 · 비고</label><input id="f-srcn" value="${esc(v.sourceNote || '')}" autocomplete="off"></div>
      ${isRef || !feat('ledger') ? '' : `<div class="field"><label for="f-price">입양가 (원)</label><input id="f-price" inputmode="numeric" autocomplete="off" placeholder="선택" value="${v.acquiredPrice ? Number(v.acquiredPrice).toLocaleString('ko-KR') : ''}"><p class="hint">가계부에 ‘개체 입양’ 지출로 들어갑니다.</p></div>`}</div>
    <fieldset class="fs"><legend>혈통 (부모)</legend>${parentField('sire')}${parentField('dam')}<p class="hint">목록에 있는 개체를 고르면 조부모까지 혈통도가 이어집니다.</p></fieldset>
    ${g ? `<div class="field"><label for="f-status">상태</label><select id="f-status">${Object.entries(STATUS_OPT).filter(([k]) => k !== 'ref' || feat('ref') || gStatus(g) === 'ref').map(([k, t]) => `<option value="${k}"${gStatus(g) === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="field" id="f-died-f"${gStatus(g) === 'dead' ? '' : ' hidden'}><label for="f-died">사망일</label><input id="f-died" type="date" value="${esc(v.diedAt || '')}" max="${today()}">${feat('report') ? '<p class="hint">신고 도우미가 폐사 신고 기한(30일)을 계산합니다.</p>' : ''}</div>` : ''}
    <div class="field"><label for="f-notes">메모</label><textarea id="f-notes" rows="3">${esc(v.notes || '')}</textarea></div>
    ${isRef ? '' : `<fieldset class="fs"><legend>급여 확인</legend>
      <div class="seg radio">${[['def', '기본 설정'], ['wd', '요일 지정'], ['every', '며칠마다']].map(([k, t]) => `<label><input type="radio" name="f-fm" value="${k}"${feedMode0 === k ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div>
      <p class="hint" id="f-fdef-h"${feedMode0 === 'def' ? '' : ' hidden'}>${defFeedText()}</p>
      <div id="f-fdays"${feedMode0 === 'wd' ? '' : ' hidden'}>${wdPicker('f-wd', v.feedDays || S.settings.feedDays)}<p class="hint">해츨링처럼 이 개체만 급여 요일이 다를 때 고릅니다. 매일 급여면 모든 요일을 고르세요.</p></div>
      <div class="field" id="f-every-f"${feedMode0 === 'every' ? '' : ' hidden'}><label for="f-every">며칠마다 (일)</label><input id="f-every" type="number" min="1" max="90" inputmode="numeric" value="${esc(v.feedEvery || '')}" placeholder="예: 10"><p class="hint">뱀처럼 급여 간격이 긴 개체에 씁니다. 마지막 급여 후 이 날수가 지나면 알려 드립니다.</p></div>
    </fieldset>`}
    <fieldset class="fs"><legend>QR 공개 카드</legend>
      <label class="check"><input type="checkbox" id="f-pubon"${v.publicOn === false ? '' : ' checked'}><span>QR 공개 카드 사용<small>끄면 로그인한 ${U()} 구성원만 볼 수 있습니다.</small></span></label>
      <p class="hint">항상 공개: 사진, 개체번호, 이름, 모프, 성별</p>
      <label class="check"><input type="checkbox" id="f-pubdef"${v.publicFields ? '' : ' checked'}><span>기본 공개 설정 따르기<small>설정 화면의 공개 카드 기본값을 그대로 씁니다.</small></span></label>
      <div class="pubgrid" id="f-pubf"${v.publicFields ? '' : ' hidden'}>${PUBF.map(([k, t]) => `<label class="check"><input type="checkbox" name="pf" value="${k}"${pubVis(v)[k] ? ' checked' : ''}><span>${pubT(k, t)}</span></label>`).join('')}</div>
      <p class="hint">분양받은 분의 연락처는 어떤 설정으로도 공개되지 않습니다.</p>
    </fieldset>
    <p class="err" hidden></p>
    <div class="sh-foot">${g ? '<button type="button" class="btn danger" id="f-del">삭제</button>' : ''}<span class="sp"></span><button type="button" class="btn" data-act="close-sheet">취소</button><button type="submit" class="btn primary" id="f-save">저장</button></div></form>`, {label:g ? '개체 정보 수정' : '개체 등록'});
  sh.querySelectorAll('select[data-ext]').forEach(s => {
    s.dataset.prev = s.value;
    s.addEventListener('change', () => {
      if (s.value === '__new') {
        const role = s.dataset.role;
        s.value = s.dataset.prev;
        openGeckoForm(null, {status:'ref', species:curSp, sex:role === 'sire' ? 'm' : 'f', onCreated:nid => {
          const ng = G(nid); if (!ng) return;
          const o = document.createElement('option'); o.value = 'id:' + nid; o.textContent = `${gLabel(ng)}${ng.morph ? ' · ' + ng.morph : ''} (혈관리용)`;
          s.insertBefore(o, s.querySelector('option[value=ext]')); s.value = o.value; s.dataset.prev = o.value;
          sh.querySelector('#' + s.dataset.ext).hidden = true;
        }});
        return;
      }
      s.dataset.prev = s.value;
      const x = sh.querySelector('#' + s.dataset.ext); x.hidden = s.value !== 'ext'; if (!x.hidden) x.focus();
    });
  });
  const hm = sh.querySelector('#f-hmode');
  hm.addEventListener('change', () => {
    sh.querySelector('#f-hatch-f').hidden = hm.value === 'unknown'; sh.querySelector('#f-hatch-u').hidden = hm.value !== 'unknown';
    sh.querySelector('label[for=f-hatch]').textContent = hm.value === 'approx' ? '대략적인 날짜' : '날짜';
  });
  const fmode = () => (sh.querySelector('input[name=f-fm]:checked') || {}).value || 'def';
  sh.querySelectorAll('input[name=f-fm]').forEach(r => r.addEventListener('change', () => {
    const m = fmode(); sh.querySelector('#f-fdef-h').hidden = m !== 'def'; sh.querySelector('#f-fdays').hidden = m !== 'wd'; sh.querySelector('#f-every-f').hidden = m !== 'every';
  }));
  const spSel = sh.querySelector('#f-sp');
  if (spSel) spSel.addEventListener('change', () => {
    curSp = spSel.value; const sp = spOf({species:curSp});
    sh.querySelector('#f-sp-h').textContent = `${CARE[sp.care]} · ${CLASS[sp.c]}`;
    sh.querySelector('#morph-list').innerHTML = morphList();
    sh.querySelector('#f-morph').placeholder = curSp === 'crested' ? '예: 할리퀸 핀스트라이프' : '예: 노멀, 알비노';
    const dh = sh.querySelector('#f-fdef-h'); if (dh) dh.textContent = defFeedText();
    const code = sh.querySelector('#f-code');
    if (autoCode !== null && code.value === autoCode) { autoCode = nextCode(curSp); code.value = autoCode; }
    sh.querySelectorAll('select[data-ext]').forEach(sel => { const keep = sel.value; sel.innerHTML = parentOpts(sel.dataset.role); if ([...sel.options].some(o => o.value === keep)) sel.value = keep; sel.dataset.prev = sel.value; });
  });
  const fst = sh.querySelector('#f-status');
  if (fst) fst.addEventListener('change', () => { const dead = fst.value === 'dead'; sh.querySelector('#f-died-f').hidden = !dead; const di = sh.querySelector('#f-died'); if (dead && !di.value) di.value = today(); });
  const pd = sh.querySelector('#f-pubdef');
  pd.addEventListener('change', () => { sh.querySelector('#f-pubf').hidden = pd.checked; });
  const fp = sh.querySelector('#f-photo');
  if (fp) fp.addEventListener('change', async () => {
    const file = fp.files && fp.files[0]; if (!file) return;
    const st = sh.querySelector('#pp-st'), save = sh.querySelector('#f-save');
    uploading = true; save.disabled = true; st.textContent = '사진 올리는 중…';
    try {
      const blob = await compress(file);
      if (blob.size > 15 * 1024 * 1024) throw new Error('too_large');
      const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${S.user.id}/${gid}-${Date.now()}.${ext}`;
      await q(sb.storage.from('photos').upload(path, blob, {contentType:blob.type || 'image/jpeg', upsert:false, cacheControl:'3600'}));
      const local = URL.createObjectURL(blob);
      S.urls.set(path, local); photo = path;
      sh.querySelector('#pp-prev').innerHTML = `<img src="${local}" alt="">`;
      st.textContent = '사진을 올렸습니다. 저장을 눌러야 반영됩니다.';
    } catch (e) {
      st.textContent = /too_large|exceeded|size/i.test(String(e && e.message)) ? '사진이 너무 큽니다. 다른 사진을 골라 주세요.' : /mime|type/i.test(String(e && e.message)) ? '이 형식의 사진은 올릴 수 없습니다. JPG나 PNG로 골라 주세요.' : '사진을 올리지 못했습니다. 다시 시도해 주세요.';
    } finally { uploading = false; save.disabled = false; fp.value = ''; }
  });
  sh.querySelector('#gform').addEventListener('submit', async ev => {
    ev.preventDefault(); if (uploading) return;
    const sp = fval(sh, 'f-sire'), dp = fval(sh, 'f-dam');
    const row = {
      code:fval(sh, 'f-code'), name:fval(sh, 'f-name'), morph:fval(sh, 'f-morph'), sex:fval(sh, 'f-sex') || 'u', sex_at:fval(sh, 'f-sexat') || null,
      hatch_mode:fval(sh, 'f-hmode') || 'exact', hatch_date:fval(sh, 'f-hmode') === 'unknown' ? null : (fval(sh, 'f-hatch') || null), acquired_date:fval(sh, 'f-acq') || null, source:fval(sh, 'f-src'), source_note:fval(sh, 'f-srcn'),
      sire_id:sp.startsWith('id:') ? sp.slice(3) : null, sire_ext:sp === 'ext' ? fval(sh, 'f-sire-ext') : '',
      dam_id:dp.startsWith('id:') ? dp.slice(3) : null, dam_ext:dp === 'ext' ? fval(sh, 'f-dam-ext') : '',
      notes:sh.querySelector('#f-notes').value.trim(), photo_path:photo || null, updated_at:new Date().toISOString(),
      public_on:sh.querySelector('#f-pubon').checked,
      feed_days:(!isRef && fmode() === 'wd' && wdRead(sh, 'f-wd').length) ? wdRead(sh, 'f-wd') : null,
      public_fields:pd.checked ? null : Object.fromEntries(PUBF.map(([k]) => [k, !!sh.querySelector(`input[name=pf][value=${k}]`).checked]))
    };
    if (row.hatch_mode === 'approx' && !row.hatch_date) return showErr(sh, '대략적인 해칭일을 골라 주세요. 모르면 ‘알 수 없음’을 고르세요.');
    if (!isRef && fmode() === 'wd' && !row.feed_days) return showErr(sh, '급여 요일을 하나 이상 골라 주세요.');
    const every = parseInt(fval(sh, 'f-every'), 10);
    if (!isRef && fmode() === 'every' && !(every >= 1 && every <= 90)) return showErr(sh, '급여 간격은 1~90일 사이로 입력해 주세요.');
    row.species = curSp;
    row.feed_every = !isRef && fmode() === 'every' ? every : null;
    if (isRef && g) row.feed_every = g.feedEvery || null;
    const priceIn = sh.querySelector('#f-price');
    if (priceIn) {
      const pv = priceIn.value.replace(/[^0-9]/g, ''), price = pv ? parseInt(pv, 10) : null;
      if (price != null || (v.acquiredPrice != null)) row.acquired_price = price;
    }
    if (!row.code && !row.name) return showErr(sh, '개체번호나 이름 중 하나는 입력해 주세요.');
    if (row.code) { const dup = [...S.geckos.values()].find(x => x.id !== id && (x.code || '').toLowerCase() === row.code.toLowerCase()); if (dup) return showErr(sh, `개체번호 ${row.code}는 이미 ${gTitle(dup)}에게 쓰이고 있습니다.`); }
    if (row.sire_id && row.sire_id === row.dam_id) return showErr(sh, '부와 모가 같은 개체입니다.');
    if (g) {
      row.status = fval(sh, 'f-status') || gStatus(g);
      if (row.status === 'dead') row.died_at = fval(sh, 'f-died') || today();
      else if (g.diedAt) row.died_at = null;
      if (row.status !== 'active' && g.listing) row.listing = null;
    }
    const btn = sh.querySelector('#f-save'); busy(btn, true);
    try {
      lsSet('gk.sp', curSp);
      if (g) {
        await saveGeckoRow(row, r => sb.from('geckos').update(r).eq('id', id));
        if (g.photo && g.photo !== photo) sb.storage.from('photos').remove([g.photo]).catch(() => {});
        closeSheet(); toast('저장했습니다'); await refresh();
      } else {
        await saveGeckoRow(row, r => sb.from('geckos').insert({id:gid, farm_id:S.farm.id, ...r, status:pre.status === 'ref' ? 'ref' : 'active'}));
        if (pre.fromClutch) await linkHatch(pre.fromClutch, gid, row.hatch_date);
        if (pre.onCreated) { closeSheet(); toast('혈관리용 개체를 등록했습니다'); await refresh(); pre.onCreated(gid); return; }
        closeSheet(); toast('개체를 등록했습니다'); await refresh(); go('g-' + gid);
      }
    } catch (e) { busy(btn, false); showErr(sh, errMsg(e)); }
  });
  const del = sh.querySelector('#f-del');
  if (del) del.addEventListener('click', async () => {
    const ok = await confirmSheet('개체를 삭제할까요?', `<b>${esc(gLabel(g))}</b>의 정보와 무게·급여 등 모든 기록이 지워지며 되돌릴 수 없습니다. 분양했다면 삭제하지 말고 <b>분양 처리</b>를 하세요.`, '삭제', true);
    if (!ok) return;
    busy(del, true, '삭제 중…');
    try {
      const label = gLabel(g);
      await q(sb.from('geckos').update({sire_id:null, sire_ext:label}).eq('sire_id', id));
      await q(sb.from('geckos').update({dam_id:null, dam_ext:label}).eq('dam_id', id));
      await q(sb.from('geckos').delete().eq('id', id));
      if (g.photo) sb.storage.from('photos').remove([g.photo]).catch(() => {});
      closeSheet(); toast('삭제했습니다'); await refresh(); go('list');
    } catch (e) { busy(del, false); showErr(sh, errMsg(e)); }
  });
}

// 데이터베이스를 아직 2.5판으로 올리지 않았으면(종류·급여 간격 칸 없음) 그 두 칸을 빼고 다시 저장
async function saveGeckoRow(row, op) {
  try { await q(op(row)); }
  catch (e) {
    const m = String((e && (e.message || e.details)) || '');
    if (!(e && e.code === 'PGRST204') && !/species|feed_every/.test(m)) throw e;
    if (row.species && row.species !== 'crested') throw e;
    const r2 = {...row}; delete r2.species; delete r2.feed_every; S.oldCols = true;
    await q(op(r2));
  }
}

/* ---------- log form ---------- */
function openLogForm(t, gids, entry) {
  gids = gids.filter(i => G(i)); if (!gids.length || !LOGT[t]) return;
  const e = entry || {}, multi = gids.length > 1;
  const foods = [...new Set([...new Set(gids.map(i => gSp(G(i))))].flatMap(k => spFoods(spOf({species:k}))))];
  const remembered = lsGet('gk.food');
  const custom = !!(e.food && !foods.includes(e.food));
  const curFood = e.food || (foods.includes(remembered) ? remembered : foods[0]);
  const who = multi ? `<b>${gids.length}마리</b> · ${gids.map(i => esc(G(i).code || gTitle(G(i)))).join(', ')}` : esc(gLabel(G(gids[0])));
  let f = '';
  if (t === 'weight') { const lw = !multi && !entry && G(gids[0]).last && G(gids[0]).last.weight; f = `<div class="field"><label for="l-g">무게 (g)</label><input id="l-g" type="number" inputmode="decimal" step="0.1" min="0" value="${e.g ?? ''}" placeholder="예: 35.2">${lw ? `<p class="hint">직전 기록: ${fmtG(lw.g)} g (${fmtD(lw.d)})</p>` : ''}</div>`; }
  if (t === 'feed') f = `<div class="field"><label for="l-food">먹이</label><select id="l-food">${foods.map(x => `<option${!custom && curFood === x ? ' selected' : ''}>${esc(x)}</option>`).join('')}<option value="__c"${custom ? ' selected' : ''}>직접 입력</option></select><input id="l-food-c" placeholder="먹이 이름" autocomplete="off" value="${custom ? esc(e.food) : ''}"${custom ? '' : ' hidden'}></div><div class="field"><span class="lbl">먹은 양</span>${seg('l-ate', ATE, e.ate || 'all')}</div>`;
  if (t === 'shed') f = `<div class="field"><span class="lbl">탈피 상태</span>${seg('l-q', SHEDQ, e.q || 'ok')}</div>`;
  if (t === 'poop') f = `<div class="field"><span class="lbl">배변 상태</span>${seg('l-q', POOPQ, e.q || 'ok')}</div>`;
  const sh = openSheet(`<form class="form" id="lform" novalidate>${sheetHead(`${LOGT[t]} ${entry ? '기록 수정' : '기록'}`)}
    <p class="who">${who}</p>
    <div class="field"><label for="l-d">날짜</label><input id="l-d" type="date" value="${esc(e.d || today())}" max="${today()}"></div>
    ${f}
    <div class="field"><label for="l-n">${t === 'note' ? '메모' : '메모 (선택)'}</label><textarea id="l-n" rows="${t === 'note' ? 4 : 2}">${esc(e.n || '')}</textarea></div>
    <p class="err" hidden></p>
    <div class="sh-foot">${entry ? '<button type="button" class="btn danger" id="l-del">기록 삭제</button>' : ''}<span class="sp"></span><button type="button" class="btn" data-act="close-sheet">취소</button><button type="submit" class="btn primary" id="l-save">저장</button></div></form>`, {label:`${LOGT[t]} 기록`});
  const fs = sh.querySelector('#l-food');
  if (fs) fs.addEventListener('change', () => { const c = sh.querySelector('#l-food-c'); c.hidden = fs.value !== '__c'; if (!c.hidden) c.focus(); });
  sh.querySelector('#lform').addEventListener('submit', async ev => {
    ev.preventDefault();
    const d = fval(sh, 'l-d'); if (!d) return showErr(sh, '날짜를 입력해 주세요.');
    const n = sh.querySelector('#l-n').value.trim();
    const ent = {t, d}; if (n) ent.n = n;
    if (t === 'weight') { const gv = parseFloat(fval(sh, 'l-g')); if (!(gv > 0 && gv < 1000)) return showErr(sh, '무게를 g 단위 숫자로 입력해 주세요.'); ent.g = Math.round(gv * 10) / 10; }
    if (t === 'feed') {
      const sel = fs.value; ent.food = sel === '__c' ? fval(sh, 'l-food-c') : sel;
      ent.ate = (sh.querySelector('input[name=l-ate]:checked') || {}).value || 'all';
      if (sel !== '__c') lsSet('gk.food', sel);
    }
    if (t === 'shed' || t === 'poop') ent.q = (sh.querySelector('input[name=l-q]:checked') || {}).value || 'ok';
    if (t === 'note' && !n) return showErr(sh, '메모 내용을 입력해 주세요.');
    const btn = sh.querySelector('#l-save'); busy(btn, true);
    try {
      if (entry) await editLog(gids[0], entry, ent); else await addLogs(gids, ent);
      closeSheet();
      toast(multi ? `${gids.length}마리 ${LOGT[t]} 기록을 저장했습니다` : `${LOGT[t]} 기록을 저장했습니다`);
      if (multi) { S.bulk = false; S.sel.clear(); render(); }
    } catch (err) { busy(btn, false); showErr(sh, errMsg(err)); }
  });
  const del = sh.querySelector('#l-del');
  if (del) del.addEventListener('click', async () => {
    const ok = await confirmSheet('이 기록을 삭제할까요?', `${fmtD(entry.d)} ${LOGT[t]} 기록을 지웁니다.`, '삭제', true);
    if (!ok) return;
    busy(del, true, '삭제 중…');
    try { await deleteLog(gids[0], entry); closeSheet(); toast('기록을 삭제했습니다'); }
    catch (err) { busy(del, false); showErr(sh, errMsg(err)); }
  });
}

/* ---------- sale ---------- */
function openSaleForm(id) {
  const g = G(id); if (!g) return; const s = g.sale || {};
  const sh = openSheet(`<form class="form" id="sform" novalidate>${sheetHead(gStatus(g) === 'sold' ? '분양 정보 수정' : '분양 처리')}
    <p class="who">${esc(gLabel(g))}${g.morph ? ' · ' + esc(g.morph) : ''}</p>
    <div class="grid2"><div class="field"><label for="s-date">분양일</label><input id="s-date" type="date" value="${esc(s.date || today())}"></div>
      <div class="field"><label for="s-price">분양가 (원)</label><input id="s-price" type="number" inputmode="numeric" min="0" step="1000" value="${s.price ?? ''}" placeholder="선택"></div></div>
    <div class="grid2"><div class="field"><label for="s-to">분양받은 분</label><input id="s-to" value="${esc(s.to || '')}" autocomplete="off"></div>
      <div class="field"><label for="s-contact">연락처</label><input id="s-contact" value="${esc(s.contact || '')}" autocomplete="off" placeholder="선택"></div></div>
    <div class="field"><label for="s-note">메모</label><textarea id="s-note" rows="2">${esc(s.note || '')}</textarea></div>
    <p class="hint">저장하면 상태가 ‘분양 완료’로 바뀌고 보유 목록${g.listing ? '과 분양 페이지' : ''}에서 빠집니다. 기록과 혈통 정보는 그대로 남습니다.</p>
    ${feat('report') ? `<p class="hint">${LAW_NOTE} 분양한 달의 다음 달 10일까지이며, 신고 도우미에서 기한을 알려 드립니다.</p>` : ''}
    <p class="err" hidden></p>
    <div class="sh-foot"><span class="sp"></span><button type="button" class="btn" data-act="close-sheet">취소</button><button type="submit" class="btn primary" id="s-save">저장</button></div></form>`, {label:'분양 처리'});
  sh.querySelector('#sform').addEventListener('submit', async ev => {
    ev.preventDefault();
    const date = fval(sh, 's-date'); if (!date) return showErr(sh, '분양일을 입력해 주세요.');
    const pr = fval(sh, 's-price');
    const btn = sh.querySelector('#s-save'); busy(btn, true);
    try {
      const up = {status:'sold', sale:{date, price:pr ? Math.round(+pr) : null, to:fval(sh, 's-to'), contact:fval(sh, 's-contact'), note:sh.querySelector('#s-note').value.trim()}, updated_at:new Date().toISOString()};
      if (g.listing) up.listing = null;
      await q(sb.from('geckos').update(up).eq('id', id));
      closeSheet(); toast('분양 정보를 저장했습니다'); await refresh();
    } catch (e) { busy(btn, false); showErr(sh, errMsg(e)); }
  });
}
async function cancelSale(id) {
  const g = G(id); if (!g) return;
  const ok = await confirmSheet('분양을 취소할까요?', `${esc(gLabel(g))}의 분양 정보를 지우고 다시 ‘보유 중’으로 돌립니다.`, '분양 취소', true);
  if (!ok) return;
  try { await q(sb.from('geckos').update({status:'active', sale:null}).eq('id', id)); toast('보유 중으로 돌렸습니다'); await refresh(); } catch (e) { toast(errMsg(e), 'bad'); }
}

/* ---------- 분양 등록 (분양 페이지에 올리기) ---------- */
function openListingForm(id) {
  const g = G(id); if (!g) return; const l = g.listing || {}, st = l.state || 'open';
  const warn = !g.publicOn ? '<div class="notice warn"><p>이 개체는 <b>공개 카드가 꺼져 있어</b> 분양 페이지에 나오지 않습니다. 개체 정보 수정에서 공개 카드를 켜 주세요.</p></div>' : '';
  const sh = openSheet(`<form class="form" id="lsform" novalidate>${sheetHead(g.listing ? '분양 글 수정' : '분양 등록')}
    <p class="who">${esc(gLabel(g))}${g.morph ? ' · ' + esc(g.morph) : ''}</p>${warn}
    <div class="field"><span class="lbl">상태</span><div class="seg radio">${Object.entries(LSTATE).map(([k, t]) => `<label><input type="radio" name="ls-st" value="${k}"${st === k ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div></div>
    <div class="field"><label for="ls-price">분양가 (원)</label><input id="ls-price" inputmode="numeric" autocomplete="off" placeholder="비우면 ‘가격 문의’로 표시" value="${l.price ? Number(l.price).toLocaleString('ko-KR') : ''}"></div>
    <div class="field"><label for="ls-note">소개 글</label><textarea id="ls-note" rows="4" maxlength="500" placeholder="예: 먹성 좋고 순해요. 현재 슈퍼푸드 단독 급여 중.">${esc(l.note || '')}</textarea></div>
    <p class="hint">분양 페이지${shopCfg().board ? '·분양 게시판' : ''}과 이 개체의 QR 공개 카드에 ‘분양 중’ 정보와 문의 버튼이 함께 보입니다. 사진·모프·성별·혈통 등은 공개 카드 설정을 따릅니다. 분양 처리를 하면 자동으로 내려갑니다.</p>
    <p class="err" hidden></p>
    <div class="sh-foot">${g.listing ? '<button type="button" class="btn danger" id="ls-del">분양 내리기</button>' : ''}<span class="sp"></span><button type="button" class="btn" data-act="close-sheet">취소</button><button type="submit" class="btn primary" id="ls-save">${g.listing ? '저장' : '분양 페이지에 올리기'}</button></div></form>`, {label:'분양 등록'});
  sh.querySelector('#lsform').addEventListener('submit', async ev => {
    ev.preventDefault();
    const pv = fval(sh, 'ls-price').replace(/[^0-9]/g, ''), price = pv ? parseInt(pv, 10) : null;
    if (price != null && price > 1e10) return showErr(sh, '분양가를 다시 확인해 주세요.');
    const listing = {price, note:sh.querySelector('#ls-note').value.trim(), state:(sh.querySelector('input[name=ls-st]:checked') || {}).value || 'open', since:l.since || today()};
    const btn = sh.querySelector('#ls-save'); busy(btn, true);
    try { await q(sb.from('geckos').update({listing, updated_at:new Date().toISOString()}).eq('id', id)); closeSheet(); toast(g.listing ? '분양 글을 저장했습니다' : '분양 페이지에 올렸습니다'); S.shop.delete(S.farm.id); S.board = null; await refresh(); }
    catch (e) { busy(btn, false); showErr(sh, errMsg(e)); }
  });
  const del = sh.querySelector('#ls-del');
  if (del) del.addEventListener('click', async () => {
    busy(del, true, '내리는 중…');
    try { await q(sb.from('geckos').update({listing:null, updated_at:new Date().toISOString()}).eq('id', id)); closeSheet(); toast('분양 페이지에서 내렸습니다'); S.shop.delete(S.farm.id); S.board = null; await refresh(); }
    catch (e) { busy(del, false); showErr(sh, errMsg(e)); }
  });
}

/* ---------- pairing ---------- */
function openPairForm(id, pre = {}) {
  const p = id ? S.pairings.get(id) : {maleId:pre.male || '', femaleId:pre.female || '', startAt:today()};
  if (!p) return;
  const sh = openSheet(`<form class="form" id="pform" novalidate>${sheetHead(id ? '메이팅 수정' : '메이팅 기록')}
    <div class="grid2"><div class="field"><label for="p-m">수컷</label><select id="p-m"><option value="">선택하세요</option>${geckoOptions(x => isMaleish(x) && fullCare(x), p.maleId)}</select></div>
      <div class="field"><label for="p-f">암컷</label><select id="p-f"><option value="">선택하세요</option>${geckoOptions(x => isFemaleish(x) && fullCare(x), p.femaleId)}</select></div></div>
    <div id="p-kin">${kinBox(p.maleId, p.femaleId)}</div>
    <div class="grid2"><div class="field"><label for="p-s">합사일</label><input id="p-s" type="date" value="${esc(p.startAt || '')}"></div>
      <div class="field"><label for="p-e">분리일</label><input id="p-e" type="date" value="${esc(p.endAt || '')}"><p class="hint">아직 합사 중이면 비워 두세요.</p></div></div>
    <div class="field"><label for="p-n">메모</label><textarea id="p-n" rows="2">${esc(p.note || '')}</textarea></div>
    <p class="err" hidden></p>
    <div class="sh-foot">${id ? '<button type="button" class="btn danger" id="p-del">삭제</button>' : ''}<span class="sp"></span><button type="button" class="btn" data-act="close-sheet">취소</button><button type="submit" class="btn primary" id="p-save">저장</button></div></form>`, {label:'메이팅 기록'});
  const pk = () => { const m = fval(sh, 'p-m'), f = fval(sh, 'p-f'); sh.querySelector('#p-kin').innerHTML = kinBox(m.startsWith('id:') ? m.slice(3) : '', f.startsWith('id:') ? f.slice(3) : ''); };
  sh.querySelector('#p-m').addEventListener('change', pk); sh.querySelector('#p-f').addEventListener('change', pk);
  sh.querySelector('#pform').addEventListener('submit', async ev => {
    ev.preventDefault();
    const m = fval(sh, 'p-m'), f = fval(sh, 'p-f'), s = fval(sh, 'p-s'), e = fval(sh, 'p-e');
    if (!m || !f) return showErr(sh, '수컷과 암컷을 모두 골라 주세요.');
    if (m === f) return showErr(sh, '수컷과 암컷이 같은 개체입니다.');
    if (!s) return showErr(sh, '합사일을 입력해 주세요.');
    if (e && e < s) return showErr(sh, '분리일이 합사일보다 빠릅니다.');
    const row = {male_id:m.slice(3), female_id:f.slice(3), start_at:s, end_at:e || null, note:sh.querySelector('#p-n').value.trim(), updated_at:new Date().toISOString()};
    const btn = sh.querySelector('#p-save'); busy(btn, true);
    try {
      if (id) await q(sb.from('pairings').update(row).eq('id', id)); else await q(sb.from('pairings').insert({id:rid(), farm_id:S.farm.id, ...row}));
      closeSheet(); toast('메이팅 기록을 저장했습니다'); await refresh();
    } catch (err) { busy(btn, false); showErr(sh, errMsg(err)); }
  });
  const del = sh.querySelector('#p-del');
  if (del) del.addEventListener('click', async () => {
    if (!await confirmSheet('메이팅 기록을 삭제할까요?', '이 페어 기록만 지워집니다. 산란 기록은 남습니다.', '삭제', true)) return;
    try { await q(sb.from('pairings').delete().eq('id', id)); closeSheet(); toast('삭제했습니다'); await refresh(); } catch (err) { showErr(sh, errMsg(err)); }
  });
}

/* ---------- clutch (산란) ---------- */
async function linkHatch(cid, nid, hd) {
  const rows = await q(sb.from('clutches').select('hatched_ids, hatch_at').eq('id', cid));
  if (!rows || !rows.length) return;
  const c = rows[0];
  await q(sb.from('clutches').update({hatched_ids:[...(c.hatched_ids || []), nid], status:'hatched', hatch_at:c.hatch_at || hd || today(), updated_at:new Date().toISOString()}).eq('id', cid));
}
function openClutchForm(id, pre = {}) {
  const c = id ? S.clutches.get(id) : {damId:pre.dam || '', sireId:'', laidAt:today(), eggs:2, infertile:0, status:'incubating'};
  if (!c) return;
  if (!id && c.damId) { const p = [...S.pairings.values()].find(x => x.femaleId === c.damId && !x.endAt); if (p) c.sireId = p.maleId; }
  const sireCur = c.sireId ? 'id:' + c.sireId : c.sireNone ? 'none' : c.sireExt ? 'ext' : '';
  const hatched = (c.hatchedIds || []).map(G).filter(Boolean);
  const st = c.status || 'incubating';
  const sh = openSheet(`<form class="form" id="cform" novalidate>${sheetHead(id ? '산란 기록 수정' : '산란 기록')}
    <div class="grid2"><div class="field"><label for="c-dam">암컷</label><select id="c-dam"><option value="">선택하세요</option>${geckoOptions(x => isFemaleish(x) && fullCare(x), c.damId)}</select></div>
      <div class="field"><label for="c-sire">수컷</label><select id="c-sire"><option value="">미상</option><option value="none"${sireCur === 'none' ? ' selected' : ''}>수컷 없음 (단독 산란)</option>${geckoOptions(x => isMaleish(x) && fullCare(x), c.sireId)}<option value="ext"${sireCur === 'ext' ? ' selected' : ''}>목록에 없는 개체 (직접 입력)</option></select>
        <input id="c-sire-ext" placeholder="수컷 이름" value="${esc(c.sireExt || '')}" autocomplete="off"${sireCur === 'ext' ? '' : ' hidden'}></div></div>
    <div id="c-kin">${kinBox(c.sireId, c.damId)}</div>
    <div class="grid2"><div class="field"><label for="c-laid">산란일</label><input id="c-laid" type="date" value="${esc(c.laidAt || '')}"></div>
      <div class="field"><label for="c-status">상태</label><select id="c-status">${Object.entries(CLS).map(([k, t]) => `<option value="${k}"${st === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="grid2"><div class="field"><label for="c-eggs">알 개수</label><input id="c-eggs" type="number" inputmode="numeric" min="1" max="20" value="${esc(c.eggs ?? 2)}"></div>
      <div class="field"><label for="c-inf">그중 무정란</label><input id="c-inf" type="number" inputmode="numeric" min="0" max="20" value="${esc(c.infertile ?? 0)}"></div></div>
    <p class="hint" id="c-fert"></p>
    <div class="grid2"><div class="field"><label for="c-inc">인큐 시작일</label><input id="c-inc" type="date" value="${esc(c.incubStart || '')}"></div>
      <div class="field"><label for="c-exp">예상 해칭일</label><input id="c-exp" type="date" value="${esc(c.expectAt || '')}"></div></div>
    <div class="field"><label for="c-incn">인큐 조건</label><input id="c-incn" value="${esc(c.incubNote || '')}" placeholder="예: 온도·습도, 배지 종류" autocomplete="off"></div>
    <div class="field" id="c-hatch-f"${st === 'hatched' ? '' : ' hidden'}><label for="c-hatch">해칭일</label><input id="c-hatch" type="date" value="${esc(c.hatchAt || '')}"></div>
    ${id ? `<div class="field"><span class="lbl">해칭 개체</span>${hatched.length ? `<div class="kids">${hatched.map(k => `<a class="kid" href="#g-${k.id}" data-act="close-sheet">${photoTag(k, 'pav')}<span><span class="mono">${esc(k.code || '')}</span> ${esc(k.name || k.morph || '')}</span></a>`).join('')}</div>` : '<p class="hint">아직 연결된 해칭 개체가 없습니다.</p>'}
      <div><button type="button" class="btn small" id="c-hatchreg">+ 해칭 개체 등록</button></div><p class="hint">이 기록을 저장한 뒤 개체 등록 화면이 열립니다. 부모와 해칭일이 미리 채워집니다.</p></div>` : ''}
    <div class="field"><label for="c-note">메모</label><textarea id="c-note" rows="2">${esc(c.note || '')}</textarea></div>
    <p class="err" hidden></p>
    <div class="sh-foot">${id ? '<button type="button" class="btn danger" id="c-del">삭제</button>' : ''}<span class="sp"></span><button type="button" class="btn" data-act="close-sheet">취소</button><button type="submit" class="btn primary" id="c-save">저장</button></div></form>`, {label:'산란 기록'});
  const fert = () => { const e = parseInt(fval(sh, 'c-eggs'), 10) || 0, i = parseInt(fval(sh, 'c-inf'), 10) || 0; sh.querySelector('#c-fert').textContent = i > e ? '무정란 수가 알 개수보다 많습니다.' : `유정란 ${e - i}개 · 무정란 ${i}개${e && e === i ? ' — 저장하면 상태가 ‘무정란’으로 정리됩니다.' : ''}`; };
  fert(); sh.querySelector('#c-eggs').addEventListener('input', fert); sh.querySelector('#c-inf').addEventListener('input', fert);
  const ck = () => { const d = fval(sh, 'c-dam'), m = fval(sh, 'c-sire'); sh.querySelector('#c-kin').innerHTML = (m.startsWith('id:') && d.startsWith('id:')) ? kinBox(m.slice(3), d.slice(3)) : ''; };
  sh.querySelector('#c-dam').addEventListener('change', ck); sh.querySelector('#c-sire').addEventListener('change', ck);
  if (!(c.sireId && c.damId)) sh.querySelector('#c-kin').innerHTML = '';
  const ss = sh.querySelector('#c-sire'); ss.addEventListener('change', () => { const x = sh.querySelector('#c-sire-ext'); x.hidden = ss.value !== 'ext'; if (!x.hidden) x.focus(); });
  const cs = sh.querySelector('#c-status'); cs.addEventListener('change', () => { sh.querySelector('#c-hatch-f').hidden = cs.value !== 'hatched'; });
  let afterHatch = false;
  const hr = sh.querySelector('#c-hatchreg');
  if (hr) hr.addEventListener('click', () => { afterHatch = true; sh.querySelector('#cform').requestSubmit(); });
  sh.querySelector('#cform').addEventListener('submit', async ev => {
    ev.preventDefault();
    const dam = fval(sh, 'c-dam'), sv = fval(sh, 'c-sire'), laid = fval(sh, 'c-laid');
    const eggs = parseInt(fval(sh, 'c-eggs'), 10), inf = parseInt(fval(sh, 'c-inf'), 10) || 0;
    const fail = m => { afterHatch = false; showErr(sh, m); };
    if (!dam) return fail('산란한 암컷을 골라 주세요.');
    if (!laid) return fail('산란일을 입력해 주세요.');
    if (!(eggs >= 1 && eggs <= 20)) return fail('알 개수를 입력해 주세요.');
    if (inf < 0 || inf > eggs) return fail('무정란 수는 알 개수보다 많을 수 없습니다.');
    let status = fval(sh, 'c-status');
    if (eggs - inf === 0 && status === 'incubating') status = 'infertile';
    if (afterHatch) status = 'hatched';
    const row = {
      dam_id:dam.slice(3), sire_id:sv.startsWith('id:') ? sv.slice(3) : null, sire_none:sv === 'none', sire_ext:sv === 'ext' ? fval(sh, 'c-sire-ext') : '',
      laid_at:laid, eggs, infertile:inf, incub_start:fval(sh, 'c-inc') || null, expect_at:fval(sh, 'c-exp') || null, incub_note:fval(sh, 'c-incn'),
      status, hatch_at:status === 'hatched' ? (fval(sh, 'c-hatch') || c.hatchAt || today()) : null,
      note:sh.querySelector('#c-note').value.trim(), updated_at:new Date().toISOString()
    };
    const btn = sh.querySelector('#c-save'); busy(btn, true);
    try {
      const cid = id || rid();
      if (id) await q(sb.from('clutches').update(row).eq('id', id)); else await q(sb.from('clutches').insert({id:cid, farm_id:S.farm.id, ...row}));
      closeSheet(); toast('산란 기록을 저장했습니다'); await refresh();
      if (afterHatch) openGeckoForm(null, {sireId:row.sire_id, sireExt:row.sire_ext, damId:row.dam_id, hatchDate:row.hatch_at, source:'self', fromClutch:cid});
    } catch (err) { afterHatch = false; busy(btn, false); showErr(sh, errMsg(err)); }
  });
  const del = sh.querySelector('#c-del');
  if (del) del.addEventListener('click', async () => {
    if (!await confirmSheet('산란 기록을 삭제할까요?', '이 산란 기록만 지워집니다. 이미 등록한 해칭 개체는 그대로 남습니다.', '삭제', true)) return;
    try { await q(sb.from('clutches').delete().eq('id', id)); closeSheet(); toast('삭제했습니다'); await refresh(); } catch (err) { showErr(sh, errMsg(err)); }
  });
}

/* ---------- QR & labels ---------- */
async function fontsReady() { try { await Promise.all(['600 40px "IBM Plex Mono"', '400 40px "Gowun Dodum"', '400 40px "Jua"'].map(f => document.fonts.load(f))); } catch {} }
function fitText(ctx, s, w) { s = String(s || ''); if (ctx.measureText(s).width <= w) return s; while (s.length > 1 && ctx.measureText(s + '…').width > w) s = s.slice(0, -1); return s + '…'; }
function drawQR(ctx, text, x, y, size) {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), quiet = 2, cell = Math.floor(size / (n + quiet * 2));
  const off = Math.floor((size - cell * n) / 2);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#000000';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect(x + off + c * cell, y + off + r * cell, cell, cell);
}
function drawLabel(ctx, x, y, w, h, g, url, guide) {
  ctx.save();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, w, h);
  if (guide) { const lw = Math.max(1, Math.round(h / 200)); ctx.strokeStyle = '#c8c8c8'; ctx.lineWidth = lw; ctx.setLineDash([h / 28, h / 36]); ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw); ctx.setLineDash([]); }
  const p = Math.round(h * 0.09), qs = h - 2 * p;
  drawQR(ctx, url, x + p, y + p, qs);
  const tx = x + p + qs + Math.round(p * 0.8), tw = x + w - p - tx, sx = SEX[g.sex || 'u'];
  let ty = y + p + h * 0.02;
  ctx.textBaseline = 'top'; ctx.fillStyle = '#111111';
  ctx.font = `600 ${Math.round(h * 0.155)}px "IBM Plex Mono", monospace`; ctx.fillText(fitText(ctx, g.code || '—', tw), tx, ty); ty += h * 0.21;
  if (g.name) { ctx.font = `400 ${Math.round(h * 0.13)}px "Jua", sans-serif`; ctx.fillText(fitText(ctx, g.name, tw), tx, ty); ty += h * 0.16; }
  ctx.fillStyle = '#333333'; ctx.font = `400 ${Math.round(h * 0.095)}px "Gowun Dodum", sans-serif`;
  ctx.fillText(fitText(ctx, g.morph || '모프 미기록', tw), tx, ty); ty += h * 0.13;
  ctx.fillText(fitText(ctx, sx.t, tw), tx, ty); ty += h * 0.13;
  if (hatchLabel(g)) ctx.fillText(fitText(ctx, hatchLabel(g), tw), tx, ty);
  ctx.restore();
}
const safeName = s => String(s || 'gecko').replace(/[^\w가-힣-]+/g, '_');
async function openQrSheet(id) {
  const g = G(id); if (!g) return;
  const url = qrUrl(id);
  if (typeof qrcode !== 'function') { toast('QR 도구를 불러오지 못했습니다. 페이지를 새로 고친 뒤 다시 시도하세요.', 'bad'); return; }
  await fontsReady();
  const c = document.createElement('canvas'); c.width = 1200; c.height = 600;
  drawLabel(c.getContext('2d'), 0, 0, 1200, 600, g, url, false);
  const sh = openSheet(`<div class="form">${sheetHead('QR 라벨')}
    <img class="qrprev" src="${c.toDataURL('image/png')}" alt="${esc(gLabel(g))} QR 라벨">
    <div class="field"><label for="qr-link">QR에 담긴 주소</label><div class="linkbox"><input id="qr-link" readonly value="${esc(url)}"><button type="button" class="btn small" id="qr-copy">복사</button></div>
      <p class="hint">휴대폰 카메라로 찍으면 이 개체 화면이 열립니다. 그 기기에서 처음 열 때만 구글 로그인이 필요합니다.</p></div>
    <div class="sh-foot"><a class="btn" href="#labels" data-act="close-sheet">여러 마리 한 번에</a><span class="sp"></span><button type="button" class="btn primary" id="qr-save">이미지로 저장</button></div></div>`, {label:'QR 라벨'});
  sh.querySelector('#qr-copy').addEventListener('click', async () => {
    const i = sh.querySelector('#qr-link');
    try { await navigator.clipboard.writeText(i.value); toast('주소를 복사했습니다'); }
    catch { i.focus(); i.select(); toast('주소를 선택했습니다. 길게 눌러 복사하세요.'); }
  });
  sh.querySelector('#qr-save').addEventListener('click', () => c.toBlob(b => downloadBlob(b, `QR_${safeName(g.code || g.name)}.png`), 'image/png'));
}
async function makeLabels() {
  const ids = [...S.labSel].filter(i => G(i)).sort((a, b) => byCode(G(a), G(b)));
  if (!ids.length) return;
  if (typeof qrcode !== 'function') { toast('QR 도구를 불러오지 못했습니다. 페이지를 새로 고친 뒤 다시 시도하세요.', 'bad'); return; }
  await fontsReady();
  S.labOut.forEach(p => URL.revokeObjectURL(p.url)); S.labOut = [];
  const W = 2480, H = 3508, M = 142, cols = 3, rows = 8, cw = Math.floor((W - 2 * M) / cols), ch = Math.floor((H - 2 * M) / rows), per = cols * rows;
  for (let pg = 0; pg * per < ids.length; pg++) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    ids.slice(pg * per, (pg + 1) * per).forEach((id, i) => drawLabel(ctx, M + (i % cols) * cw, M + Math.floor(i / cols) * ch, cw, ch, G(id), qrUrl(id), true));
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    if (blob) S.labOut.push({url:URL.createObjectURL(blob), blob});
  }
  render();
}

/* ---------- samples ---------- */
async function clearSamples() {
  const ok = await confirmSheet('예시를 지울까요?', '예시로 넣어 둔 개체와 그 기록, 예시 산란·메이팅 기록을 지웁니다. 직접 등록한 개체는 그대로 남습니다.', '예시 지우기', true);
  if (!ok) return;
  try {
    const ids = [...S.geckos.values()].filter(g => g.sample).map(g => g.id);
    if (ids.length) {
      const fid = S.farm.id;
      await q(sb.from('geckos').update({sire_id:null}).eq('farm_id', fid).eq('sample', false).in('sire_id', ids));
      await q(sb.from('geckos').update({dam_id:null}).eq('farm_id', fid).eq('sample', false).in('dam_id', ids));
      await q(sb.from('geckos').delete().eq('farm_id', fid).eq('sample', true));
    }
    await q(sb.from('clutches').delete().eq('farm_id', S.farm.id).eq('sample', true));
    await q(sb.from('pairings').delete().eq('farm_id', S.farm.id).eq('sample', true));
    toast('예시를 지웠습니다'); await refresh(); go('list');
  } catch (e) { toast(errMsg(e), 'bad'); }
}

/* ---------- mind map ---------- */
const MM = {
  group:lsGet('gk.mm.group') || 'sex', scope:lsGet('gk.mm.scope') || 'active',
  up:+(lsGet('gk.mm.up') || 3), down:+(lsGet('gk.mm.down') || 2),
  collapsed:new Set(), sel:null, view:null, viewKey:'', lastCenter:null, nodes:new Map()
};
const MMW = {root:180, group:160, gecko:196, ext:180, none:132};
const MMH = {root:60, group:46, gecko:58, ext:50, none:42};
const COL = 236, ROW = 70;
const BODY_FONT = '"Gowun Dodum", system-ui, sans-serif';
let mctx;
function clip(text, font, w) { if (!mctx) mctx = document.createElement('canvas').getContext('2d'); mctx.font = font; return fitText(mctx, text, w); }
const SEXFILL = {male:'sm', female:'sf', unk:'su'};

function vMap(id) {
  if (!S.loaded.g) return loadingHTML();
  const all = [...S.geckos.values()].sort(byCode);
  const center = id ? G(id) : null;
  if (id && !center) return `<div class="empty"><h2>개체를 찾을 수 없습니다</h2><p>삭제된 개체일 수 있습니다.</p><a class="btn" href="#map">전체 개체 마인드맵으로</a></div>`;
  if (center) MM.lastCenter = center.id;
  const lc = (MM.lastCenter && G(MM.lastCenter)) ? MM.lastCenter : (all[0] && all[0].id);
  const opt = (pairs, cur) => pairs.map(([v, t]) => `<option value="${v}"${String(cur) === String(v) ? ' selected' : ''}>${t}</option>`).join('');
  let h = `<div class="vhead"><div><h1 class="vtitle">마인드맵</h1><p class="vsub">${center ? '가운데 개체를 기준으로 왼쪽은 조상, 오른쪽은 자손입니다.' : '내 개체 전체를 묶음별 가지로 펼쳐 봅니다.'}</p></div></div>
  <div class="mapbar"><div class="seg segnav"><a href="#map"${center ? '' : ' aria-current="page"'}>전체 개체</a>${lc ? `<a href="#map-${lc}"${center ? ' aria-current="page"' : ''}>혈통</a>` : ''}</div><div class="ctl">`;
  if (center) {
    h += `<select data-chg="mm-center" aria-label="가운데 개체">${all.map(g => `<option value="${g.id}"${g.id === center.id ? ' selected' : ''}>${esc(gLabel(g))}</option>`).join('')}</select>
      <select data-chg="mm-up" aria-label="조상 단계">${opt([[1, '조상 1대'], [2, '조상 2대'], [3, '조상 3대'], [4, '조상 4대']], MM.up)}</select>
      <select data-chg="mm-down" aria-label="자손 단계">${opt([[1, '자손 1대'], [2, '자손 2대'], [3, '자손 3대']], MM.down)}</select>`;
  } else {
    h += `<select data-chg="mm-group" aria-label="묶는 기준">${opt([['sex', '성별로 묶기'], ['morph', '모프로 묶기'], ['status', '상태로 묶기'], ['year', '해칭 연도로 묶기']], MM.group)}</select>
      <select data-chg="mm-scope" aria-label="범위">${opt([['active', '보유 중만'], ['all', '분양·사망 포함']], MM.scope)}</select>`;
  }
  h += `</div></div>`;
  if (!all.length) return h + `<div class="empty"><h2>아직 그릴 개체가 없습니다</h2><p>개체를 등록하면 성별·모프별 가지와 혈통 마인드맵이 자동으로 그려집니다.</p><div class="actions"><button class="btn primary" data-act="new-gecko">+ 개체 등록</button><button class="btn" data-act="load-samples">예시 3마리 넣어 보기</button></div></div>`;
  h += `<div class="mapbox" id="mapbox">
    <svg id="mmsvg" role="img" aria-label="${center ? esc(gLabel(center)) + ' 혈통 마인드맵' : '전체 개체 마인드맵'}"><g id="mmvp"></g></svg>
    <div class="mapctl"><button type="button" data-mm="in" aria-label="확대">+</button><button type="button" data-mm="out" aria-label="축소">−</button><button type="button" class="txt" data-mm="fit">맞춤</button>${center ? '' : `<button type="button" class="txt" data-mm="fold">${MM.collapsed.size ? '펼치기' : '접기'}</button>`}</div>
    <div class="mapcard" id="mapcard" hidden></div>
  </div>
  <p class="maphint">드래그로 이동하고, 휠이나 두 손가락으로 확대합니다. 개체를 누르면 정보가 나오고, 가지 끝의 동그라미로 접고 펼칩니다. <span class="sex male">♂</span> 수컷 · <span class="sex female">♀</span> 암컷 · 점선은 목록에 없는 개체입니다.</p>`;
  return h;
}

function mmTree(id) {
  if (id) {
    const c = G(id);
    const anc = (g, depth, gen, key, seen) => {
      if (depth <= 0) return [];
      return [['sire', '부'], ['dam', '모']].map(([w, role]) => {
        const r = parentRef(g, w), k = `${key}/${w}`;
        if (r.kind === 'id' && !seen.has(r.g.id)) return {key:k, kind:'gecko', g:r.g, role, children:anc(r.g, depth - 1, gen + 1, k, new Set([...seen, r.g.id]))};
        if (r.kind === 'ext') return {key:k, kind:'ext', label:r.label, role, children:[]};
        return gen <= 2 ? {key:k, kind:'none', label:'미상', role, children:[]} : null;
      }).filter(Boolean);
    };
    const kidsOf = (g, seen) => [...S.geckos.values()].filter(k => (k.sireId === g.id || k.damId === g.id) && !seen.has(k.id)).sort((a, b) => (a.hatchDate || '').localeCompare(b.hatchDate || '') || byCode(a, b));
    const des = (g, depth, key, seen) => kidsOf(g, seen).map(k => {
      const kk = `${key}/${k.id}`, mate = k.sireId === g.id ? parentRef(k, 'dam') : parentRef(k, 'sire'), s2 = new Set([...seen, k.id]);
      const node = {key:kk, kind:'gecko', g:k, role:mate.kind === 'id' ? `× ${mate.g.code || gTitle(mate.g)}` : mate.kind === 'ext' ? `× ${mate.label}` : '', children:[], more:0};
      if (depth > 1) node.children = des(k, depth - 1, kk, s2); else node.more = kidsOf(k, s2).length;
      return node;
    });
    return {mode:'lineage', root:{key:'root', kind:'gecko', g:c, center:true, role:'', children:[]}, left:anc(c, MM.up, 1, 'a', new Set([c.id])), right:des(c, MM.down, 'd', new Set([c.id]))};
  }
  const list = [...S.geckos.values()].filter(g => gStatus(g) !== 'ref' && (MM.scope === 'all' || gStatus(g) === 'active')).sort(byCode);
  const keyOf = g => MM.group === 'sex' ? ({m:'수컷', f:'암컷', u:'미확인'})[sexGroup(g.sex)]
    : MM.group === 'morph' ? (g.morph || '모프 미기록')
    : MM.group === 'status' ? STATUS[gStatus(g)]
    : (hatchMode(g) === 'unknown' ? '해칭일 모름' : g.hatchDate ? g.hatchDate.slice(0, 4) + '년 해칭' : '해칭일 미기록');
  const m = new Map();
  list.forEach(g => { const k = keyOf(g); if (!m.has(k)) m.set(k, []); m.get(k).push(g); });
  let groups = [...m.entries()];
  const order = {sex:['수컷', '암컷', '미확인'], status:Object.values(STATUS)}[MM.group];
  if (order) groups.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  else if (MM.group === 'year') groups.sort((a, b) => b[0].localeCompare(a[0]));
  else groups.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'ko'));
  const left = [], right = []; let lc = 0, rc = 0;
  for (const [name, gs] of groups) {
    const n = {key:'grp:' + name, kind:'group', label:name, sub:`${gs.length}마리`, children:gs.map(g => ({key:'g:' + g.id, kind:'gecko', g, role:'', children:[]}))};
    const w = MM.collapsed.has(n.key) ? 1 : gs.length;
    if (narrow() || rc <= lc) { right.push(n); rc += w; } else { left.push(n); lc += w; }
  }
  return {mode:'all', root:{key:'root', kind:'root', label:'내 게코', sub:`${list.length}마리`, children:[]}, left, right};
}
const nW = n => MMW[n.kind], nH = n => MMH[n.kind] + (n.center ? 6 : 0);
function mmLayout(t) {
  const nodes = [t.root], edges = [];
  const leaves = n => { n.open = n.children.length > 0 && !MM.collapsed.has(n.key); n.lv = n.open ? n.children.reduce((s, c) => s + leaves(c), 0) : 1; return n.lv; };
  const place = (n, depth, top, side, parent) => {
    n.side = side; n.x = side * depth * COL; nodes.push(n); edges.push([parent, n]);
    if (n.open) {
      let y = top; n.children.forEach(c => { place(c, depth + 1, y, side, n); y += c.lv * ROW; });
      n.y = (n.children[0].y + n.children[n.children.length - 1].y) / 2;
    } else n.y = top + ROW / 2;
  };
  t.root.x = 0; t.root.y = 0; t.root.side = 0;
  for (const [arr, side] of [[t.left, -1], [t.right, 1]]) {
    const total = arr.reduce((s, c) => s + leaves(c), 0);
    let y = -total * ROW / 2;
    arr.forEach(c => { place(c, 1, y, side, t.root); y += c.lv * ROW; });
  }
  return {nodes, edges};
}
function mmNode(n, idx) {
  const w = nW(n), h = nH(n), x = n.x - w / 2, y = n.y - h / 2;
  let s = '';
  if (n.kind === 'root') {
    s = `<rect class="mn-box" width="${w}" height="${h}" rx="${h / 2}"/><text class="mn-rt" x="${w / 2}" y="${h / 2 - 3}" text-anchor="middle">${esc(n.label)}</text><text class="mn-rs" x="${w / 2}" y="${h / 2 + 15}" text-anchor="middle">${esc(n.sub)}</text>`;
  } else if (n.kind === 'group') {
    s = `<rect class="mn-box" width="${w}" height="${h}" rx="11"/><text class="mn-gt" x="14" y="${h / 2 + 5}">${esc(clip(n.label, `600 14px ${BODY_FONT}`, w - 74))}</text><text class="mn-gs" x="${w - 14}" y="${h / 2 + 4}" text-anchor="end">${esc(n.sub)}</text>`;
  } else if (n.kind === 'gecko') {
    const g = n.g, sx = SEX[g.sex || 'u'], u = photoUrl(g), fb = u ? '' : fallbackFor(g), cy = h / 2;
    const roleW = n.role ? Math.min(78, clip(n.role, `600 11px ${BODY_FONT}`, 78).length * 8 + 6) : 0;
    s = `<rect class="mn-box" width="${w}" height="${h}" rx="12"/>
      <circle class="mn-av" cx="27" cy="${cy}" r="18"/>`;
    if (u) s += `<clipPath id="mmc${idx}"><circle cx="27" cy="${cy}" r="18"/></clipPath><image href="${esc(u)}" x="9" y="${cy - 18}" width="36" height="36" preserveAspectRatio="xMidYMid slice" clip-path="url(#mmc${idx})"/>`;
    else if (fb) s += `<clipPath id="mmc${idx}"><circle cx="27" cy="${cy}" r="18"/></clipPath><image href="${esc(fb)}" x="9" y="${cy - 18}" width="36" height="36" preserveAspectRatio="xMidYMid slice" clip-path="url(#mmc${idx})"/>`;
    else s += `<text class="mn-ini" x="27" y="${cy + 3.5}" text-anchor="middle">${esc((g.code || g.name || '?').slice(-3))}</text>`;
    s += `<circle class="mn-ring r-${sx.c}" cx="27" cy="${cy}" r="18"/>
      <text class="mn-c" x="54" y="${cy - 9}">${esc(clip(g.code || '번호 없음', `500 11px "IBM Plex Mono", monospace`, w - 70 - roleW))}<tspan class="${SEXFILL[sx.c]}" dx="5">${sx.s}</tspan></text>
      ${n.role ? `<text class="mn-r" x="${w - 10}" y="${cy - 9}" text-anchor="end">${esc(clip(n.role, `600 11px ${BODY_FONT}`, 78))}</text>` : ''}
      <text class="mn-n" x="54" y="${cy + 7}">${esc(clip(gTitle(g), `600 13px ${BODY_FONT}`, w - 64))}</text>
      <text class="mn-m" x="54" y="${cy + 21}">${esc(clip([g.name ? (g.morph || '모프 미기록') : null, hatchAge(g) || null, gStatus(g) !== 'active' ? STATUS[gStatus(g)] : null].filter(Boolean).join(' · ') || '정보 없음', `400 11px ${BODY_FONT}`, w - 64))}</text>`;
  } else {
    s = `<rect class="mn-box" width="${w}" height="${h}" rx="10"/><text class="mn-r" x="12" y="${h / 2 - 4}">${esc(n.role || '')}</text><text class="mn-n" x="12" y="${h / 2 + 12}">${esc(clip(n.label, `600 13px ${BODY_FONT}`, w - 24))}</text>`;
  }
  if (n.children.length && !n.center && n.kind !== 'root') {
    const tx = n.side > 0 ? w : 0;
    s += `<g class="mn-tog" data-tog="${esc(n.key)}"><circle cx="${tx}" cy="${h / 2}" r="10"/><text x="${tx}" y="${h / 2 + 4}" text-anchor="middle">${n.open ? '−' : n.children.length}</text></g>`;
  } else if (n.more) {
    s += `<text class="mn-more" x="${n.side > 0 ? w + 8 : -8}" y="${h / 2 + 4}" text-anchor="${n.side > 0 ? 'start' : 'end'}">+${n.more}</text>`;
  }
  const cls = `mn mn-${n.kind}${n.center ? ' mn-center' : ''}${MM.sel === n.key ? ' sel' : ''}`;
  return `<g class="${cls}" data-key="${esc(n.key)}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">${s}</g>`;
}
function drawMap() {
  const box = $('#mapbox'), svg = $('#mmsvg'), vp = $('#mmvp');
  if (!box || !svg) return;
  const r = route(), t = mmTree(r.id), {nodes, edges} = mmLayout(t);
  MM.nodes = new Map(nodes.map(n => [n.key, n]));
  if (MM.sel && !MM.nodes.has(MM.sel)) MM.sel = null;
  let es = '';
  for (const [p, c] of edges) {
    const x1 = p.x + c.side * nW(p) / 2, x2 = c.x - c.side * nW(c) / 2, mx = (x1 + x2) / 2;
    es += `<path class="mn-e${p.kind === 'root' ? ' main' : ''}" d="M${x1.toFixed(1)},${p.y.toFixed(1)}C${mx.toFixed(1)},${p.y.toFixed(1)} ${mx.toFixed(1)},${c.y.toFixed(1)} ${x2.toFixed(1)},${c.y.toFixed(1)}"/>`;
  }
  vp.innerHTML = es + nodes.map(mmNode).join('');
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const n of nodes) { x0 = Math.min(x0, n.x - nW(n) / 2 - 24); x1 = Math.max(x1, n.x + nW(n) / 2 + 24); y0 = Math.min(y0, n.y - nH(n) / 2); y1 = Math.max(y1, n.y + nH(n) / 2); }
  MM.bb = {x:x0, y:y0, w:x1 - x0, h:y1 - y0};
  const key = r.id ? `L:${r.id}:${MM.up}:${MM.down}` : `A:${MM.group}:${MM.scope}`;
  if (MM.viewKey !== key || !MM.view) { MM.viewKey = key; MM.sel = null; mmFit(); } else mmApply();
  if (!svg._wired) mmWire(box, svg);
  mmCard();
}
const clampK = k => Math.min(2.2, Math.max(0.18, k));
function mmApply() { const vp = $('#mmvp'), v = MM.view; if (vp && v) vp.setAttribute('transform', `translate(${v.tx.toFixed(1)},${v.ty.toFixed(1)}) scale(${v.k.toFixed(3)})`); }
const narrow = () => window.innerWidth < 640;
function mmFit() {
  const box = $('#mapbox'); if (!box) return;
  const bw = box.clientWidth, bh = box.clientHeight, bb = MM.bb;
  const kw = Math.min((bw - 40) / bb.w, 1.1), kh = (bh - 40) / bb.h, fitK = Math.min(kw, kh);
  if (narrow() && !route().id) {
    const k = Math.min(1.1, Math.max(0.5, (bw - 16) / bb.w));
    MM.view = {k, tx:8 - bb.x * k, ty:bb.h * k < bh - 32 ? bh / 2 - (bb.y + bb.h / 2) * k : 16 - bb.y * k};
  } else if (fitK >= 0.5) MM.view = {k:fitK, tx:bw / 2 - (bb.x + bb.w / 2) * fitK, ty:bh / 2 - (bb.y + bb.h / 2) * fitK};
  else if (kw >= 0.5) MM.view = {k:kw, tx:bw / 2 - (bb.x + bb.w / 2) * kw, ty:24 - bb.y * kw};
  else { const k = 0.55, root = MM.nodes.get('root'); MM.view = {k, tx:bw / 2 - (root ? root.x : 0) * k, ty:bh / 2}; }
  mmApply();
}
function mmZoomAt(cx, cy, f) { const v = MM.view, k2 = clampK(v.k * f); v.tx = cx - (cx - v.tx) * (k2 / v.k); v.ty = cy - (cy - v.ty) * (k2 / v.k); v.k = k2; mmApply(); }
function mmWire(box, svg) {
  svg._wired = true;
  const pts = new Map(); let start = null, moved = false, downT = null, pinch = null;
  svg.addEventListener('pointerdown', e => {
    try { svg.setPointerCapture(e.pointerId); } catch {}
    pts.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if (pts.size === 1) { start = {x:e.clientX, y:e.clientY, tx:MM.view.tx, ty:MM.view.ty}; moved = false; downT = e.target; }
    else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = {d:Math.hypot(a.x - b.x, a.y - b.y) || 1, k:MM.view.k, tx:MM.view.tx, ty:MM.view.ty, cx:(a.x + b.x) / 2, cy:(a.y + b.y) / 2}; moved = true; }
  });
  svg.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if (pts.size >= 2 && pinch) {
      const [a, b] = [...pts.values()], rc = svg.getBoundingClientRect();
      const k2 = clampK(pinch.k * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d), cx = pinch.cx - rc.left, cy = pinch.cy - rc.top;
      MM.view = {k:k2, tx:cx - (cx - pinch.tx) * (k2 / pinch.k), ty:cy - (cy - pinch.ty) * (k2 / pinch.k)}; mmApply();
    } else if (start) {
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) > 5) moved = true;
      if (moved) { MM.view.tx = start.tx + dx; MM.view.ty = start.ty + dy; mmApply(); }
    }
  });
  const end = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) { if (!moved && downT && e.type === 'pointerup') mmClick(downT); start = null; downT = null; }
    else { const p = [...pts.values()][0]; start = {x:p.x, y:p.y, tx:MM.view.tx, ty:MM.view.ty}; }
  };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  svg.addEventListener('wheel', e => { e.preventDefault(); const rc = svg.getBoundingClientRect(); mmZoomAt(e.clientX - rc.left, e.clientY - rc.top, Math.exp(-e.deltaY * 0.0016)); }, {passive:false});
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-mm]'), x = e.target.closest('[data-mmclose]');
    if (x) { MM.sel = null; drawMap(); return; }
    if (!b) return;
    const a = b.dataset.mm, rc = svg.getBoundingClientRect();
    if (a === 'in') mmZoomAt(rc.width / 2, rc.height / 2, 1.3);
    if (a === 'out') mmZoomAt(rc.width / 2, rc.height / 2, 1 / 1.3);
    if (a === 'fit') mmFit();
    if (a === 'fold') {
      if (MM.collapsed.size) MM.collapsed.clear(); else [...MM.nodes.values()].filter(n => n.kind === 'group').forEach(n => MM.collapsed.add(n.key));
      b.textContent = MM.collapsed.size ? '펼치기' : '접기'; drawMap(); mmFit();
    }
  });
}
function mmClick(target) {
  const tog = target.closest && target.closest('[data-tog]');
  if (tog) { const k = tog.dataset.tog; if (MM.collapsed.has(k)) MM.collapsed.delete(k); else MM.collapsed.add(k); drawMap(); return; }
  const el = target.closest && target.closest('[data-key]');
  const n = el && MM.nodes.get(el.dataset.key);
  if (!n || n.kind === 'root') { if (MM.sel) { MM.sel = null; drawMap(); } return; }
  if (n.kind === 'group') { if (MM.collapsed.has(n.key)) MM.collapsed.delete(n.key); else MM.collapsed.add(n.key); drawMap(); return; }
  MM.sel = n.key; drawMap();
}
function mmCard() {
  const card = $('#mapcard'); if (!card) return;
  const n = MM.sel && MM.nodes.get(MM.sel);
  if (!n) { card.hidden = true; card.innerHTML = ''; return; }
  const close = '<button type="button" class="icon-btn" data-mmclose>닫기</button>';
  if (n.kind === 'gecko') {
    const g = n.g, sx = SEX[g.sex || 'u'], w = g.last && g.last.weight, isCenter = route().id === g.id;
    const sub = [g.name ? (g.morph || '모프 미기록') : null, hatchAge(g) || null, w ? `${fmtG(w.g)} g` : null].filter(Boolean).join(' · ');
    card.innerHTML = `<div class="mc-in">${photoTag(g)}<div class="gc-body"><span class="gc-top"><span class="code">${esc(g.code || '번호 없음')}</span><span class="sex ${sx.c}">${sx.s} ${sx.t}</span>${gStatus(g) !== 'active' ? `<span class="pill">${STATUS[gStatus(g)]}</span>` : ''}</span><span class="nm">${esc(gTitle(g))}</span>${sub ? `<span class="mf">${esc(sub)}</span>` : ''}${n.more ? `<span class="hint">자손 ${n.more}마리가 더 있습니다. 이 개체를 가운데로 놓으면 보입니다.</span>` : ''}</div>${close}</div>
      <div class="mc-acts">${isCenter ? '' : `<a class="btn small" href="#map-${g.id}">이 개체를 가운데로</a>`}<a class="btn small primary" href="#g-${g.id}">개체 화면 열기</a></div>`;
  } else {
    card.innerHTML = `<div class="mc-in solo"><div class="gc-body"><span class="nm">${esc(n.role ? n.role + ' · ' : '')}${esc(n.label)}</span><span class="mf">${n.kind === 'ext' ? '목록에 없는 개체입니다. 자손 개체의 ‘부모 지정’에서 목록의 개체로 바꿀 수 있습니다.' : '부모 정보가 기록되지 않았습니다.'}</span></div>${close}</div>`;
  }
  card.hidden = false;
}
let mmRsz; window.addEventListener('resize', () => { clearTimeout(mmRsz); mmRsz = setTimeout(() => { if (route().v === 'map') mmApply(); }, 150); });

/* ---------- events ---------- */
function visibleIds() {
  return [...S.geckos.values()].filter(g => (S.listFilter === 'all' ? gStatus(g) !== 'ref' : gStatus(g) === S.listFilter) && (S.sexFilter === 'all' || sexGroup(g.sex) === S.sexFilter) && (S.spFilter === 'all' || gSp(g) === S.spFilter) && matchQ(g)).map(g => g.id);
}
const ACT = {
  'close-sheet': () => closeSheet(),
  'copy-here': () => { const i = document.createElement('input'); i.value = location.href; i.className = 'vh'; document.body.appendChild(i); copyText(i, '주소를 복사했습니다').finally(() => setTimeout(() => i.remove(), 500)); },
  'to-ref': async t => {
    const g = G(t.dataset.id); if (!g) return;
    if (!await confirmSheet('혈관리용 개체로 바꿀까요?', `<b>${esc(gLabel(g))}</b>을(를) 분양 목록에서 빼고 ‘혈관리용(내 개체 아님)’으로 바꿉니다. 이 개체에 적어 둔 분양 정보는 지워지고, 혈통 연결은 그대로 남습니다.`, '혈관리용으로 바꾸기')) return;
    try { await q(sb.from('geckos').update({status:'ref', sale:null, updated_at:new Date().toISOString()}).eq('id', g.id)); toast('혈관리용 개체로 바꿨습니다'); await refresh(); }
    catch (e) { toast(errMsg(e), 'bad'); }
  },
  'pub-retry': t => { S.pub.delete(pubKey(t.dataset.id, !!t.dataset.preview)); render(); },
  'shop-retry': t => { S.shop.delete(t.dataset.id); render(); },
  'board-retry': () => { S.board = null; render(); },
  'board-view': t => { S.bView = t.dataset.v; render(); },
  'board-post': () => openBoardPost(),
  'shop-sp': t => { S.shopSp.set(t.dataset.id, t.dataset.v); render(); },
  'listing': t => openListingForm(t.dataset.id),
  'report-done': t => markReport(t.dataset.id, t.dataset.t, true),
  'report-undo': t => markReport(t.dataset.id, t.dataset.t, false),
  'shop-copy': () => { const i = $('#shop-link'); if (i) copyText(i, '분양 페이지 링크를 복사했습니다'); },
  'shop-share': async () => { try { await navigator.share({title:`${S.farm.name} 분양`, url:shopUrl(S.farm.id)}); } catch {} },
  'switch-farm': t => switchFarm(t.dataset.farm, t.dataset.go),
  'accept-invite': async t => {
    busy(t, true, '참여하는 중…');
    try { const fid = await q(sb.rpc('accept_invite', {c:t.dataset.code})); S.join.delete(t.dataset.code); lsSet('gk.farm', fid); resetFarmView(); await loadAll(); go('home'); toast(`${S.farm ? S.farm.name + '에 ' : ''}참여했습니다`); }
    catch (e) { busy(t, false); toast(errMsg(e), 'bad'); }
  },
  'new-farm': async () => {
    const u0 = U();
    const sh = openSheet(`<form class="form" id="nf" novalidate>${sheetHead('새로 만들기')}<div class="field"><span class="lbl">어떻게 부를까요?</span>${unitPick('nf-unit', u0)}</div><div class="field"><label for="nf-name" id="nf-name-l">${u0} 이름</label><input id="nf-name" autocomplete="off" placeholder="${NAME_EX[u0]}"></div><p class="hint">새로 만든 곳은 빈 상태로 시작하며, 설정에서 오가며 볼 수 있습니다.</p><p class="err" hidden></p><div class="sh-foot"><span class="sp"></span><button type="button" class="btn" data-act="close-sheet">취소</button><button class="btn primary" id="nf-save">만들기</button></div></form>`, {label:'새로 만들기'});
    wireUnit(sh, 'nf-unit', '#nf-name-l', '#nf-name');
    sh.querySelector('#nf').addEventListener('submit', async ev => { ev.preventDefault(); const b = sh.querySelector('#nf-save'); busy(b, true, '만드는 중…'); try { const un = (sh.querySelector('input[name=nf-unit]:checked') || {}).value; closeSheet(); await createFarm(fval(sh, 'nf-name'), un); } catch (e) { busy(b, false); toast(errMsg(e), 'bad'); } });
  },
  'make-invite': () => makeInvite(),
  'copy-invite': t => { const inv = S.invites.find(x => x.code === t.dataset.code); if (inv) openInviteSheet(inv.code, inv.role); },
  'revoke-invite': async t => { try { await q(sb.from('farm_invites').delete().eq('code', t.dataset.code)); toast('초대 링크를 취소했습니다'); S.setupDirty = false; await refresh(); } catch (e) { toast(errMsg(e), 'bad'); } },
  'remove-member': async t => {
    const m = S.members.find(x => x.user_id === t.dataset.uid); if (!m) return;
    if (!await confirmSheet('구성원을 내보낼까요?', `<b>${esc(m.display_name || m.email || '')}</b>님은 이 ${U()}의 개체를 더 이상 볼 수 없습니다. 그동안 남긴 기록은 그대로 남습니다.`, '내보내기', true)) return;
    try { await q(sb.from('farm_members').delete().eq('farm_id', S.farm.id).eq('user_id', m.user_id)); toast('내보냈습니다'); S.setupDirty = false; await refresh(); } catch (e) { toast(errMsg(e), 'bad'); }
  },
  'leave-farm': async () => {
    if (!await confirmSheet(`이 ${U()}에서 나갈까요?`, `<b>${esc(S.farm.name)}</b>의 개체를 더 이상 볼 수 없게 됩니다. 다시 들어오려면 관리자에게 새 초대 링크를 받아야 합니다.`, '나가기', true)) return;
    const nm = S.farm.name;
    try { await q(sb.from('farm_members').delete().eq('farm_id', S.farm.id).eq('user_id', S.user.id)); lsDel('gk.farm'); resetFarmView(); await loadAll(); go('home'); toast(`${nm}에서 나갔습니다`); }
    catch (e) { toast(errMsg(e), 'bad'); }
  },
  'login': () => login(),
  'install-app': () => installApp(),
  'logout': async () => { if (!await confirmSheet('로그아웃할까요?', '이 기기에서만 로그아웃합니다. 데이터는 그대로 남습니다.', '로그아웃')) return; await sb.auth.signOut(); location.hash = 'list'; },
  'retry': () => { S.conn = 'ok'; S.loaded = {g:false, c:false, p:false}; render(); refresh(); },
  'backup': () => backup(),
  'new-ledger': t => openLedgerForm(null, {kind:t.dataset.kind || 'expense', gecko:t.dataset.gecko || ''}),
  'edit-ledger': t => openLedgerForm(t.dataset.id),
  'ledger-step': t => { const P = S.lp, d = +t.dataset.d; if (P.mode === 'year') P.y += d; else { P.m += d; if (P.m < 1) { P.m = 12; P.y--; } if (P.m > 12) { P.m = 1; P.y++; } } render(); },
  'ledger-mode': t => { S.lp.mode = t.dataset.v; render(); },
  'ledger-month': t => { S.lp.mode = 'month'; S.lp.m = +t.dataset.m; render(); },
  'ledger-csv': () => ledgerCsv(),
  'load-samples': async t => { busy(t, true, '넣는 중…'); try { await insertSamples(); toast('예시 3마리를 넣었습니다'); } catch (e) { toast(errMsg(e), 'bad'); render(); } },
  'new-gecko': () => openGeckoForm(null),
  'edit-gecko': t => openGeckoForm(t.dataset.id),
  'filter': t => { S.listFilter = t.dataset.v; render(); },
  'bulk': () => { S.bulk = !S.bulk; S.sel.clear(); render(); },
  'sel': t => { const i = t.dataset.id; if (S.sel.has(i)) S.sel.delete(i); else S.sel.add(i); render(); },
  'sel-all': () => { visibleIds().forEach(i => S.sel.add(i)); render(); },
  'sel-none': () => { S.sel.clear(); render(); },
  'bulk-feed': () => { if (S.sel.size) openLogForm('feed', [...S.sel]); },
  'feed-over': () => { const ids = activeGeckos().filter(g => feedInfo(g).over).map(g => g.id); if (ids.length) openLogForm('feed', ids); },
  'log': t => openLogForm(t.dataset.t, [t.dataset.id]),
  'log-edit': t => { const e = S.logs.find(x => x.id === t.dataset.e); if (e) openLogForm(e.t, [t.dataset.id], e); },
  'tl': t => { S.tl = t.dataset.v; S.tlMore = false; render(); },
  'tl-more': () => { S.tlMore = true; render(); },
  'qr': t => openQrSheet(t.dataset.id),
  'sale': t => openSaleForm(t.dataset.id),
  'sale-cancel': t => cancelSale(t.dataset.id),
  'new-pair': t => openPairForm(null, {male:t.dataset.male, female:t.dataset.female}),
  'edit-pair': t => openPairForm(t.dataset.id),
  'new-clutch': t => openClutchForm(null, {dam:t.dataset.dam}),
  'edit-clutch': t => openClutchForm(t.dataset.id),
  'clear-samples': () => clearSamples(),
  'lab-all': () => { [...S.geckos.values()].filter(g => S.labAll ? gStatus(g) !== 'ref' : gStatus(g) === 'active').forEach(g => S.labSel.add(g.id)); render(); },
  'lab-none': () => { S.labSel.clear(); render(); },
  'lab-scope': () => { S.labAll = !S.labAll; render(); },
  'lab-make': t => { busy(t, true, '만드는 중…'); makeLabels().catch(() => { toast('라벨을 만들지 못했습니다.', 'bad'); render(); }); },
  'lab-save': t => { const p = S.labOut[+t.dataset.i]; if (p) downloadBlob(p.blob, `QR라벨_${+t.dataset.i + 1}.png`); }
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const fn = ACT[t.dataset.act]; if (!fn) return;
  const need = NEED[t.dataset.act];
  if (need && !can(need)) { e.preventDefault(); toast(need === 'admin' ? '관리자만 할 수 있는 작업입니다.' : '기록 담당 이상만 기록할 수 있습니다.', 'bad'); return; }
  if (t.tagName !== 'A') e.preventDefault();
  fn(t, e);
});
document.addEventListener('change', e => {
  const t = e.target, k = t.dataset && t.dataset.chg; if (!k) return;
  if (k === 'sexf') { S.sexFilter = t.value; render(); }
  if (k === 'spf') { S.spFilter = t.value; render(); }
  if (k === 'b-sp') { S.bSp = t.value; render(); }
  if (k === 'b-sex') { S.bSex = t.value; render(); }
  if (k === 'b-sort') { S.bSort = t.value; render(); }
  if (k === 'b-open') { S.bOpen = t.checked; render(); }
  if (k === 'sort') { S.sort = t.value; lsSet('gk.sort', t.value); render(); }
  if (k === 'lab') { if (t.checked) S.labSel.add(t.dataset.id); else S.labSel.delete(t.dataset.id); render(); }
  if (k === 'mm-center') go('map-' + t.value);
  if (k === 'farm-switch') switchFarm(t.value);
  if (k === 'member-role') {
    q(sb.from('farm_members').update({role:t.value}).eq('farm_id', S.farm.id).eq('user_id', t.dataset.uid))
      .then(() => { toast('권한을 바꿨습니다'); return refresh(); })
      .catch(err => { toast(errMsg(err), 'bad'); S.setupDirty = false; refresh(); });
  }
  if (k === 'mm-up' || k === 'mm-down' || k === 'mm-group' || k === 'mm-scope') {
    const f = k.slice(3); MM[f] = (f === 'up' || f === 'down') ? +t.value : t.value; lsSet('gk.mm.' + f, t.value);
    MM.viewKey = ''; MM.collapsed.clear(); render();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheets.length) closeSheet(); });
document.addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG' && t.hasAttribute('data-ph')) t.remove(); }, true);
$('#q').addEventListener('input', e => { S.q = e.target.value; if (route().v !== 'list') go('list'); else render(); });
$('#q').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const qq = S.q.trim().toLowerCase(); const hit = [...S.geckos.values()].find(g => (g.code || '').toLowerCase() === qq);
  if (hit) { S.q = ''; e.target.value = ''; go('g-' + hit.id); }
});
function onRoute() {
  const r = route();
  if (r.v === 'gecko' && S.auth === 'in' && G(r.id) && S.logGid !== r.id) { S.logs = []; S.logsLoaded = false; S.tl = 'all'; S.tlMore = false; loadLogs(r.id); }
  if (r.v === 'labels' && !S.labInit && S.loaded.g) { S.labInit = true; activeGeckos().forEach(g => S.labSel.add(g.id)); }
  if (r.v !== 'map') MM.sel = null;
}
window.addEventListener('hashchange', () => {
  while (sheets.length) closeSheet();
  S.setupDirty = false; onRoute(); render(); window.scrollTo(0, 0);
});

/* ---------- login & start ---------- */
async function login() {
  S.authErr = '';
  if (IN_KAKAO) { location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href); return; }
  if (IN_APP) { S.authErr = '이 앱 안의 브라우저에서는 구글 로그인이 되지 않습니다. 메뉴에서 ‘다른 브라우저로 열기’를 눌러 주세요.'; render(); return; }
  lsSet('gk.after', location.hash || '');
  try {
    const {error} = await sb.auth.signInWithOAuth({provider:'google', options:{redirectTo:appUrl()}});
    if (error) throw error;
  } catch { S.authErr = '로그인을 시작하지 못했습니다. 잠시 후 다시 시도하세요.'; render(); }
}
let lastUid = null, lastLoad = 0;
function onSession(session) {
  const u = (session && session.user) || null;
  if (S.auth !== 'loading' && (u ? u.id : null) === lastUid) return;
  lastUid = u ? u.id : null; S.user = u; S.pub.clear(); S.join.clear();
  if (!u) { S.auth = 'out'; S.loaded = {g:false, c:false, p:false}; S.geckos = new Map(); S.logGid = null; S.farm = null; S.role = null; S.farms = []; render(); return; }
  S.auth = 'in';
  const after = lsGet('gk.after');
  if (after !== null) { try { localStorage.removeItem('gk.after'); } catch {} }
  const hash = after && after.length > 1 ? after : location.hash;
  if (location.search) history.replaceState(null, '', location.pathname + hash);
  else if (hash !== location.hash) history.replaceState(null, '', location.pathname + hash);
  onRoute(); render(); lastLoad = Date.now(); loadAll();
}
async function boot() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  render();
  if (!CFG.supabaseUrl || !CFG.supabaseKey || !window.supabase) { S.auth = 'unconfigured'; render(); return; }
  const p = new URLSearchParams(location.search);
  if (p.get('error_description') || p.get('error')) {
    const m = p.get('error_description') || p.get('error') || '';
    S.authErr = /sign ?ups? not allowed|signup/i.test(m) ? '등록되지 않은 계정입니다. 사용 허가된 구글 계정으로 로그인해 주세요.' : '로그인하지 못했습니다. 다시 시도해 주세요.';
    history.replaceState(null, '', location.pathname + location.hash);
  }
  sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {auth:{flowType:'pkce', persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}});
  sb.auth.onAuthStateChange((ev, session) => { setTimeout(() => onSession(session), 0); });
  try { const {data} = await sb.auth.getSession(); onSession(data.session); }
  catch { S.auth = 'out'; S.authErr = '로그인 상태를 확인하지 못했습니다. 페이지를 새로 고쳐 주세요.'; render(); }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && S.auth === 'in' && Date.now() - lastLoad > 30000) { lastLoad = Date.now(); refresh(); }
  });
}
boot();
})();
