# 🚀 AV Management System - Detailed Implementation Roadmap

This roadmap tracks the progress of the AVMS Logistics Engine.
**Legend:** `[x]` = Completed | `[ ]` = Pending

---

## Phase 1: Foundation (Auth & RBAC)

- [x] **Supabase Environment Setup**
  - [x] Create tables based on `schema.sql`.
  - [x] Setup Supabase Auth.
  - [x] Create `handle_new_user()` Postgres function.
  - [x] Create Trigger on `auth.users` to auto-insert into `public.profiles` with role `TECH`.
- [x] **Authentication Layer**
  - [x] Implement `authStore` (Zustand) for session and role persistence.
  - [x] Build Login and Signup pages.
- [x] **Role-Based Access Control (RBAC)**
  - [x] Implement Next.js Middleware for edge-level route protection.
  - [x] Create `RoleLayout` wrapper for different dashboards.
  - [x] Configure role-specific route guards (`ADMIN`, `INV`, `PM`, `TECH`).

---

## Phase 2: The Catalog & Warehouse

- [x] **Catalog CRUD (The DNA)**
  - [ ] Category management (Create, Read, Update, Delete).
  - [x] Subcategory management (Linked to Category).
  - [x] Model management (Linked to Subcategory).
  - [x] Implementation of Edit Mode for all catalog levels.
  - [x] Form validation using `Zod` and `react-hook-form`.
- [ ] **Warehouse Hierarchy (The Map)**
  - [x] Storage Location CRUD (Create, Read, Update, Delete).
  - [x] Implement Recursive Parent/Child relationship (Zone $\to$ Rack $\to$ Shelf $\to$ Bin).
  - [x] UI for visualizing the hierarchy (Tree view or Nested Lists).
  - [x] Location assignment interface (Move an item from one bin to another).
  - [ ] always show the inline edit buttons not on hover
- [ ] **Venue Management**
  - [ ] Venue CRUD (Name, Address, Dock Details, Power Access, etc.).
  - [ ] Venue list view for PMs to select during project creation.

---

## Phase 3: Asset & Consumable Inventory

- [ ] **Serialized Assets (The Money Gear)**
  - [x] Implement Asset Registration form.
  - [x] Build the **Asset Code Generator** logic (`CAT-SUB-MFR-SEQ`).
  - [x] Asset List View with advanced filtering (by status, model, location).
  - [ ] **Asset Update/Edit:** Implement form to update `status`, `condition`, and `location_id`.
  - [x] **Asset Deletion:** Implement soft-delete (`is_active = false`) for asset records.
  - [ ] **Single Asset Detail View:**
    - [x] Create a dedicated page for a single asset.
    - [ ] add Links input for assets (attaching links etc)
    - [ ] attach image
    - [ ] Display full technical specs from the linked `Model`.
    - [ ] Display integrated `Maintenance Logs` for that specific asset.
    - [ ] Display `Activity Log` timeline (who moved it, when it was updated).
- [ ] **Consumables Management (The Bulk Gear)**
  - [ ] Consumable stock tracking interface.
  - [ ] "Quick Adjust" buttons (+ / -) for quantity updates.
  - [ ] Low-stock alert system (Red badges when `quantity <= low_stock_threshold`).
- [ ] **Kitting System**
  - [ ] Kit creation interface (Name, Description).
  - [ ] Polymorphic `kit_items` addition:
    - [ ] Logic to add Serialized Assets to a kit.
    - [ ] Logic to add Consumables (with quantity) to a kit.
  - [ ] Kit "Pack" view (Checklist of everything that should be in the road case).

---

## Phase 4: Project Planning & Reservation (The Engine)

- [ ] **Project Management**
  - [ ] Project CRUD (Client, Venue selection, Start/End dates).
  - [ ] Detailed timing fields (Load-in, Show start, Show end, Load-out).
- [ ] **The Reservation Engine (The Core Logic)**
  - [ ] Equipment Request interface: PM selects a **Model** and a **Quantity**.
  - [ ] **Server-Side Conflict Check:**
    - [ ] Implement SQL function to check for date-range overlaps for requested models.
    - [ ] Logic: `(Project A Start $\le$ Project B End) AND (Project B Start $\le$ Project A End)`.
  - [ ] **Capacity Validation:** Check if `(Total Owned - Reserved) >= Requested Quantity`.
  - [ ] Conflict Alert UI: Warning PMs when gear is unavailable for chosen dates.
- [ ] **Asset Assignment**
  - [ ] Logic to bridge "Requested Model" $\to$ "Specific Asset ID" (The bridge between PM and TECH).
- [ ] **Booking Calendar**
  - [ ] Integrate `date-fns` for timeline calculations.
  - [ ] Visual Calendar/Gantt view of asset availability across projects.

---

## Phase 5: Field Execution (Technician Tools)

- [ ] **Loading Checklist (Pick-List)**
  - [ ] Mobile-optimized view of all gear `RESERVED` for a specific project.
  - [ ] QR/Barcode Scan-to-Verify: Change status from `RESERVED` $\to$ `OUT`.
- [ ] **Return & QC Flow**
  - [ ] Return scan interface: Scan gear back into warehouse.
  - [ ] **Condition Assessment Form:** Tech marks gear as `AVAILABLE`, `PENDING_QC`, or `MAINTENANCE`.
  - [ ] Status transition: `OUT` $\to$ `PENDING_QC` or `AVAILABLE`.
- [ ] **Damage Reporting**
  - [ ] Mobile upload for damage photos (Supabase Storage).
  - [ ] Instant creation of `maintenance_log` entry upon reporting damage.

---

## Phase 6: Maintenance & Auditing

- [ ] **Maintenance Dashboard**
  - [ ] Filtered queue of all assets in `MAINTENANCE` or `PENDING_QC` status.
  - [ ] **The QC Approval Workflow:** `INV` manager reviews repair $\to$ Clicks "Pass" $\to$ status becomes `AVAILABLE`.
- [ ] **Audit Tool (Cycle Counting)**
  - [ ] "Scan & Verify" mode: Tech scans an item, system verifies if the `location_id` matches the database.
  - [ ] Discrepancy report generation (List of items found in the wrong bin).
- [ ] **Global Activity Log**
  - [ ] Searchable, filterable timeline of every system change (User, Action, Old Value, New Value).
