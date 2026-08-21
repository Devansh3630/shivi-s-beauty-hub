-- Add Waxing Category and Sub-Services to public.services

INSERT INTO public.services (category, name, price, duration_minutes, is_active)
VALUES
  ('Waxing', 'Full Arms Waxing', 250, 25, true),
  ('Waxing', 'Half Arms Waxing', 150, 15, true),
  ('Waxing', 'Full Legs Waxing', 450, 35, true),
  ('Waxing', 'Half Legs Waxing', 250, 20, true),
  ('Waxing', 'Underarms Waxing', 80, 10, true),
  ('Waxing', 'Full Body Waxing', 1499, 90, true),
  ('Waxing', 'Other Available Waxing Services', 200, 20, true)
ON CONFLICT DO NOTHING;
