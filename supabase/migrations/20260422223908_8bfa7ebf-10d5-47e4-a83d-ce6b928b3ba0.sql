-- Public bucket for pet photos
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

-- Anyone can view pet photos
create policy "Pet photos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'pet-photos');

-- Authenticated users can upload to their own folder (userId/...)
create policy "Authenticated users can upload pet photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pet-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own pet photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'pet-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own pet photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pet-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
