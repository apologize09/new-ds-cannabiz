insert into public.plans (slug, name, description, monthly_price_cents, annual_price_cents, monthly_credits, annual_credits, features, sales_assisted) values
('basic', 'BASIC', 'Perfect for trying out the platform', 0, 0, 20, 240, '["Core platform access"]', false),
('brand-incubator', 'BRAND INCUBATOR', 'For new brands doing essential product selection and customization', 999, 10070, 50, 600, '["Product selection","Basic customization"]', false),
('tech-master', 'TECH MASTER', 'For marketing experts who need advanced features', 4999, 50390, 300, 3600, '["Advanced features","Priority processing"]', false),
('enterprise', 'ENTERPRISE', 'Value-added service for offline customers', null, null, null, null, '["Unlimited credits","Dedicated support"]', true)
on conflict (slug) do update set name = excluded.name, description = excluded.description,
 monthly_price_cents = excluded.monthly_price_cents, annual_price_cents = excluded.annual_price_cents,
 monthly_credits = excluded.monthly_credits, annual_credits = excluded.annual_credits, features = excluded.features;

insert into public.ai_action_costs(action, credit_cost) values
('product_match', 1), ('background_removal', 2), ('design_generation', 5)
on conflict (action) do update set credit_cost = excluded.credit_cost;

insert into public.categories(slug, name, sort_order) values
('all-in-one', 'All-In-One Disposable', 10),
('510-cart-battery', '510 Cart & Battery', 20),
('pod-system', 'Pod System', 30),
('dab-hardware', 'Dab Hardware', 40)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;
