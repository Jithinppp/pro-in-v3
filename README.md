# 🎧 AV Management System (AVMS) - The AV Logistics Engine

AVMS is a professional-grade Enterprise Resource Planning (ERP) solution specifically engineered for the unique, high-pressure environment of Audio-Visual (AV) production companies. 

Unlike generic inventory systems, AVMS is built as a **Logistics Engine**. It solves the three biggest pain points in the AV industry: **The Double-Booking Problem**, **The Missing Cable Problem**, and **The Broken Gear Problem**.

---

## 🎯 Project Vision
In the AV world, a mistake in logistics—like double-booking a high-end mixer or forgetting a critical power cable—can ruin an entire event. AVMS eliminates these risks by separating the **Logical Request** (what is needed) from the **Physical Execution** (which specific unit is packed).

---

## 🏗️ Core System Architecture

### 1. The Unified Catalog (The "DNA")
The system uses a strict 3-tier hierarchy to define equipment. No physical units live here; this is the "Source of Truth" for specifications.
**`Categories`** $\to$ **`Subcategories`** $\to$ **`Models`**
*Example: Audio $\to$ Speakers $\to$ QSC K12.2*

### 2. Dual-Track Inventory (The "Gear")
AVMS distinguishes between items based on their value and tracking requirements:
*   **Serialized Assets (The "Money" Gear):** High-value items tracked individually. Each has a unique `asset_code` (e.g., `AUD-SPK-QSC-0001`), serial number, and individual maintenance history.
*   **Consumables (The "Bulk" Gear):** Low-value items tracked by quantity (e.g., Gaffer Tape, XLR Cables). These use `low_stock_threshold` alerts to trigger re-ordering.

### 3. The Reservation Engine (Conflict Prevention)
The heart of the app is a **Date-Range Overlap Logic**. 
*   **Timeline Tracking:** Instead of a simple "Available" toggle, the system tracks assets across a calendar.
*   **Overlap Logic:** An asset is blocked if `(New Start Date $\le$ Existing End Date) AND (Existing Start Date $\le$ New End Date)`.
*   **Intention vs. Execution:** PMs request a **Model** (e.g., "I need 4 QSC K12s"), and the system ensures the *capacity* exists. The Technician then assigns the specific **Assets** (barcodes) during the load-out.

### 4. Warehouse Topography
To eliminate "Where is it?" confusion, AVMS implements a hierarchical physical map:
**`Zone`** $\to$ **`Rack`** $\to$ **`Shelf`** $\to$ **`Bin`**
Assets are further linked to **Case Numbers**, mirroring how gear is physically packed into road cases.

---

## 👥 Role-Based Access Control (RBAC)

The system is divided into four ultra-focused dashboards, ensuring users only see the tools they need for their specific job.

### 👑 System Admin (`ADMIN`)
**Purpose:** System Oversight & Governance.
*   **User Management:** Onboarding staff and managing role assignments.
*   **Global Configuration:** Setting up system-wide constants and security policies.
*   **Audit Logs:** Monitoring the `activity_log` to see who changed what and when.

### 📦 Inventory Manager (`INV`)
**Purpose:** The "Gatekeeper" of Warehouse Integrity.
*   **Catalog Governance:** Managing the `Category $\to$ Subcategory $\to$ Model` hierarchy.
*   **Asset Onboarding:** Registering new serialized gear and generating internal asset codes.
*   **The QC Gate:** The only role capable of moving gear from `PENDING_QC` back to `AVAILABLE`.
*   **Location Mapping:** Designing the physical warehouse topography.
*   **Maintenance Oversight:** Reviewing maintenance logs and approving repairs.

### 📅 Project Manager (`PM`)
**Purpose:** The "Planner" and Resource Allocator.
*   **Project Blueprinting:** Creating projects with strict date ranges and venue specifics.
*   **Venue Logistics:** Tracking dock heights, elevator dimensions, and onsite contacts to ensure the truck actually fits.
*   **Equipment Requesting:** Building the "Equipment List" by requesting Models.
*   **Sub-Rental Tracking:** Marking items as `is_sub_rental` to ensure external gear is returned to the rental house.

### 🛠️ Technician (`TECH`)
**Purpose:** The "Executor" of Field Logistics.
*   **Digital Pick-Lists:** Using a mobile interface to scan specific Assets onto the truck, moving status from `RESERVED` $\to$ `OUT`.
*   **Return Scanning:** Scanning gear back into the warehouse, moving status from `OUT` $\to$ `PENDING_QC`.
*   **Damage Reporting:** Immediately marking an item as `DAMAGED` upon return, which triggers a status change to `MAINTENANCE` and blocks it from future bookings.
*   **Maintenance Execution:** Logging repairs, replacing parts, and uploading photo evidence of fixes.

---

## 🔄 The Asset Lifecycle (The Golden Path)

1.  **`AVAILABLE`**: Gear is QC-passed and sitting in its assigned `storage_location`.
2.  **`RESERVED`**: A PM has requested this model for a project. It is blocked on the calendar but still in the warehouse.
3.  **`OUT`**: A Tech has scanned the barcode. The gear is physically on the truck/at the venue.
4.  **`PENDING_QC`**: Gear is returned. It is physically back but cannot be re-booked until the `INV` manager inspects it.
5.  **`MAINTENANCE` / `QUARANTINED`**: Gear is broken or unsafe. It is completely removed from the reservation engine until repaired.

---

## 🛠️ Technical Stack
*   **Framework:** Next.js 15 (App Router, Server Actions)
*   **Backend:** Supabase (PostgreSQL, Auth, Storage)
*   **State:** Zustand (Global session and project state)
*   **Validation:** Zod + React Hook Form
*   **Dates:** `date-fns` (For complex range overlap calculations)
*   **UI:** Tailwind CSS v4 + Lucide-React
