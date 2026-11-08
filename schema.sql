-- 게코 관리노트 · Supabase 데이터베이스 구조 (2.7판: 가족·브랜드 단위 관리·구성원·공개 카드·혈관리용 개체·급여 요일·가계부·기능 켜기/끄기·여러 종류(파충류·양서류)·분양 페이지·분양 게시판·신고 도우미)
-- Supabase 관리 화면 → SQL Editor → New query 에 이 파일 전체를 붙여 넣고 Run 을 누르세요.
-- 처음 설치할 때도, 1판에서 올릴 때도 같은 파일을 쓰면 됩니다. 여러 번 실행해도 안전합니다.
-- 1판에서 올리면 기존 개체·기록·산란·메이팅·설정이 '우리 게코'로 자동으로 옮겨집니다.
-- (데이터베이스 안의 이름 farms 는 화면에 보이는 '가족' 또는 '브랜드'를 뜻합니다)

------------------------------------------------------------------------------
-- 1) 가족·브랜드(farms)와 구성원
------------------------------------------------------------------------------
create table if not exists public.farms (
  id              text primary key default gen_random_uuid()::text,
  name            text not null default '우리 게코',
  logo_path       text,
  placeholder     text not null default 'logo' check (placeholder in ('logo', 'google', 'default')),
  placeholder_url text,
  feed_alert_days int not null default 3,
  foods           text[] not null default array['슈퍼푸드(CGD)', '귀뚜라미', '듀비아', '기타 곤충'],
  code_prefix     text not null default 'CR-',
  public_defaults jsonb not null default '{"hatch": true, "lineage": true, "breeder": true, "weight": false, "care": false, "sale": false, "buyer": false, "notes": false}',
  created_by      uuid default auth.uid() references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.farm_members (
  farm_id      text not null references public.farms (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         text not null default 'viewer' check (role in ('admin', 'keeper', 'viewer')),
  email        text,
  display_name text,
  avatar_url   text,
  joined_at    timestamptz not null default now(),
  primary key (farm_id, user_id)
);
create index if not exists farm_members_user on public.farm_members (user_id);

create table if not exists public.farm_invites (
  code       text primary key,
  farm_id    text not null references public.farms (id) on delete cascade,
  role       text not null default 'viewer' check (role in ('admin', 'keeper', 'viewer')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_by    uuid references auth.users (id) on delete set null,
  used_at    timestamptz
);

------------------------------------------------------------------------------
-- 2) 개체·기록·산란·메이팅·설정
------------------------------------------------------------------------------
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

-- 1판의 사용자별 설정 (2판부터는 farms 설정을 씁니다. 옮기기용으로만 남겨 둡니다)
create table if not exists public.settings (
  owner_id        uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  feed_alert_days int not null default 3,
  foods           text[] not null default array['슈퍼푸드(CGD)', '귀뚜라미', '듀비아', '기타 곤충'],
  code_prefix     text not null default 'CR-',
  updated_at      timestamptz not null default now()
);

-- 2판에서 추가된 칸
alter table public.geckos   add column if not exists farm_id       text references public.farms (id) on delete cascade;
alter table public.geckos   add column if not exists hatch_mode    text not null default 'exact';
alter table public.geckos   add column if not exists public_on     boolean not null default true;
alter table public.geckos   add column if not exists public_fields jsonb;
alter table public.logs     add column if not exists farm_id       text references public.farms (id) on delete cascade;
alter table public.clutches add column if not exists farm_id       text references public.farms (id) on delete cascade;
alter table public.pairings add column if not exists farm_id       text references public.farms (id) on delete cascade;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'geckos_hatch_mode_check') then
    alter table public.geckos add constraint geckos_hatch_mode_check check (hatch_mode in ('exact', 'approx', 'unknown'));
  end if;
end $$;

-- 급여 요일 (2.2판): 가족·브랜드 기본 방식·요일 + 개체별 요일(비우면 기본 요일)
--   요일 번호: 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토
alter table public.farms  add column if not exists feed_mode text not null default 'interval' check (feed_mode in ('interval', 'weekdays'));
alter table public.farms  add column if not exists feed_days int[] not null default '{}' check (feed_days <@ array[0, 1, 2, 3, 4, 5, 6]);
alter table public.geckos add column if not exists feed_days int[] check (feed_days <@ array[0, 1, 2, 3, 4, 5, 6]);

-- 기능 켜기/끄기와 부르는 이름 (2.4판)
--   {"ledger": false, "ref": false, "breeding": false, "unit": "브랜드"} 처럼 저장. 값이 없으면 켜짐, 이름은 '가족'
--   기능을 꺼도 데이터는 지워지지 않고 화면에서만 숨겨집니다
alter table public.farms add column if not exists features jsonb not null default '{}';
alter table public.farms alter column name set default '우리 게코';
update public.farms set name = '우리 게코' where name = '내 농장';

-- 종류(종) (2.5판): 크레스티드 게코 외 다른 파충류·양서류도 함께 관리
--   species: 'crested'(크레스티드 게코), 'gargoyle', 'leopard', 'ballpython' … 또는 직접 추가한 종류('x-…')
--   키우는 종류 목록과 종류별 관리 방식은 farms.features 의 "species" 에 저장합니다
--   feed_every: 이 개체만 '며칠마다' 급여 확인할 때의 날수 (예: 뱀 10일)
alter table public.geckos add column if not exists species text not null default 'crested' check (char_length(species) between 1 and 40);
alter table public.geckos add column if not exists feed_every int check (feed_every is null or feed_every between 1 and 90);

-- 분양 페이지 · 신고 도우미 (2.6판)
--   listing: 분양 등록 정보 {"price": 300000, "note": "소개", "state": "open"(분양 중) | "reserved"(예약 중), "since": "2026-11-02"}. 비어 있으면 분양 등록 안 함
--   died_at: 사망(폐사)일 — 폐사 신고 기한 계산용
--   reports: 신고한 날 {"in": 양수 신고, "out": 양도 신고, "dead": 폐사 신고}
--   분양 페이지 사용 여부·소개·연락처는 farms.features 의 "shop" 에 저장합니다
--   (2.7판) "shop": {"board": true} 이면 분양 게시판에도 함께 올라갑니다
alter table public.geckos add column if not exists listing jsonb check (listing is null or jsonb_typeof(listing) = 'object');
alter table public.geckos add column if not exists died_at date;
alter table public.geckos add column if not exists reports jsonb not null default '{}' check (jsonb_typeof(reports) = 'object');

-- 상태에 '혈관리용(ref)' 추가: 내 개체는 아니지만 혈통도를 잇기 위해 등록하는 개체
alter table public.geckos drop constraint if exists geckos_status_check;
alter table public.geckos add constraint geckos_status_check check (status in ('active', 'sold', 'dead', 'ref'));

create index if not exists geckos_farm   on public.geckos (farm_id);
create index if not exists logs_farm     on public.logs (farm_id);
create index if not exists clutches_farm on public.clutches (farm_id);
create index if not exists pairings_farm on public.pairings (farm_id);

------------------------------------------------------------------------------
-- 3) 1판 데이터 옮기기: 사용자마다 '우리 게코'를 만들고 기존 데이터를 연결
------------------------------------------------------------------------------
do $$
declare
  r   record;
  fid text;
