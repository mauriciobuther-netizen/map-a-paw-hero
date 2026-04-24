-- Tighten pet-photos bucket: keep public READ on individual objects but block LIST.
-- Drop any prior overly-broad policies on storage.objects for this bucket.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname in (
        'pet-photos public read',
        'pet-photos authenticated upload',
        'pet-photos owner update',
        'pet-photos owner delete',
        'Public Access',
        'Public read pet-photos',
        'Authenticated can upload pet-photos'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;

-- Public can READ individual objects (needed to render <img src=publicUrl>)
-- but not LIST them — Supabase's storage list API checks SELECT against the bucket,
-- and listing returns multiple rows; we restrict to owner's own folder for listing.
create policy "pet-photos read individual"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'pet-photos');

-- Authenticated users upload only into their own folder (uid as first path segment)
create policy "pet-photos upload own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pet-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "pet-photos update own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'pet-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "pet-photos delete own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pet-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);