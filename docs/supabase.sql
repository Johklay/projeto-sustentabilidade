begin;

create table if not exists public.participantes (
  id bigint generated always as identity primary key,
  nome text not null,
  created_at timestamptz not null default now(),
  constraint participantes_nome_valido
    check (nome = btrim(nome) and char_length(nome) between 1 and 100)
);

alter table public.participantes enable row level security;

grant usage on schema public to anon, authenticated;
grant insert (nome) on table public.participantes to anon, authenticated;

drop policy if exists "Permitir cadastro de participantes" on public.participantes;
create policy "Permitir cadastro de participantes"
  on public.participantes
  for insert
  to anon, authenticated
  with check (char_length(btrim(nome)) between 1 and 100);

create or replace function public.contar_participantes()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) from public.participantes;
$$;

revoke all on function public.contar_participantes() from public;
grant execute on function public.contar_participantes() to anon, authenticated;

create or replace function public.notificar_contagem_participantes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('count', (select count(*) from public.participantes)),
    'count',
    'participantes',
    false
  );
  return new;
end;
$$;

revoke all on function public.notificar_contagem_participantes() from public, anon, authenticated;

drop trigger if exists participantes_notificar_contagem on public.participantes;
create trigger participantes_notificar_contagem
  after insert on public.participantes
  for each row
  execute function public.notificar_contagem_participantes();

commit;