begin
  for r in
    select distinct owner_id from (
      select owner_id from public.geckos   where farm_id is null
      union select owner_id from public.logs     where farm_id is null
      union select owner_id from public.clutches where farm_id is null
      union select owner_id from public.pairings where farm_id is null
    ) s where owner_id is not null
  loop
    select m.farm_id into fid from public.farm_members m where m.user_id = r.owner_id and m.role = 'admin' order by m.joined_at limit 1;
    if fid is null then
      fid := gen_random_uuid()::text;
      insert into public.farms (id, name, created_by, feed_alert_days, foods, code_prefix)
      select fid, '우리 게코', r.owner_id,
             coalesce(s.feed_alert_days, 3),
             coalesce(s.foods, array['슈퍼푸드(CGD)', '귀뚜라미', '듀비아', '기타 곤충']),
             coalesce(s.code_prefix, 'CR-')
      from (select 1) one left join public.settings s on s.owner_id = r.owner_id;
      insert into public.farm_members (farm_id, user_id, role, email, display_name, avatar_url)
      select fid, u.id, 'admin', u.email,
             coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', u.email),
             coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
      from auth.users u where u.id = r.owner_id;
    end if;
    update public.geckos   set farm_id = fid where owner_id = r.owner_id and farm_id is null;
    update public.logs     set farm_id = fid where owner_id = r.owner_id and farm_id is null;
    update public.clutches set farm_id = fid where owner_id = r.owner_id and farm_id is null;
    update public.pairings set farm_id = fid where owner_id = r.owner_id and farm_id is null;
  end loop;
