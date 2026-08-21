-- Migration: Add all requested boutique stitching and designing options to boutique_designs table
INSERT INTO public.boutique_designs (outfit_type, name, stitching_price, image_url)
VALUES
  ('Suit Stitching', 'Classic & Designer Salwar Suit', 799, 'https://images.unsplash.com/photo-1610030469668-8e9f34d2e5b6?w=600&q=80'),
  ('Suit Stitching', 'Straight Pant / Palazzo Suit Set', 899, 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80'),
  ('Kurti Stitching', 'Straight & A-Line Daily Kurti', 449, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'),
  ('Kurti Stitching', 'Alia Cut & Nayra Cut Flare Kurti', 599, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'),
  ('Blouse Stitching', 'Princess Cut Padded Blouse', 499, 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80'),
  ('Blouse Stitching', 'Classic 4-Tucks & Katori Blouse', 399, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'),
  ('Lehenga Stitching', 'Bridal & Party Can-Can Lehenga', 1799, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80'),
  ('Dress Stitching', 'Indo-Western Fusion Gown & Maxi', 1199, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80'),
  ('Saree Blouse Designing', 'Designer Sabyasachi & Halter Blouse', 899, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'),
  ('Alterations & Fittings', 'Express Size Alteration & Fitting', 149, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80'),
  ('Custom Dress Designing', 'Bespoke Pinterest Dress Designing', 2499, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'),
  ('Bridal & Party Wear Designing', 'Grand Wedding & Reception Couture', 4499, 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600&q=80'),
  ('Custom Embroidery', 'Hand Zardozi, Aari & Mirror Detailing', 799, 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&q=80'),
  ('Custom Measurements', 'Complimentary At-Home Tailor Visit & Fit Profile', 0, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80'),
  ('Designer Neck & Sleeve Designs', 'Sweetheart Neck, Puff Sleeves & Potli Detailing', 349, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80')
ON CONFLICT DO NOTHING;
