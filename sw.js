// 게코 관리노트 서비스 워커
// - 휴대폰·PC에서 '앱으로 설치'가 가능하도록 하는 최소 구성
// - 이 사이트의 파일은 항상 인터넷에서 새로 받고(최신 버전 유지), 인터넷이 끊겼을 때만 저장해 둔 화면을 보여 줍니다
// - 데이터(Supabase)·구글 로그인·글꼴 요청은 건드리지 않습니다
const CACHE = 'gk-shell-1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('gk-shell-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match(new URL('./', self.location).href) : null)).then(hit => hit || Response.error()))
  );
});