end $$;

-- 기록의 소속(farm_id)은 개체의 소속을 따라갑니다
update public.logs l set farm_id = g.farm_id from public.geckos g where l.gecko_id = g.id and l.farm_id is distinct from g.farm_id;

alter table public.geckos   alter column farm_id set not null;
alter table public.logs     alter column farm_id set not null;
alter table public.clutches alter column farm_id set not null;
alter table public.pairings alter column farm_id set not null;

------------------------------------------------------------------------------
-- 4) 개체별 최근 기록 (목록 화면용)
------------------------------------------------------------------------------
create or replace view public.gecko_latest with (security_invoker = on) as
  select distinct on (gecko_id, type) gecko_id, type, date, grams, food, ate, farm_id
  from public.logs
  where type in ('weight', 'feed', 'shed', 'poop')
  order by gecko_id, type, date desc, created_at desc;

------------------------------------------------------------------------------
-- 5) 권한 확인 함수
--    관리자(admin): 전부 · 기록 담당(keeper): 기록 추가·수정 · 보기 전용(viewer): 보기만
------------------------------------------------------------------------------
create or replace function public.farm_role(f text) returns text
language sql stable security definer set search_path = public as $$
  select role from public.farm_members where farm_id = f and user_id = auth.uid()
$$;

------------------------------------------------------------------------------
-- 6) 보안 규칙
------------------------------------------------------------------------------
alter table public.farms        enable row level security;
alter table public.farm_members enable row level security;
alter table public.farm_invites enable row level security;
alter table public.geckos       enable row level security;
alter table public.logs         enable row level security;
alter table public.clutches     enable row level security;
alter table public.pairings     enable row level security;
alter table public.settings     enable row level security;

-- 1판 규칙 지우기
drop policy if exists "own rows" on public.geckos;
drop policy if exists "own rows" on public.logs;
drop policy if exists "own rows" on public.clutches;
drop policy if exists "own rows" on public.pairings;

-- 가족·브랜드
drop policy if exists "farm: members read"  on public.farms;
drop policy if exists "farm: admins update" on public.farms;
create policy "farm: members read"  on public.farms for select to authenticated using (public.farm_role(id) is not null);
create policy "farm: admins update" on public.farms for update to authenticated using (public.farm_role(id) = 'admin') with check (public.farm_role(id) = 'admin');

-- 구성원
drop policy if exists "members: read"          on public.farm_members;
drop policy if exists "members: admins update" on public.farm_members;
drop policy if exists "members: remove"        on public.farm_members;
create policy "members: read"          on public.farm_members for select to authenticated using (public.farm_role(farm_id) is not null);
create policy "members: admins update" on public.farm_members for update to authenticated using (public.farm_role(farm_id) = 'admin') with check (public.farm_role(farm_id) = 'admin');
create policy "members: remove"        on public.farm_members for delete to authenticated using (public.farm_role(farm_id) = 'admin' or user_id = (select auth.uid()));

