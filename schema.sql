-- 게코 관리노트 · Supabase 데이터베이스 구조 (2.1판: 농장·구성원·공개 카드·혈관리용 개체)
-- Supabase 관리 화면 → SQL Editor → New query 에 이 파일 전체를 붙여 넣고 Run 을 누르세요.
-- 처음 설치할 때도, 1판에서 올릴 때도 같은 파일을 쓰면 됩니다. 여러 번 실행해도 안전합니다.
-- 1판에서 올리면 기존 개체·기록·산란·메이팅·설정이 '내 농장'으로 자동으로 옮겨집니다.

------------------------------------------------------------------------------
-- 1) 농장(브리더 단위)과 구성원
------------------------------------------------------------------------------
create table if not exists public.farms (
  id              text primary key default gen_random_uuid()::text,
  name            text not null default '내 농장',
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

-- 1판의 사용자별 설정 (2판부터는 농장 설정을 씁니다. 옮기기용으로만 남겨 둡니다)
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

-- 상태에 '혈관리용(ref)' 추가: 내 개체는 아니지만 혈통도를 잇기 위해 등록하는 개체
alter table public.geckos drop constraint if exists geckos_status_check;
alter table public.geckos add constraint geckos_status_check check (status in ('active', 'sold', 'dead', 'ref'));

create index if not exists geckos_farm   on public.geckos (farm_id);
create index if not exists logs_farm     on public.logs (farm_id);
create index if not exists clutches_farm on public.clutches (farm_id);
create index if not exists pairings_farm on public.pairings (farm_id);

------------------------------------------------------------------------------
-- 3) 1판 데이터 옮기기: 사용자마다 '내 농장'을 만들고 기존 데이터를 연결
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
      select fid, '내 농장', r.owner_id,
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

-- 기록의 농장은 개체의 농장을 따라갑니다
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

-- 농장
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

-- 관리자가 한 명도 없는 농장이 생기지 않도록 막기
create or replace function public.keep_one_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.farms where id = old.farm_id)
     and not exists (select 1 from public.farm_members where farm_id = old.farm_id and role = 'admin') then
    raise exception 'last_admin' using hint = '농장에는 관리자가 최소 한 명 있어야 합니다.';
  end if;
  return null;
end $$;
drop trigger if exists keep_one_admin on public.farm_members;
create trigger keep_one_admin after update or delete on public.farm_members
  for each row execute function public.keep_one_admin();

------------------------------------------------------------------------------
-- 7) 농장 만들기 · 초대 확인 · 초대 수락
------------------------------------------------------------------------------
create or replace function public.create_farm(fname text) returns text
language plpgsql security definer set search_path = public as $$
declare
  fid text := gen_random_uuid()::text;
  u   auth.users;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select * into u from auth.users where id = auth.uid();
  insert into public.farms (id, name, created_by) values (fid, coalesce(nullif(trim(fname), ''), '내 농장'), auth.uid());
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
  if i.used_at is not null then return jsonb_build_object('ok', false, 'reason', 'used', 'farm', f.name); end if;
  if i.expires_at < now() then return jsonb_build_object('ok', false, 'reason', 'expired', 'farm', f.name); end if;
  return jsonb_build_object('ok', true, 'farm', f.name, 'role', i.role, 'expires', i.expires_at,
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
--    선택 공개(농장 기본값 + 개체별 설정): hatch, lineage, breeder, weight, care, sale, buyer, notes
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
    return jsonb_build_object('private', true, 'member', member, 'farm_id', case when member then g.farm_id end, 'farm_name', case when member then f.name end);
  end if;
  vis := coalesce(f.public_defaults, '{}'::jsonb) || coalesce(g.public_fields, '{}'::jsonb);
  res := jsonb_build_object(
    'id', g.id, 'code', g.code, 'name', g.name, 'morph', g.morph, 'sex', g.sex, 'photo', g.photo_path, 'status', g.status,
    'vis', vis, 'member', member,
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

grant execute on function public.public_gecko(text, boolean) to anon, authenticated;
grant execute on function public.invite_info(text)            to anon, authenticated;
grant execute on function public.create_farm(text)            to authenticated;
grant execute on function public.accept_invite(text)          to authenticated;

------------------------------------------------------------------------------
-- 9) 사진 저장소
--    올리기·지우기: 본인 폴더(사용자 id)만
--    보기: 본인 폴더, 같은 농장 개체의 사진, 공개 카드 개체의 사진, 농장 로고
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
