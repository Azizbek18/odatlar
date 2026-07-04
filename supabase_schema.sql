-- ============================================================
-- Streak.uz Supabase Database Schema
-- Run this script in your Supabase SQL Editor to create tables.
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Note: Stored in plain text as requested by client flow. (Recommended: migrate to Supabase Auth!)
    full_name TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    gems INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. HABITS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL, -- Stored as JSON string (e.g., {"desc":"...","color":"...","time":"...","is_done":false})
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 3. FRIENDSHIPS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 4. GROUPS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 5. GROUP_MEMBERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_group_membership UNIQUE (group_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Since your frontend currently uses custom registration and login 
-- directly querying the 'profiles' table via the public anon key:
-- These policies allow the client (anon role) to read, insert, and update.

-- -----------------------------------------
-- Policies for: PROFILES
-- -----------------------------------------

-- 1. Anyone can view profiles (needed for login, leaderboard, and profile views)
CREATE POLICY "Allow public read profiles" 
ON public.profiles FOR SELECT 
TO anon 
USING (true);

-- 2. Anyone can create a profile (needed for registration)
CREATE POLICY "Allow public insert profiles" 
ON public.profiles FOR INSERT 
TO anon 
WITH CHECK (true);

-- 3. Users can update their own profile matching their ID
CREATE POLICY "Allow public update profiles" 
ON public.profiles FOR UPDATE 
TO anon 
USING (true) 
WITH CHECK (true);

-- 4. Users can delete their own profile matching their ID (Account deletion)
CREATE POLICY "Allow public delete profiles" 
ON public.profiles FOR DELETE 
TO anon 
USING (true);


-- -----------------------------------------
-- Policies for: HABITS
-- -----------------------------------------

-- 1. Anyone can view habits (needed for leaderboards/dashboard)
CREATE POLICY "Allow public read habits" 
ON public.habits FOR SELECT 
TO anon 
USING (true);

-- 2. Anyone can create habits
CREATE POLICY "Allow public insert habits" 
ON public.habits FOR INSERT 
TO anon 
WITH CHECK (true);

-- 3. Anyone can update habits
CREATE POLICY "Allow public update habits" 
ON public.habits FOR UPDATE 
TO anon 
USING (true) 
WITH CHECK (true);

-- 4. Anyone can delete habits
CREATE POLICY "Allow public delete habits" 
ON public.habits FOR DELETE 
TO anon 
USING (true);


-- -----------------------------------------
-- Policies for: FRIENDSHIPS
-- -----------------------------------------

-- 1. Anyone can view friendships
CREATE POLICY "Allow public read friendships" 
ON public.friendships FOR SELECT 
TO anon 
USING (true);

-- 2. Anyone can create friendships
CREATE POLICY "Allow public insert friendships" 
ON public.friendships FOR INSERT 
TO anon 
WITH CHECK (true);

-- 3. Anyone can update friendships
CREATE POLICY "Allow public update friendships" 
ON public.friendships FOR UPDATE 
TO anon 
USING (true) 
WITH CHECK (true);

-- 4. Anyone can delete friendships
CREATE POLICY "Allow public delete friendships" 
ON public.friendships FOR DELETE 
TO anon 
USING (true);


-- -----------------------------------------
-- Policies for: GROUPS
-- -----------------------------------------

CREATE POLICY "Allow public read groups" ON public.groups FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert groups" ON public.groups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update groups" ON public.groups FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete groups" ON public.groups FOR DELETE TO anon USING (true);


-- -----------------------------------------
-- Policies for: GROUP_MEMBERS
-- -----------------------------------------

CREATE POLICY "Allow public read group_members" ON public.group_members FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert group_members" ON public.group_members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update group_members" ON public.group_members FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete group_members" ON public.group_members FOR DELETE TO anon USING (true);


-- ============================================================
-- RECOMMENDED: SECURE SUPABASE AUTH POLICIES (If you migrate)
-- ============================================================
-- If you migrate to Supabase Auth (auth.users), you can restrict 
-- database access securely so that users can only edit their own data.
--
-- To use these, you would:
-- 1. Link profiles.id to auth.users.id:
--    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
-- 2. Use the policies below:
/*
-- PROFILES:
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow user update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow user delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- HABITS:
CREATE POLICY "Allow user read own habits" ON public.habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow user insert own habits" ON public.habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user update own habits" ON public.habits FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow user delete own habits" ON public.habits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- FRIENDSHIPS:
CREATE POLICY "Allow user read own friendships" ON public.friendships FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Allow user insert own friendships" ON public.friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user update own friendships" ON public.friendships FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow user delete own friendships" ON public.friendships FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- GROUPS:
CREATE POLICY "Allow authenticated read groups" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update groups" ON public.groups FOR UPDATE TO authenticated USING (true);

-- GROUP_MEMBERS:
CREATE POLICY "Allow authenticated read members" ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user insert own membership" ON public.group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user update own membership" ON public.group_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow user delete own membership" ON public.group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
*/