-- 초대
drop policy if exists "invites: admins" on public.farm_invites;
create policy "invites: admins" on public.farm_invites for all to authenticated using (public.farm_role(farm_id) = 'admin') with check (public.farm_role(farm_id) = 'admin');

-- 개체·산란·메이팅: 구성원은 보기, 관리자만 쓰기
drop policy if exists "farm read"  on public.geckos;
drop policy if exists "farm write" on public.geckos;
create policy "farm read"  on public.geckos for select to authenticated using (public.farm_role(farm_id) is not null);
create policy "farm write" on public.geckos for all    to authenticated using (public.farm_role(farm_id) = 'admin') with check (public.farm_role(farm_id) = 'admin');

drop policy if exists "farm read"  on public.clutches;
drop policy if exists "farm write" on public.clutches;
create policy "farm read"  on public.clutches for select to authenticated using (public.farm_role(farm_id) is not null);
create policy "farm write" on public.clutches for all    to authenticated using (public.farm_role(farm_id) = 'admin') with check (public.farm_role(farm_id) = 'admin');

drop policy if exists "farm read"  on public.pairings;
drop policy if exists "farm write" on public.pairings;
create policy "farm read"  on public.pairings for select to authenticated using (public.farm_role(farm_id) is not null);
create policy "farm write" on public.pairings for all    to authenticated using (public.farm_role(farm_id) = 'admin') with check (public.farm_role(farm_id) = 'admin');

-- 기록: 구성원은 보기, 관리자·기록 담당은 쓰기
drop policy if exists "farm read"  on public.logs;
drop policy if exists "farm write" on public.logs;
create policy "farm read"  on public.logs for select to authenticated using (public.farm_role(farm_id) is not null);
create policy "farm write" on public.logs for all    to authenticated using (public.farm_role(farm_id) in ('admin', 'keeper')) with check (public.farm_role(farm_id) in ('admin', 'keeper'));

-- 1판 설정: 본인 것만
drop policy if exists "own rows" on public.settings;
create policy "own rows" on public.settings for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- 관리자가 한 명도 없는 가족·브랜드가 생기지 않도록 막기
create or replace function public.keep_one_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.farms where id = old.farm_id)
     and not exists (select 1 from public.farm_members where farm_id = old.farm_id and role = 'admin') then
    raise exception 'last_admin' using hint = '관리자가 최소 한 명 있어야 합니다.';
  end if;
  return null;
end $$;
drop trigger if exists keep_one_admin on public.farm_members;
create trigger keep_one_admin after update or delete on public.farm_members
  for each row execute function public.keep_one_admin();

