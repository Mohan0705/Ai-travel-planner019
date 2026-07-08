// Production-grade Supabase Database Schema Definitions
// Voyage AI Database Bootstrap System

export const SCHEMA_TABLES = [
  {
    name: "profiles",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        country TEXT DEFAULT 'International',
        bio TEXT DEFAULT 'Sophisticated travel connoisseur.',
        preferences JSONB DEFAULT '{"food": "Local Cuisines", "hotel": "Boutique Art Hotels", "transport": "Walk / Transit"}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `,
    rlsSql: `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can read own profile",
        sql: `CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);`
      },
      {
        name: "Users can update own profile",
        sql: `CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);`
      },
      {
        name: "Users can insert own profile",
        sql: `CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);`
      }
    ],
    indexes: []
  },
  {
    name: "trips",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.trips (
        id TEXT PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        destination TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'International',
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        duration INTEGER NOT NULL DEFAULT 1,
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
    `,
    rlsSql: `ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can view own trips",
        sql: `CREATE POLICY "Users can view own trips" ON public.trips FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: "Users can insert own trips",
        sql: `CREATE POLICY "Users can insert own trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: "Users can update own trips",
        sql: `CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = user_id);`
      },
      {
        name: "Users can delete own trips",
        sql: `CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = user_id);`
      }
    ],
    indexes: [
      `CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips (user_id);`
    ]
  },
  {
    name: "itineraries",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.itineraries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trip_id TEXT REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        generated_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `,
    rlsSql: `ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can view itineraries for own trips",
        sql: `CREATE POLICY "Users can view itineraries for own trips" ON public.itineraries FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()
          )
        );`
      },
      {
        name: "Users can insert itineraries for own trips",
        sql: `CREATE POLICY "Users can insert itineraries for own trips" ON public.itineraries FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()
          )
        );`
      },
      {
        name: "Users can update itineraries for own trips",
        sql: `CREATE POLICY "Users can update itineraries for own trips" ON public.itineraries FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()
          )
        );`
      },
      {
        name: "Users can delete itineraries for own trips",
        sql: `CREATE POLICY "Users can delete itineraries for own trips" ON public.itineraries FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()
          )
        );`
      }
    ],
    indexes: [
      `CREATE INDEX IF NOT EXISTS itineraries_trip_id_idx ON public.itineraries (trip_id);`
    ]
  },
  {
    name: "expenses",
    createSql: `
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
    `,
    rlsSql: `ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can view expenses for own trips",
        sql: `CREATE POLICY "Users can view expenses for own trips" ON public.expenses FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
          )
        );`
      },
      {
        name: "Users can insert expenses for own trips",
        sql: `CREATE POLICY "Users can insert expenses for own trips" ON public.expenses FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
          )
        );`
      },
      {
        name: "Users can update expenses for own trips",
        sql: `CREATE POLICY "Users can update expenses for own trips" ON public.expenses FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
          )
        );`
      },
      {
        name: "Users can delete expenses for own trips",
        sql: `CREATE POLICY "Users can delete expenses for own trips" ON public.expenses FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
          )
        );`
      }
    ],
    indexes: [
      `CREATE INDEX IF NOT EXISTS expenses_trip_id_idx ON public.expenses (trip_id);`
    ]
  },
  {
    name: "chat_history",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        role TEXT NOT NULL,
        message TEXT NOT NULL,
        trip_id TEXT REFERENCES public.trips(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `,
    rlsSql: `ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can view own chat history",
        sql: `CREATE POLICY "Users can view own chat history" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: "Users can insert own chat history",
        sql: `CREATE POLICY "Users can insert own chat history" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: "Users can delete own chat history",
        sql: `CREATE POLICY "Users can delete own chat history" ON public.chat_history FOR DELETE USING (auth.uid() = user_id);`
      }
    ],
    indexes: [
      `CREATE INDEX IF NOT EXISTS chat_history_user_id_idx ON public.chat_history (user_id);`
    ]
  },
  {
    name: "favorites",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        destination TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `,
    rlsSql: `ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can view own favorites",
        sql: `CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: "Users can insert own favorites",
        sql: `CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: "Users can update own favorites",
        sql: `CREATE POLICY "Users can update own favorites" ON public.favorites FOR UPDATE USING (auth.uid() = user_id);`
      },
      {
        name: "Users can delete own favorites",
        sql: `CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);`
      }
    ],
    indexes: [
      `CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites (user_id);`
    ]
  },
  {
    name: "api_cache",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.api_cache (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        expiry TIMESTAMP WITH TIME ZONE NOT NULL,
        api_source TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `,
    rlsSql: `ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Enable read for all",
        sql: `CREATE POLICY "Enable read for all" ON public.api_cache FOR SELECT USING (true);`
      },
      {
        name: "Enable write for all authenticated",
        sql: `CREATE POLICY "Enable write for all authenticated" ON public.api_cache FOR ALL USING (auth.uid() IS NOT NULL);`
      }
    ],
    indexes: []
  },
  
  // USER'S REQUESTED ADDITIONAL TABLES
  {
    name: "saved_trips",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.saved_trips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title TEXT,
        destination TEXT,
        trip_data JSONB,
        hero_image TEXT,
        budget NUMERIC,
        currency TEXT DEFAULT 'USD',
        days INTEGER,
        travel_dates TEXT,
        weather JSONB,
        status TEXT,
        favorite BOOLEAN DEFAULT false,
        archived BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `,
    rlsSql: `ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can select own saved_trips",
        sql: `CREATE POLICY "Users can select own saved_trips" ON public.saved_trips FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: "Users can insert own saved_trips",
        sql: `CREATE POLICY "Users can insert own saved_trips" ON public.saved_trips FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: "Users can update own saved_trips",
        sql: `CREATE POLICY "Users can update own saved_trips" ON public.saved_trips FOR UPDATE USING (auth.uid() = user_id);`
      },
      {
        name: "Users can delete own saved_trips",
        sql: `CREATE POLICY "Users can delete own saved_trips" ON public.saved_trips FOR DELETE USING (auth.uid() = user_id);`
      }
    ],
    indexes: [
      `CREATE INDEX IF NOT EXISTS saved_trips_user_id_idx ON public.saved_trips (user_id);`
    ]
  },
  {
    name: "trip_history",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.trip_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        trip_id UUID,
        history JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `,
    rlsSql: `ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can select own trip_history",
        sql: `CREATE POLICY "Users can select own trip_history" ON public.trip_history FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: "Users can insert own trip_history",
        sql: `CREATE POLICY "Users can insert own trip_history" ON public.trip_history FOR INSERT WITH CHECK (auth.uid() = user_id);`
      }
    ],
    indexes: [
      `CREATE INDEX IF NOT EXISTS trip_history_user_id_idx ON public.trip_history (user_id);`
    ]
  },
  {
    name: "notifications",
    createSql: `
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title TEXT,
        message TEXT,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `,
    rlsSql: `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`,
    policies: [
      {
        name: "Users can select own notifications",
        sql: `CREATE POLICY "Users can select own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: "Users can insert own notifications",
        sql: `CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: "Users can update own notifications",
        sql: `CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);`
      },
      {
        name: "Users can delete own notifications",
        sql: `CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);`
      }
    ],
    indexes: [
      `CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);`
    ]
  }
];
