-- =========================================================
-- ENUMS
-- =========================================================
create type public.app_role as enum ('user', 'trusted_user', 'moderator', 'admin');

create type public.report_status as enum ('active', 'under_review', 'resolved', 'archived', 'hidden');

create type public.validation_status as enum (
  'unverified', 'in_validation', 'confirmed', 'inconsistent', 'possible_fake', 'hidden_for_review'
);

create type public.user_account_status as enum ('active', 'restricted', 'suspended', 'shadow_banned');

create type public.species_type as enum ('dog', 'cat');

create type public.urgency_level as enum ('low', 'medium', 'high', 'critical');

create type public.validation_action as enum (
  'confirm_seen', 'deny_not_there', 'confirm_info', 'possible_fake', 'already_helped', 'animal_removed'
);

-- =========================================================
-- USER_ROLES (separated, never on profiles — security best practice)
-- =========================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- PROFILES — additive columns
-- =========================================================
alter table public.profiles
  add column if not exists trust_score integer not null default 25,
  add column if not exists trust_level text not null default 'initial',
  add column if not exists account_status public.user_account_status not null default 'active',
  add column if not exists reports_count integer not null default 0,
  add column if not exists validated_reports_count integer not null default 0,
  add column if not exists rejected_reports_count integer not null default 0,
  add column if not exists confirmed_help_count integer not null default 0,
  add column if not exists received_flags_count integer not null default 0,
  add column if not exists last_active_at timestamptz;

-- =========================================================
-- TERMS OF USE
-- =========================================================
create table public.terms_versions (
  id uuid primary key default gen_random_uuid(),
  version_code text not null unique,
  title text not null,
  content text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.terms_versions enable row level security;

create policy "Active terms are public"
on public.terms_versions for select
to anon, authenticated
using (is_active = true);

create policy "Admins manage terms"
on public.terms_versions for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create table public.user_terms_acceptance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  terms_version_id uuid references public.terms_versions(id) on delete restrict not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  unique (user_id, terms_version_id)
);

alter table public.user_terms_acceptance enable row level security;

create policy "Users view own acceptance"
on public.user_terms_acceptance for select
to authenticated
using (auth.uid() = user_id);

create policy "Users record own acceptance"
on public.user_terms_acceptance for insert
to authenticated
with check (auth.uid() = user_id);

-- Seed initial terms version
insert into public.terms_versions (version_code, title, content, is_active)
values (
  'v1.0',
  'Termos de Uso e Responsabilidade',
  E'Esta plataforma é colaborativa e informativa. As informações são fornecidas pelos utilizadores e a plataforma não garante sua veracidade absoluta.\n\nA plataforma facilita a conexão entre pessoas que querem ajudar animais abandonados, mas NÃO substitui veterinários, autoridades competentes ou equipas profissionais de resgate.\n\nAo agir presencialmente em qualquer situação reportada, o utilizador o faz por sua própria conta e risco. Em situações de perigo, procure ajuda profissional ou autoridades.\n\nA plataforma reserva-se o direito de moderar conteúdo, suspender contas que violem estes termos e cooperar com autoridades quando legalmente exigido.\n\nAo continuar, declaro ter lido, compreendido e aceito estes termos.',
  true
);

