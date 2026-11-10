-- ============================================================
-- Beaute-bio - Storage (images produits)
-- À exécuter APRÈS schema.sql, dans Supabase > SQL Editor
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lecture publique des images (pour que les clients voient les photos)
create policy "public read product-images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Upload / modification / suppression réservés aux utilisateurs authentifiés (admin)
create policy "admin write product-images"
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "admin update product-images"
on storage.objects for update
using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "admin delete product-images"
on storage.objects for delete
using (bucket_id = 'product-images' and auth.role() = 'authenticated');
