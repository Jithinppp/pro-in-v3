-- AV Management System Master Schema
-- Database: PostgreSQL (Supabase)

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE asset_status AS ENUM ('AVAILABLE', 'RESERVED', 'OUT', 'PENDING_QC', 'MAINTENANCE', 'QUARANTINED');
CREATE TYPE item_condition AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE project_status AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED');
CREATE TYPE user_role AS ENUM ('ADMIN', 'INV', 'PM', 'TECH');
CREATE TYPE item_type AS ENUM ('ASSET', 'CONSUMABLE');
CREATE TYPE reservation_status AS ENUM ('RESERVED', 'OUT', 'RETURNED');

-- 0. USER PROFILES (Must be created first for Foreign Keys)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email text NOT NULL UNIQUE,
    role user_role DEFAULT 'TECH',
    first_name text,
    last_name text,
    is_active boolean DEFAULT true,
    updated_at timestamptz DEFAULT now()
);

-- 1. CATALOG LEVEL
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.subcategories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.models (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE CASCADE,
    code text NOT NULL UNIQUE,
    brand text NOT NULL,
    name text NOT NULL,
    specs jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 2. PHYSICAL INVENTORY
CREATE TABLE public.storage_locations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid REFERENCES public.storage_locations(id),
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id uuid REFERENCES public.models(id),
    asset_code text NOT NULL UNIQUE,
    serial_number text,
    status asset_status DEFAULT 'AVAILABLE',
    condition item_condition DEFAULT 'EXCELLENT',
    location_id uuid REFERENCES public.storage_locations(id),
    case_number text,
    purchase_date date,
    purchase_cost numeric,
    warranty_expiry date,
    last_maintenance date,
    next_maintenance date,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.consumables (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id uuid REFERENCES public.models(id),
    location_id uuid REFERENCES public.storage_locations(id),
    quantity integer NOT NULL DEFAULT 0,
    low_stock_threshold integer DEFAULT 5,
    unit_type text, 
    updated_at timestamptz DEFAULT now()
);

-- 3. PROJECTS & BOOKINGS
CREATE TABLE public.venues (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    address text,
    room_dimensions text,
    ceiling_height text,
    dock_details text,
    freight_elevator text,
    power_access text,
    contact_name text,
    contact_phone text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    type text,
    client_name text,
    venue_id uuid REFERENCES public.venues(id),
    start_date date,
    end_date date,
    load_in_time timestamptz,
    show_start_time timestamptz,
    show_end_time timestamptz,
    load_out_time timestamptz,
    onsite_contact_name text,
    onsite_contact_phone text,
    dress_code text,
    tech_notes text,
    status project_status DEFAULT 'PLANNING',
    description text,
    project_manager_id uuid REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.project_equipment (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    asset_id uuid REFERENCES public.assets(id),
    model_id uuid REFERENCES public.models(id),
    quantity integer DEFAULT 1,
    status reservation_status DEFAULT 'RESERVED',
    is_sub_rental boolean DEFAULT false,
    rental_company text,
    requested_date date,
    returned_date date,
    CONSTRAINT asset_or_model CHECK (
        (asset_id IS NOT NULL AND model_id IS NULL) OR 
        (asset_id IS NULL AND model_id IS NOT NULL)
    )
);

-- 4. KITS
CREATE TABLE public.kits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.kit_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_id uuid REFERENCES public.kits(id) ON DELETE CASCADE,
    item_type item_type NOT NULL,
    asset_id uuid REFERENCES public.assets(id),
    model_id uuid REFERENCES public.models(id),
    quantity integer DEFAULT 1,
    CONSTRAINT kit_asset_or_model CHECK (
        (item_type = 'ASSET' AND asset_id IS NOT NULL AND model_id IS NULL) OR 
        (item_type = 'CONSUMABLE' AND asset_id IS NULL AND model_id IS NOT NULL)
    )
);

-- 5. MAINTENANCE & ADMIN
CREATE TABLE public.maintenance_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id uuid REFERENCES public.assets(id),
    service_date date NOT NULL,
    technician text,
    description text NOT NULL,
    cost numeric,
    parts_replaced text,
    photo_url text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.activity_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action text NOT NULL,
    old_value text,
    new_value text,
    created_at timestamptz DEFAULT now()
);
