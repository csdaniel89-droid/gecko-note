-- 크레 개체 노트 · Supabase 데이터베이스 구조
-- Supabase 관리 화면 → SQL Editor → New query 에 이 파일 전체를 붙여 넣고 Run 을 누르세요.
-- 여러 번 실행해도 안전하도록 작성되어 있습니다.

-- 1) 개체
create table if not exists public.geckos (
  id            text primary key,
  owner_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  code          text,
  name          text,
  morph         text,
  sex           text not null default 'u' check (sex in ('u', 'pm', 'pf', 'm', 'f')),
  sex_at        date,
  hatch_date    date,
  acquired_date date,
  source        text,
  source_note   text,
  sire_id       text,
  sire_ext      text,
  dam_id        text,
  dam_ext       text,
  notes         text,
  photo_path    text,
  status        text not null default 'active' check (status in ('active', 'sold', 'dead')),
  sale          jsonb,
  sample        boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2) 기록 (무게·급여·탈피·배변·메모)
create table if not exists public.logs (
  id         text primary key,
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  gecko_id   text not null references public.geckos (id) on delete cascade,
  type       text not null check (type in ('weight', 'feed', 'shed', 'poop', 'note')),
  date       date not null,
  grams      numeric(6, 1),
  food       text,
  ate        text,
  quality    text,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists logs_gecko_date on public.logs (gecko_id, date desc);

-- 3) 산란(클러치)
create table if not exists public.clutches (
  id          text primary key,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dam_id      text,
  sire_id     text,
  sire_none   boolean not null default false,
  sire_ext    text,
  laid_at     date,
  eggs        int not null default 0,
  infertile   int not null default 0,
  incub_start date,
  expect_at   date,
  incub_note  text,
  status      text not null default 'incubating' check (status in ('incubating', 'hatched', 'failed', 'infertile')),
  hatch_at    date,
  hatched_ids text[] not null default '{}',
  note        text,
  sample      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 4) 메이팅(합사)
create table if not exists public.pairings (
  id         text primary key,
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  male_id    text,
  female_id  text,
  start_at   date,
  end_at     date,
  note       text,
  sample     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) 설정 (사용자당 한 줄)
create table if not exists public.settings (
  owner_id        uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  feed_alert_days int not null default 3,
  foods           text[] not null default array['슈퍼푸드(CGD)', '귀뚜라미', '듀비아', '기타 곤충'],
  code_prefix     text not null default 'CR-',
  updated_at      timestamptz not null default now()
);

-- 6) 개체별 최근 기록 (목록 화면용)
create or replace view public.gecko_latest with (security_invoker = on) as
  select distinct on (gecko_id, type) gecko_id, type, date, grams, food, ate
  from public.logs
  where type in ('weight', 'feed', 'shed', 'poop')
  order by gecko_id, type, date desc, created_at desc;

-- 7) 보안 규칙: 로그인한 본인의 데이터만 읽고 쓸 수 있음
alter table public.geckos   enable row level security;
alter table public.logs     enable row level security;
alter table public.clutches enable row level security;
alter table public.pairings enable row level security;
alter table public.settings enable row level security;

drop policy if exists "own rows" on public.geckos;
drop policy if exists "own rows" on public.logs;
drop policy if exists "own rows" on public.clutches;
drop policy if exists "own rows" on public.pairings;
drop policy if exists "own rows" on public.settings;
create policy "own rows" on public.geckos   for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "own rows" on public.logs     for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "own rows" on public.clutches for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "own rows" on public.pairings for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "own rows" on public.settings for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- 8) 사진 저장소: 비공개 버킷, 본인 폴더(사용자 id)만 접근
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "photos: own read"   on storage.objects;
drop policy if exists "photos: own insert" on storage.objects;
drop policy if exists "photos: own update" on storage.objects;
drop policy if exists "photos: own delete" on storage.objects;
create policy "photos: own read" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: own update" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