------------------------------------------------------------------------------
-- 7) 가족·브랜드 만들기 · 초대 확인 · 초대 수락
------------------------------------------------------------------------------
drop function if exists public.create_farm(text);
create or replace function public.create_farm(fname text, funit text default '가족') returns text
language plpgsql security definer set search_path = public as $$
declare
  fid text := gen_random_uuid()::text;
  u   auth.users;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select * into u from auth.users where id = auth.uid();
  insert into public.farms (id, name, created_by, features)
  values (fid, coalesce(nullif(trim(fname), ''), '우리 게코'), auth.uid(),
          jsonb_build_object('unit', case when funit = '브랜드' then '브랜드' else '가족' end));
  insert into public.farm_members (farm_id, user_id, role, email, display_name, avatar_url)
  values (fid, auth.uid(), 'admin', u.email,
          coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', u.email),
          coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture'));
  return fid;
end $$;

create or replace function public.invite_info(c text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  i public.farm_invites;
  f public.farms;
begin
  select * into i from public.farm_invites where code = c;
  if not found then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  select * into f from public.farms where id = i.farm_id;
  if i.used_at is not null then return jsonb_build_object('ok', false, 'reason', 'used', 'farm', f.name, 'unit', coalesce(f.features ->> 'unit', '가족')); end if;
  if i.expires_at < now() then return jsonb_build_object('ok', false, 'reason', 'expired', 'farm', f.name, 'unit', coalesce(f.features ->> 'unit', '가족')); end if;
  return jsonb_build_object('ok', true, 'farm', f.name, 'unit', coalesce(f.features ->> 'unit', '가족'), 'role', i.role, 'expires', i.expires_at,
    'from', (select coalesce(m.display_name, m.email) from public.farm_members m where m.farm_id = i.farm_id and m.user_id = i.created_by),
    'member', exists (select 1 from public.farm_members where farm_id = i.farm_id and user_id = auth.uid()));
end $$;

create or replace function public.accept_invite(c text) returns text
language plpgsql security definer set search_path = public as $$
declare
  i public.farm_invites;
  u auth.users;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select * into i from public.farm_invites where code = c for update;
  if not found then raise exception 'invite_not_found'; end if;
  if i.used_at is not null then raise exception 'invite_used'; end if;
  if i.expires_at < now() then raise exception 'invite_expired'; end if;
  select * into u from auth.users where id = auth.uid();
  insert into public.farm_members (farm_id, user_id, role, email, display_name, avatar_url)
  values (i.farm_id, auth.uid(), i.role, u.email,
          coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', u.email),
          coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture'))
  on conflict (farm_id, user_id) do nothing;
  update public.farm_invites set used_at = now(), used_by = auth.uid() where code = c;
  return i.farm_id;
end $$;

------------------------------------------------------------------------------
-- 8) QR 공개 카드: 로그인 없이 정해진 항목만 보여 줌
--    항상 공개: 사진, 개체번호, 이름, 모프, 성별
--    선택 공개(가족·브랜드 기본값 + 개체별 설정): hatch, lineage, breeder, weight, care, sale, buyer, notes
--    분양받은 분의 연락처와 무게·급여 외의 개인 정보는 어떤 설정으로도 공개되지 않습니다.
------------------------------------------------------------------------------
create or replace function public.pub_node(nid text, ext text, depth int) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  a public.geckos;
  r jsonb;
begin
  if nid is not null then
    select * into a from public.geckos where id = nid;
    if not found then return jsonb_build_object('kind', 'ext', 'label', '삭제된 개체'); end if;
    if not a.public_on then return jsonb_build_object('kind', 'private', 'sex', a.sex); end if;
    r := jsonb_build_object('kind', 'id', 'id', a.id, 'code', a.code, 'name', a.name, 'morph', a.morph, 'sex', a.sex, 'photo', a.photo_path);
    if depth > 1 then
      r := r || jsonb_build_object('sire', public.pub_node(a.sire_id, a.sire_ext, depth - 1), 'dam', public.pub_node(a.dam_id, a.dam_ext, depth - 1));
    end if;
    return r;
  end if;
  if coalesce(trim(ext), '') <> '' then return jsonb_build_object('kind', 'ext', 'label', ext); end if;
  return jsonb_build_object('kind', 'none');
end $$;

create or replace function public.public_gecko(gid text, preview boolean default false) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  g      public.geckos;
  f      public.farms;
  member boolean;
  vis    jsonb;
  res    jsonb;
begin
  select * into g from public.geckos where id = gid;
  if not found then return null; end if;
  select * into f from public.farms where id = g.farm_id;
  member := exists (select 1 from public.farm_members where farm_id = g.farm_id and user_id = auth.uid());
  if not g.public_on and not (member and not preview) then
    return jsonb_build_object('private', true, 'member', member, 'unit', coalesce(f.features ->> 'unit', '가족'), 'farm_id', case when member then g.farm_id end, 'farm_name', case when member then f.name end);
  end if;
  vis := coalesce(f.public_defaults, '{}'::jsonb) || coalesce(g.public_fields, '{}'::jsonb);
  res := jsonb_build_object(
    'id', g.id, 'code', g.code, 'name', g.name, 'morph', g.morph, 'sex', g.sex, 'photo', g.photo_path, 'status', g.status,
    'vis', vis, 'member', member, 'unit', coalesce(f.features ->> 'unit', '가족'),
    'species', g.species,
    'species_name', (select e ->> 'n' from jsonb_array_elements(case when jsonb_typeof(f.features -> 'species') = 'array' then f.features -> 'species' else '[]'::jsonb end) e where e ->> 'k' = g.species limit 1),
    'species_class', (select e ->> 'c' from jsonb_array_elements(case when jsonb_typeof(f.features -> 'species') = 'array' then f.features -> 'species' else '[]'::jsonb end) e where e ->> 'k' = g.species limit 1),
    'farm_id', case when member then g.farm_id end, 'farm_name', case when member then f.name end);
  if coalesce((vis ->> 'breeder')::boolean, false) then
    res := res || jsonb_build_object('farm', jsonb_build_object('name', f.name, 'logo', f.logo_path, 'placeholder', f.placeholder, 'placeholder_url', f.placeholder_url));
  end if;
  if coalesce((vis ->> 'hatch')::boolean, false) then
    res := res || jsonb_build_object('hatch_date', g.hatch_date, 'hatch_mode', g.hatch_mode);
  end if;
  if coalesce((vis ->> 'lineage')::boolean, false) then
    res := res || jsonb_build_object('sire', public.pub_node(g.sire_id, g.sire_ext, 2), 'dam', public.pub_node(g.dam_id, g.dam_ext, 2));
  end if;
  if coalesce((vis ->> 'weight')::boolean, false) then
    res := res || jsonb_build_object('weights', coalesce((
      select jsonb_agg(jsonb_build_object('d', l.date, 'g', l.grams) order by l.date, l.created_at)
      from public.logs l where l.gecko_id = g.id and l.type = 'weight'), '[]'::jsonb));
  end if;
  if coalesce((vis ->> 'care')::boolean, false) then
    res := res || jsonb_build_object('care', coalesce((
      select jsonb_agg(x) from (
        select l.type as t, l.date as d, l.food, l.ate, l.quality as q
        from public.logs l where l.gecko_id = g.id and l.type in ('feed', 'shed', 'poop')
        order by l.date desc, l.created_at desc limit 20) x), '[]'::jsonb));
  end if;
  if g.status = 'active' and g.public_on and jsonb_typeof(g.listing) = 'object'
     and coalesce((f.features #>> '{shop,on}')::boolean, false) then
    res := res || jsonb_build_object(
      'listing', jsonb_build_object('price', g.listing -> 'price', 'note', g.listing ->> 'note', 'state', coalesce(g.listing ->> 'state', 'open')),
      'shop', jsonb_build_object('id', f.id, 'name', f.name, 'logo', f.logo_path,
        'kakao', f.features #>> '{shop,kakao}', 'insta', f.features #>> '{shop,insta}', 'phone', f.features #>> '{shop,phone}', 'link', f.features #>> '{shop,link}'));
  end if;
  if g.status = 'sold' and coalesce((vis ->> 'sale')::boolean, false) then
    res := res || jsonb_build_object('sale', jsonb_build_object('date', g.sale ->> 'date', 'price', g.sale -> 'price'));
  end if;
  if g.status = 'sold' and coalesce((vis ->> 'buyer')::boolean, false) then
    res := jsonb_set(res, '{sale}', coalesce(res -> 'sale', '{}'::jsonb) || jsonb_build_object('to', g.sale ->> 'to'));
  end if;
  if coalesce((vis ->> 'notes')::boolean, false) then
    res := res || jsonb_build_object('notes', g.notes);
  end if;
  return res;
end $$;

-- 분양 페이지 (2.6판): 로그인 없이 볼 수 있는 브랜드별 분양 개체 목록
--   분양 페이지를 켠 곳에서, 보유 중이고 공개 카드가 켜져 있으며 분양 등록한 개체만 보여 줍니다
create or replace function public.public_shop(fid text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  f    public.farms;
  shop jsonb;
begin
  select * into f from public.farms where id = fid;
  if not found then return null; end if;
  shop := case when jsonb_typeof(f.features -> 'shop') = 'object' then f.features -> 'shop' else '{}'::jsonb end;
  if not coalesce((shop ->> 'on')::boolean, false) then
    return jsonb_build_object('closed', true, 'name', f.name);
  end if;
  return jsonb_build_object(
    'id', f.id, 'name', f.name, 'logo', f.logo_path, 'unit', coalesce(f.features ->> 'unit', '가족'),
    'intro', shop ->> 'intro',
    'contact', jsonb_build_object('kakao', shop ->> 'kakao', 'insta', shop ->> 'insta', 'phone', shop ->> 'phone', 'link', shop ->> 'link'),
    'species', case when jsonb_typeof(f.features -> 'species') = 'array' then f.features -> 'species' else '[]'::jsonb end,
    'items', coalesce((
      select jsonb_agg(x.item order by x.since desc nulls last, x.code)
      from (
        select g.listing ->> 'since' as since, g.code,
          jsonb_build_object(
            'id', g.id, 'code', g.code, 'name', g.name, 'morph', g.morph, 'sex', g.sex, 'photo', g.photo_path, 'species', g.species,
            'hatch_date', case when coalesce(((coalesce(f.public_defaults, '{}'::jsonb) || coalesce(g.public_fields, '{}'::jsonb)) ->> 'hatch')::boolean, false) then g.hatch_date end,
            'hatch_mode', case when coalesce(((coalesce(f.public_defaults, '{}'::jsonb) || coalesce(g.public_fields, '{}'::jsonb)) ->> 'hatch')::boolean, false) then g.hatch_mode end,
            'price', g.listing -> 'price', 'note', g.listing ->> 'note', 'state', coalesce(g.listing ->> 'state', 'open')) as item
        from public.geckos g
        where g.farm_id = f.id and g.status = 'active' and g.public_on and jsonb_typeof(g.listing) = 'object'
      ) x), '[]'::jsonb));
end $$;

-- 분양 게시판 (2.7판): 분양 페이지를 켜고 '분양 게시판에 함께 올리기'를 고른 곳들의 분양 개체를 모아 보여 줌
--   brands: 참여한 가족·브랜드 목록(분양 중인 개체 수), items: 최근 분양 등록 순 개체 (최대 lim개)
create or replace function public.public_board(lim int default 300) returns jsonb
language sql stable security definer set search_path = public as $$
  with shops as (
    select f.id, f.name, f.logo_path, f.features, coalesce(f.public_defaults, '{}'::jsonb) as pdef
    from public.farms f
    where coalesce((f.features #>> '{shop,on}')::boolean, false)
      and coalesce((f.features #>> '{shop,board}')::boolean, false)
  ), listed as (
    select g.id, g.code, g.name, g.morph, g.sex, g.photo_path, g.species, g.hatch_date, g.hatch_mode, g.listing, g.public_fields, g.updated_at,
           s.id as fid, s.name as fname, s.logo_path as flogo, s.features as ffeat, s.pdef
    from public.geckos g join shops s on s.id = g.farm_id
    where g.status = 'active' and g.public_on and jsonb_typeof(g.listing) = 'object'
  ), recent as (
    select * from listed
    order by listing ->> 'since' desc nulls last, updated_at desc
    limit greatest(1, least(coalesce(lim, 300), 500))
  )
  select jsonb_build_object(
    'brands', coalesce((
      select jsonb_agg(jsonb_build_object(
          'id', s.id, 'name', s.name, 'logo', s.logo_path, 'unit', coalesce(s.features ->> 'unit', '가족'),
          'intro', s.features #>> '{shop,intro}', 'count', c.n, 'last', c.last)
        order by c.n > 0 desc, c.last desc nulls last, s.name)
      from shops s
      cross join lateral (select count(*) as n, max(l.listing ->> 'since') as last from listed l where l.fid = s.id) c), '[]'::jsonb),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
          'id', r.id, 'code', r.code, 'name', r.name, 'morph', r.morph, 'sex', r.sex, 'photo', r.photo_path, 'species', r.species,
          'species_name', (select e ->> 'n' from jsonb_array_elements(case when jsonb_typeof(r.ffeat -> 'species') = 'array' then r.ffeat -> 'species' else '[]'::jsonb end) e where e ->> 'k' = r.species limit 1),
          'species_class', (select e ->> 'c' from jsonb_array_elements(case when jsonb_typeof(r.ffeat -> 'species') = 'array' then r.ffeat -> 'species' else '[]'::jsonb end) e where e ->> 'k' = r.species limit 1),
          'hatch_date', case when coalesce(((r.pdef || coalesce(r.public_fields, '{}'::jsonb)) ->> 'hatch')::boolean, false) then r.hatch_date end,
          'hatch_mode', case when coalesce(((r.pdef || coalesce(r.public_fields, '{}'::jsonb)) ->> 'hatch')::boolean, false) then r.hatch_mode end,
          'price', r.listing -> 'price', 'note', r.listing ->> 'note', 'state', coalesce(r.listing ->> 'state', 'open'), 'since', r.listing ->> 'since',
          'fid', r.fid, 'fname', r.fname, 'flogo', r.flogo)
        order by r.listing ->> 'since' desc nulls last, r.updated_at desc)
      from recent r), '[]'::jsonb));
$$;

grant execute on function public.public_gecko(text, boolean) to anon, authenticated;
grant execute on function public.public_shop(text)            to anon, authenticated;
grant execute on function public.public_board(int)            to anon, authenticated;
grant execute on function public.invite_info(text)            to anon, authenticated;
grant execute on function public.create_farm(text, text)      to authenticated;
grant execute on function public.accept_invite(text)          to authenticated;

------------------------------------------------------------------------------
-- 8-1) 가계부 (2.3판): 지출·수입 내역. 관리자만 보고 쓸 수 있음
--      개체의 입양가(geckos.acquired_price)와 분양가(geckos.sale.price)는 앱이 가계부에 자동으로 함께 보여 줍니다
------------------------------------------------------------------------------
alter table public.geckos add column if not exists acquired_price bigint check (acquired_price is null or acquired_price >= 0);

create table if not exists public.ledger (
  id         text primary key,
  farm_id    text not null references public.farms (id) on delete cascade,
  owner_id   uuid default auth.uid() references auth.users (id) on delete set null,
  date       date not null,
  kind       text not null check (kind in ('expense', 'income')),
  category   text not null,
  amount     bigint not null check (amount >= 0),
  gecko_id   text references public.geckos (id) on delete set null,
  memo       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ledger_farm_date on public.ledger (farm_id, date desc);

alter table public.ledger enable row level security;
drop policy if exists "ledger: admins" on public.ledger;
create policy "ledger: admins" on public.ledger for all to authenticated
  using (public.farm_role(farm_id) = 'admin') with check (public.farm_role(farm_id) = 'admin');

------------------------------------------------------------------------------
-- 9) 사진 저장소
--    올리기·지우기: 본인 폴더(사용자 id)만
--    보기: 본인 폴더, 같은 가족·브랜드 개체의 사진, 공개 카드 개체의 사진, 로고
------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create or replace function public.photo_visible(obj text) returns boolean
language sql stable security definer set search_path = public as $$
  select (storage.foldername(obj))[1] = coalesce(auth.uid()::text, '-')
      or exists (select 1 from public.geckos g
                 where g.photo_path = obj
                   and (g.public_on or exists (select 1 from public.farm_members m where m.farm_id = g.farm_id and m.user_id = auth.uid())))
      or exists (select 1 from public.farms f where f.logo_path = obj)
$$;

drop policy if exists "photos: own read"   on storage.objects;
drop policy if exists "photos: read"       on storage.objects;
drop policy if exists "photos: own insert" on storage.objects;
drop policy if exists "photos: own update" on storage.objects;
drop policy if exists "photos: own delete" on storage.objects;
create policy "photos: read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'photos' and public.photo_visible(name));
create policy "photos: own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: own update" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "photos: own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
