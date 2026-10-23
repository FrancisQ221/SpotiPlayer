-- ==============================================================================
-- SpotiPlayer Database Schema & Row Level Security (RLS)
-- Multiplatform Cloud Sync for Favorites & Playlists (Web, Windows, Android)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Favorites Table ("Tus Me Gusta")
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT DEFAULT 'Single Master HD',
    duration INTEGER NOT NULL DEFAULT 180,
    duration_formatted TEXT DEFAULT '03:00',
    thumbnail_url TEXT,
    audio_url TEXT,
    audio_quality TEXT DEFAULT 'FLAC 24-bit / 96kHz',
    bitrate TEXT DEFAULT '1,411 kbps RAW',
    sample_rate TEXT DEFAULT '96.0 kHz / 24-bit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_song UNIQUE (user_id, song_id)
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_song_id ON public.favorites(song_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at DESC);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites RLS Policies
DROP POLICY IF EXISTS "Users can select their own favorites" ON public.favorites;
CREATE POLICY "Users can select their own favorites"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
CREATE POLICY "Users can insert their own favorites"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Playlists Table
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    cover_url TEXT DEFAULT 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    is_public BOOLEAN DEFAULT true,
    is_collaborative BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);

-- Enable RLS on playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Playlists RLS Policies
DROP POLICY IF EXISTS "Users can view public playlists or their own" ON public.playlists;
CREATE POLICY "Users can view public playlists or their own"
    ON public.playlists FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own playlists" ON public.playlists;
CREATE POLICY "Users can insert their own playlists"
    ON public.playlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own playlists" ON public.playlists;
CREATE POLICY "Users can update their own playlists"
    ON public.playlists FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own playlists" ON public.playlists;
CREATE POLICY "Users can delete their own playlists"
    ON public.playlists FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Playlist Items Table
CREATE TABLE IF NOT EXISTS public.playlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT DEFAULT 'Single Master HD',
    duration INTEGER NOT NULL DEFAULT 180,
    duration_formatted TEXT DEFAULT '03:00',
    thumbnail_url TEXT,
    audio_url TEXT,
    audio_quality TEXT DEFAULT 'FLAC 24-bit / 96kHz',
    position INTEGER DEFAULT 0 NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_playlist_song UNIQUE (playlist_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON public.playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_user_id ON public.playlist_items(user_id);

-- Enable RLS on playlist_items
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- Playlist Items RLS Policies
DROP POLICY IF EXISTS "Users can view playlist items for visible playlists" ON public.playlist_items;
CREATE POLICY "Users can view playlist items for visible playlists"
    ON public.playlist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.playlists p
            WHERE p.id = playlist_items.playlist_id
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert items into their own playlists" ON public.playlist_items;
CREATE POLICY "Users can insert items into their own playlists"
    ON public.playlist_items FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.playlists p
            WHERE p.id = playlist_items.playlist_id
            AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete items from their own playlists" ON public.playlist_items;
CREATE POLICY "Users can delete items from their own playlists"
    ON public.playlist_items FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.playlists p
            WHERE p.id = playlist_items.playlist_id
            AND p.user_id = auth.uid()
        )
    );