-- =========================================================
-- ANIMAL_REPORTS
-- =========================================================
create table public.animal_reports (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  species public.species_type not null,
  title text not null,
  description text not null,
  color_description text,
  size_category text,
  apparent_condition text,
  behavior_tags text[] not null default '{}',
  urgency public.urgency_level not null default 'medium',
  risk_tags text[] not null default '{}',
  latitude double precision not null,
  longitude double precision not null,
  location_text text,
  city text,
  state text,
  occurrence_at timestamptz not null default now(),
  reported_at timestamptz not null default now(),
  status public.report_status not null default 'active',
  validation_status public.validation_status not null default 'unverified',
  duplicate_group_id uuid,
  main_image_url text not null,
  image_metadata jsonb not null default '{}'::jsonb,
  gps_accuracy double precision,
  visibility_score integer not null default 50,
  trust_weight_score integer not null default 25,
  is_shadow_hidden boolean not null default false,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_animal_reports_geo on public.animal_reports (latitude, longitude);
create index idx_animal_reports_status on public.animal_reports (status, validation_status);
create index idx_animal_reports_created_by on public.animal_reports (created_by);
create index idx_animal_reports_reported_at on public.animal_reports (reported_at desc);

alter table public.animal_reports enable row level security;

create policy "Active reports are publicly viewable"
on public.animal_reports for select
to anon, authenticated
using (status = 'active' and is_shadow_hidden = false);

create policy "Authors can view their own reports"
on public.animal_reports for select
to authenticated
using (auth.uid() = created_by);

create policy "Moderators view everything"
on public.animal_reports for select
to authenticated
using (public.has_role(auth.uid(), 'moderator') or public.has_role(auth.uid(), 'admin'));

create policy "Authenticated users can create reports"
on public.animal_reports for insert
to authenticated
with check (auth.uid() = created_by);

create policy "Authors can update their own reports"
on public.animal_reports for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "Authors can delete their own reports"
on public.animal_reports for delete
to authenticated
using (auth.uid() = created_by);

create policy "Moderators can update reports"
on public.animal_reports for update
to authenticated
using (public.has_role(auth.uid(), 'moderator') or public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'moderator') or public.has_role(auth.uid(), 'admin'));

create trigger trg_animal_reports_updated_at
before update on public.animal_reports
for each row execute function public.set_updated_at();

-- =========================================================
-- REPORT_IMAGES
-- =========================================================
create table public.report_images (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.animal_reports(id) on delete cascade not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  image_url text not null,
  image_type text not null default 'evidence',
  metadata jsonb not null default '{}'::jsonb,
  hash_signature text,
  ai_check_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_report_images_report on public.report_images (report_id);

alter table public.report_images enable row level security;

create policy "Report images visible if report visible"
on public.report_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.animal_reports r
    where r.id = report_id
      and (
        (r.status = 'active' and r.is_shadow_hidden = false)
        or r.created_by = auth.uid()
        or public.has_role(auth.uid(), 'moderator')
        or public.has_role(auth.uid(), 'admin')
      )
  )
);

create policy "Authenticated users can add images to reports"
on public.report_images for insert
to authenticated
with check (auth.uid() = uploaded_by);

create policy "Uploaders can delete their images"
on public.report_images for delete
to authenticated
using (auth.uid() = uploaded_by);

-- =========================================================
-- REPORT_VALIDATIONS
-- =========================================================
create table public.report_validations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.animal_reports(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  action_type public.validation_action not null,
  note text,
  validation_weight integer not null default 1,
  created_at timestamptz not null default now(),
  unique (report_id, user_id, action_type)
);

create index idx_report_validations_report on public.report_validations (report_id);
create index idx_report_validations_user on public.report_validations (user_id);

alter table public.report_validations enable row level security;

create policy "Validations visible if report visible"
on public.report_validations for select
to anon, authenticated
using (
  exists (
    select 1 from public.animal_reports r
    where r.id = report_id
      and r.status = 'active'
      and r.is_shadow_hidden = false
  )
  or auth.uid() = user_id
  or public.has_role(auth.uid(), 'moderator')
  or public.has_role(auth.uid(), 'admin')
);

create policy "Authenticated users create validations"
on public.report_validations for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users delete their own validations"
on public.report_validations for delete
to authenticated
using (auth.uid() = user_id);

-- =========================================================
-- AUDIT_LOGS
-- =========================================================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_entity on public.audit_logs (entity_type, entity_id);
create index idx_audit_logs_actor on public.audit_logs (actor_user_id);

alter table public.audit_logs enable row level security;

create policy "Moderators view audit logs"
on public.audit_logs for select
to authenticated
using (public.has_role(auth.uid(), 'moderator') or public.has_role(auth.uid(), 'admin'));

create policy "System inserts audit logs"
on public.audit_logs for insert
to authenticated
with check (auth.uid() = actor_user_id);

