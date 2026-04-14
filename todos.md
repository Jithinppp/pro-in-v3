# Project Roadmap: AV Management System (Next.js Edition)

## Phase 1: Foundation (Auth & RBAC)
- [ ] **Supabase Environment Setup**
    - [ ] Create tables based on `schema.sql`.
    - [ ] Setup Supabase Auth.
    - [ ] Create `handle_new_user()` Postgres function.
    - [ ] Create Trigger on `auth.users` to auto-insert into `public.profiles` with role `TECH`.
- [ ] **Authentication Layer**
    - [ ] Implement `authStore` (Zustand) for session and role persistence.
    - [ ] Build Login page in `app/(auth)/login/page.tsx`.
- [ ] **Role-Based Access Control (RBAC)**
    - [ ] Implement Next.js Middleware for edge-level route protection.
    - [ ] Create `RoleLayout` wrapper for different dashboards.
    - [ ] Configure role-specific route guards.

## Phase 2: The Catalog, Warehouse, & Venues
- [ ] **Catalog CRUD**
    - [ ] Category, Subcategory, and Model management screens.
    - [ ] Form validation using `Zod` and `react-hook-form`.
- [ ] **Warehouse Hierarchy**
    - [ ] Storage Location CRUD.
    - [ ] Implement recursive parent/child relationship (Zone $\to$ Bin).
    - [ ] Location assignment interface.
- [ ] **Venue Management**
    - [ ] Venue CRUD for capturing room dimensions, docks, and logistics.

## Phase 3: Asset & Consumable Inventory
- [ ] **Serialized Assets**
    - [ ] Implement Asset Registration form.
    - [ ] Build the **Asset Code Generator** logic (`CAT-SUB-MFR-SEQ`).
    - [ ] Asset List View with advanced filtering.
- [ ] **Consumables Management**
    - [ ] Consumable stock tracking interface.
    - [ ] Low-stock alert system.

## Phase 4: Project Planning & Reservation
- [ ] **Project Management**
    - [ ] Project CRUD (Client, venues, show timings, tech notes).
- [ ] **Reservation Engine**
    - [ ] Equipment Request interface.
    - [ ] Implement **Date Range Overlap Logic** in Supabase to prevent double-booking.
- [ ] **Booking Calendar**
    - [ ] Integrate `date-fns` for timeline management.
    - [ ] Visual calendar view of asset availability.

## Phase 5: Field Execution (Technician Tools)
- [ ] **Loading Checklist**
    - [ ] Mobile-optimized "Pick List" for technicians.
    - [ ] QR code scan-to-verify flow (Status: `RESERVED` $\to$ `OUT`).
- [ ] **Return & QC Flow**
    - [ ] Return scan interface.
    - [ ] Condition assessment form.
    - [ ] Status transition: `OUT` $\to$ `PENDING_QC` or `AVAILABLE`.
- [ ] **Damage Reporting**
    - [ ] Mobile upload for damage photos.
    - [ ] Instant maintenance ticket creation.

## Phase 6: Maintenance & Auditing
- [ ] **Maintenance Dashboard**
    - [ ] Queue of items in `MAINTENANCE` or `PENDING_QC`.
    - [ ] QC approval workflow for Inventory Manager.
- [ ] **Audit Tool**
    - [ ] Cycle counting interface.
    - [ ] Discrepancy report generation.
- [ ] **Activity Log**
    - [ ] Implement a searchable timeline of all system changes.
