-- Supabase Production PostgreSQL Database Schema
-- AI Travel Planner

-- Enable UUID generation extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  country TEXT,
  bio TEXT DEFAULT 'Sophisticated travel connoisseur.',
  preferences JSONB DEFAULT '{"food": "Local Cuisines", "hotel": "Boutique Art Hotels", "transport": "Walk / Transit"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'International',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  budget NUMERIC NOT NULL DEFAULT 1000,
  currency TEXT NOT NULL DEFAULT 'USD',
  travel_style TEXT,
  interests TEXT[] DEFAULT '{}'::text[],
  food_preference TEXT,
  hotel_preference TEXT,
  transport TEXT,
  status TEXT DEFAULT 'planned',
  is_saved BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Trips Policies
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- 3. ITINERARIES TABLE
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  generated_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Itineraries
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Itineraries Policies
CREATE POLICY "Users can view itineraries for own trips" ON public.itineraries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert itineraries for own trips" ON public.itineraries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update itineraries for own trips" ON public.itineraries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete itineraries for own trips" ON public.itineraries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()
    )
  );

-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  date TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Expenses Policies
CREATE POLICY "Users can view expenses for own trips" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses for own trips" ON public.expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses for own trips" ON public.expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses for own trips" ON public.expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
    )
  );

-- 5. CHAT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  trip_id TEXT REFERENCES public.trips(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Chat History
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Chat History Policies
CREATE POLICY "Users can view own chat history" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history" ON public.chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites Policies
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites" ON public.favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 7. API CACHE TABLE FOR DURABLE PERSISTENCE
CREATE TABLE IF NOT EXISTS public.api_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  api_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for API Cache
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Policy to allow read/write for all (service role bypasses anyway, but safe default)
CREATE POLICY "Enable read for all" ON public.api_cache
  FOR SELECT USING (true);

CREATE POLICY "Enable write for all authenticated" ON public.api_cache
  FOR ALL USING (auth.uid() IS NOT NULL);


-- PROFILE AUTO-CREATION ON SIGN UP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'photoUrl')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
