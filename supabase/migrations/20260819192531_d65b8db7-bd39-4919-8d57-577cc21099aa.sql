-- roles
CREATE TYPE public.app_role AS ENUM ('admin','customer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.raw_user_meta_data->>'phone',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- catalogue
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.boutique_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_type TEXT NOT NULL,
  name TEXT NOT NULL,
  stitching_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.boutique_designs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.boutique_designs TO authenticated;
GRANT ALL ON public.boutique_designs TO service_role;
ALTER TABLE public.boutique_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "designs public read" ON public.boutique_designs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "designs admin write" ON public.boutique_designs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offers public read" ON public.offers FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "offers admin write" ON public.offers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- transactions
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'shop',
  status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments own read" ON public.appointments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "appointments own insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appointments admin update" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "appointments admin delete" ON public.appointments FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'shop',
  status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders own read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders own insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders admin delete" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.tailor_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  outfit_type TEXT NOT NULL,
  address TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_slot TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tailor_visits TO authenticated;
GRANT ALL ON public.tailor_visits TO service_role;
ALTER TABLE public.tailor_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visits own read" ON public.tailor_visits FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "visits own insert" ON public.tailor_visits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "visits admin update" ON public.tailor_visits FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "visits admin delete" ON public.tailor_visits FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- seed data
INSERT INTO public.services (category, name, price, duration_minutes) VALUES
('Hair','Hair Cut & Styling',350,45),
('Hair','Hair Spa Treatment',900,60),
('Hair','Global Hair Colour',2200,120),
('Hair','Keratin Smoothening',3500,150),
('Skin','Skin Polishing',1200,60),
('Skin','De-Tan Treatment',800,45),
('Skin','Anti-Acne Clean Up',700,40),
('Makeup','Party Makeup',2500,75),
('Makeup','Bridal Makeup Package',12000,180),
('Makeup','Engagement Makeup',6000,120),
('Threading','Eyebrow Threading',50,10),
('Threading','Upper Lip & Chin',60,10),
('Threading','Full Face Threading',250,25),
('Facials','Gold Facial',1100,60),
('Facials','Fruit Facial',600,45),
('Facials','Hydra Glow Facial',1800,75);

INSERT INTO public.products (category, name, brand, price, image_url) VALUES
('Makeup','Matte Liquid Lipstick','Rose Luxe',399,'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80'),
('Makeup','HD Compact Powder','Glow Studio',549,'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80'),
('Makeup','Kajal & Eyeliner Duo','Nayan',249,'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80'),
('Skincare','Vitamin C Face Serum','DermaPure',699,'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'),
('Skincare','Aloe Hydrating Gel','HerbEssence',299,'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80'),
('Skincare','SPF 50 Sunscreen','SunShield',549,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80'),
('Haircare','Argan Hair Oil','Rootz',449,'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80'),
('Haircare','Anti-Dandruff Shampoo','Rootz',379,'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=600&q=80'),
('Fragrance','Rose Mist Body Perfume','Amara',599,'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80'),
('Fragrance','Jasmine Attar Roll-On','Amara',349,'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80'),
('Tools','Professional Makeup Brush Set','Blendify',899,'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&q=80'),
('Tools','Ceramic Hair Straightener','StylePro',1599,'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&q=80');

INSERT INTO public.boutique_designs (outfit_type, name, stitching_price, image_url) VALUES
('Blouses','Designer Back-Neck Blouse',650,'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'),
('Blouses','Princess-Cut Padded Blouse',550,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80'),
('Suits','Anarkali Suit Set',1400,'https://images.unsplash.com/photo-1610030469668-8e9f34d2e5b6?w=600&q=80'),
('Suits','Straight Kurti with Palazzo',900,'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'),
('Dresses','Indo-Western Gown',2200,'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80'),
('Dresses','A-Line Party Dress',1600,'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80');

INSERT INTO public.offers (title, description) VALUES
('Bridal Season Offer','Book a bridal makeup package and get a complimentary gold facial worth Rs. 1100.'),
('Free Home Tailor Visit','Free measurement and cloth pickup anywhere in Lucknow on stitching orders above Rs. 1500.');