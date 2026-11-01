-- Optional. Run after schema.sql.
-- Categories are the six requested by the business. Products below are SAMPLE DATA ONLY:
-- names, prices and stock are not real inventory. They show a "Sample" tag on the storefront
-- and can be deleted from Admin > Products once real products are added.

insert into public.categories (name, slug, description, sort_order) values
  ('Arabian Perfumes', 'arabian-perfumes', 'Rich oud, amber and musk compositions from the Arabian tradition.', 1),
  ('Designer Fragrances', 'designer-fragrances', 'Well-known designer houses and signature scents.', 2),
  ('Women''s Fragrances', 'womens-fragrances', 'Floral, fruity and gourmand scents for her.', 3),
  ('Men''s Fragrances', 'mens-fragrances', 'Woody, spicy and fresh scents for him.', 4),
  ('Unisex Fragrances', 'unisex-fragrances', 'Scents made to be worn by anyone.', 5),
  ('Body Sprays', 'body-sprays', 'Light everyday mists and body sprays.', 6)
on conflict (slug) do nothing;

insert into public.products (slug, name, brand, description, price, category_id, stock_quantity, is_featured, is_best_seller, is_new_arrival, is_sample)
select v.slug, v.name, v.brand, v.description, v.price, c.id, v.stock, v.f, v.b, v.n, true
from (values
  ('sample-amber-oud', 'Sample Amber Oud Eau de Parfum', 'Sample Brand', 'Sample product. Replace with a real description. Warm amber, smoked oud and soft vanilla.', 45000, 'arabian-perfumes', 12, true, true, false),
  ('sample-rose-musk', 'Sample Rose Musk Eau de Parfum', 'Sample Brand', 'Sample product. Replace with a real description. Damask rose over clean white musk.', 38000, 'womens-fragrances', 8, true, false, true),
  ('sample-cedar-noir', 'Sample Cedar Noir Eau de Toilette', 'Sample Brand', 'Sample product. Replace with a real description. Cedarwood, black pepper and leather.', 52000, 'mens-fragrances', 6, false, true, true),
  ('sample-saffron-veil', 'Sample Saffron Veil Parfum', 'Sample Brand', 'Sample product. Replace with a real description. Saffron, jasmine and sandalwood.', 61000, 'unisex-fragrances', 4, true, false, true),
  ('sample-citrus-mist', 'Sample Citrus Body Spray', 'Sample Brand', 'Sample product. Replace with a real description. Bright citrus daily body mist.', 9500, 'body-sprays', 30, false, true, false),
  ('sample-signature-classic', 'Sample Designer Classic', 'Sample Brand', 'Sample product. Replace with a real description. A classic designer-style fragrance.', 78000, 'designer-fragrances', 3, false, false, true)
) as v(slug, name, brand, description, price, cat, stock, f, b, n)
join public.categories c on c.slug = v.cat
on conflict (slug) do nothing;
