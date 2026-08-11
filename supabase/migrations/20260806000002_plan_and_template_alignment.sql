-- Keep backend billing/credit grants aligned with the customer-facing plan cards.
update public.plans
set
  monthly_price_cents = 0,
  annual_price_cents = 0,
  monthly_credits = 20,
  annual_credits = 240,
  sales_assisted = false
where slug = 'basic';

update public.plans
set
  monthly_price_cents = 999,
  annual_price_cents = 10070,
  monthly_credits = 50,
  annual_credits = 600,
  sales_assisted = false
where slug = 'brand-incubator';

update public.plans
set
  monthly_price_cents = 4999,
  annual_price_cents = 50390,
  monthly_credits = 300,
  annual_credits = 3600,
  sales_assisted = false
where slug = 'tech-master';

update public.plans
set
  monthly_price_cents = null,
  annual_price_cents = null,
  monthly_credits = null,
  annual_credits = null,
  sales_assisted = true
where slug = 'enterprise';

-- Seed the exact templates already approved and used by the frontend. Stable IDs
-- make this migration idempotent and keep saved-project foreign keys durable.
insert into public.templates (id, kind, name, model_id, image_url, metadata, active) values
  ('10001029-0000-4000-8000-000000000001', 'packaging', 'Center seal pouch mockup', '10001029', '/figma-local/13378619%201.png', '{"keywords":["center seal pouch","pouch","bag","packaging","plastic glossy","white paperboard","dieline","cr packaging"],"source":"approved-frontend-catalog"}', true),
  ('10001030-0000-4000-8000-000000000001', 'packaging', 'Drawer gift box mockup', '10001030', '/figma-local/12539375%201.png', '{"keywords":["drawer gift box","gift box","box","packaging","paperboard","rigid box"],"source":"approved-frontend-catalog"}', true),
  ('10001031-0000-4000-8000-000000000001', 'packaging', 'FEFCO 0300 box with lid mockup', '10001031', '/figma-local/12696258%201.png', '{"keywords":["fefco 0300","box with lid","box","packaging","white board","folding carton"],"source":"approved-frontend-catalog"}', true),
  ('10001032-0000-4000-8000-000000000001', 'packaging', 'Drawer gift box mockup', '10001032', '/figma-local/12516435%201.png', '{"keywords":["drawer box","gift box","slide box","packaging","paperboard"],"source":"approved-frontend-catalog"}', true),
  ('10001033-0000-4000-8000-000000000001', 'packaging', 'Cigarette box mockup', '10001033', '/figma-local/12597482%201.png', '{"keywords":["cigarette box","carton","vape packaging","pre roll box","packaging"],"source":"approved-frontend-catalog"}', true),
  ('10001034-0000-4000-8000-000000000001', 'packaging', 'Hanging tall flat medicine box mockup', '10001034', '/figma-local/12510172%202.png', '{"keywords":["hanging box","medicine box","retail box","flat box","packaging","merchandise packaging"],"source":"approved-frontend-catalog"}', true),
  ('10001029-0000-4000-8000-000000000002', 'merchandise', 'Oversized Hoodie Mockup', 'M0042', '/figma-local/%E4%BD%BF%E7%94%A8%E5%B7%A5%E5%85%B7%E7%94%9F%E6%88%90%E5%9B%BE%E7%89%87%20(21)%201.png', '{"keywords":["oversized hoodie","hoodie","sweatshirt","apparel","merchandise","logo print"],"source":"approved-frontend-catalog"}', true),
  ('10001030-0000-4000-8000-000000000002', 'merchandise', 'Tote Bag Mockup', 'M0043', '/figma-local/%E6%96%B0%E5%AF%B9%E8%AF%9D%20(7)%201.png', '{"keywords":["tote bag","bag","canvas bag","merchandise","logo print"],"source":"approved-frontend-catalog"}', true),
  ('10001031-0000-4000-8000-000000000002', 'merchandise', 'Baseball Cap With Hook Mockup', 'M0044', '/figma-local/%E6%8A%A0%E5%9B%BE%20(5)%201.png', '{"keywords":["baseball cap","cap","hat","hook","merchandise","logo print"],"source":"approved-frontend-catalog"}', true),
  ('10001032-0000-4000-8000-000000000002', 'merchandise', 'Women''s Crop Tank Top Mockup', 'M0045', '/figma-local/12621435%202.png', '{"keywords":["crop tank top","tank top","women apparel","shirt","merchandise","logo print"],"source":"approved-frontend-catalog"}', true),
  ('10001033-0000-4000-8000-000000000002', 'merchandise', 'Men''s Round Neck T-Shirt Mockup', 'M0046', '/figma-local/%E6%96%B0%E5%AF%B9%E8%AF%9D%20(6)%201.png', '{"keywords":["round neck t-shirt","t shirt","tee","apparel","merchandise","logo print"],"source":"approved-frontend-catalog"}', true),
  ('10001034-0000-4000-8000-000000000002', 'merchandise', 'Wristband Mockup', 'M0047', '/figma-local/13310424%202.png', '{"keywords":["wristband","band","bracelet","event merch","merchandise","logo print"],"source":"approved-frontend-catalog"}', true)
on conflict (id) do update set
  kind = excluded.kind,
  name = excluded.name,
  model_id = excluded.model_id,
  image_url = excluded.image_url,
  metadata = excluded.metadata,
  active = excluded.active;