-- =========================================================
-- BUSINESS LOGIC: recompute report validation_status
-- =========================================================
create or replace function public.recompute_report_validation(_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  positive_weight integer;
  negative_weight integer;
  fake_weight integer;
  removed_weight integer;
  new_status public.validation_status;
begin
  select coalesce(sum(validation_weight), 0)
    into positive_weight
  from public.report_validations
  where report_id = _report_id
    and action_type in ('confirm_seen', 'confirm_info');

  select coalesce(sum(validation_weight), 0)
    into negative_weight
  from public.report_validations
  where report_id = _report_id
    and action_type = 'deny_not_there';

  select coalesce(sum(validation_weight), 0)
    into fake_weight
  from public.report_validations
  where report_id = _report_id
    and action_type = 'possible_fake';

  select coalesce(sum(validation_weight), 0)
    into removed_weight
  from public.report_validations
  where report_id = _report_id
    and action_type in ('already_helped', 'animal_removed');

  if fake_weight >= 5 and fake_weight > positive_weight then
    new_status := 'possible_fake';
  elsif positive_weight >= 5 and positive_weight > (negative_weight + fake_weight) * 2 then
    new_status := 'confirmed';
  elsif (negative_weight + fake_weight) >= 3 and (negative_weight + fake_weight) > positive_weight then
    new_status := 'inconsistent';
  elsif positive_weight + negative_weight + fake_weight + removed_weight > 0 then
    new_status := 'in_validation';
  else
    new_status := 'unverified';
  end if;

  update public.animal_reports
  set validation_status = new_status,
      updated_at = now()
  where id = _report_id;
end;
$$;

-- =========================================================
-- BUSINESS LOGIC: recompute user trust_score
-- =========================================================
create or replace function public.recompute_user_trust(_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  base_score integer := 25;
  reports_total integer;
  validated_total integer;
  rejected_total integer;
  helps_total integer;
  flags_total integer;
  account_age_days integer;
  computed integer;
  level_label text;
begin
  select count(*) into reports_total
  from public.animal_reports where created_by = _user_id;

  select count(*) into validated_total
  from public.animal_reports
  where created_by = _user_id and validation_status = 'confirmed';

  select count(*) into rejected_total
  from public.animal_reports
  where created_by = _user_id and validation_status in ('possible_fake', 'inconsistent');

  select coalesce(confirmed_help_count, 0), coalesce(received_flags_count, 0)
    into helps_total, flags_total
  from public.profiles where id = _user_id;

  select greatest(0, extract(day from now() - created_at))::int
    into account_age_days
  from public.profiles where id = _user_id;

  computed := base_score
    + least(20, validated_total * 4)
    + least(15, helps_total * 3)
    + least(10, account_age_days / 30)
    + least(10, reports_total)
    - least(40, rejected_total * 8)
    - least(30, flags_total * 5);

  computed := greatest(0, least(100, computed));

  if computed >= 75 then
    level_label := 'highly_trusted';
  elsif computed >= 50 then
    level_label := 'trusted';
  elsif computed >= 25 then
    level_label := 'initial';
  else
    level_label := 'low';
  end if;

  update public.profiles
  set trust_score = computed,
      trust_level = level_label,
      reports_count = reports_total,
      validated_reports_count = validated_total,
      rejected_reports_count = rejected_total,
      updated_at = now()
  where id = _user_id;
end;
$$;

-- =========================================================
-- TRIGGERS — validations cascade
-- =========================================================
create or replace function public.handle_validation_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_report uuid;
  report_author uuid;
begin
  affected_report := coalesce(new.report_id, old.report_id);

  perform public.recompute_report_validation(affected_report);

  select created_by into report_author
  from public.animal_reports where id = affected_report;

  if report_author is not null then
    perform public.recompute_user_trust(report_author);
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_validation_change
after insert or update or delete on public.report_validations
for each row execute function public.handle_validation_change();

-- =========================================================
-- TRIGGER — bump report counters on insert/delete of reports
-- =========================================================
create or replace function public.handle_report_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.created_by is not null then
    perform public.recompute_user_trust(new.created_by);
  elsif tg_op = 'DELETE' and old.created_by is not null then
    perform public.recompute_user_trust(old.created_by);
  end if;
  return coalesce(new, old);
end;
$$;

create trigger trg_report_change
after insert or delete on public.animal_reports
for each row execute function public.handle_report_change();

create trigger trg_animal_reports_set_updated
before update on public.animal_reports
for each row execute function public.set_updated_at();