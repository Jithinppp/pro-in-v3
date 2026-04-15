/                       // (Auth) Public sign-in page
/admin/*                // 👑 ADMIN DASHBOARD
    /admin/users        // Manage DB profiles & assign roles

/pm/*                   // 📅 PROJECT MANAGER DASHBOARD
    /pm/projects             // List all projects
    /pm/projects/create      // Add a new project (missing from original)
    /pm/projects/[id]        // Detail view (Timeline, equipment selection)
    /pm/projects/[id]/edit   // Edit overarching project details
    /pm/venues               // Browse and create Venues
    /pm/reports              // Generate pull-sheets/itineraries (PDF)

/inv/*                  // 📦 INVENTORY MANAGER DASHBOARD
    /inv/assets              // High-value serialized list
    /inv/assets/create       // Add new asset / bulk add
    /inv/assets/[id]         // Detail & edit metadata
    /inv/consumables         // Gaffer tape, batteries (Quantity-based)
    /inv/locations           // The visual Zone/Rack/Bin hierarchy
    /inv/catalog             // Catalog Portal & How-to
    /inv/catalog/categories  // Manage Taxonomy Groups
    /inv/catalog/subcategories // Manage Types
    /inv/catalog/models      // Manage Product SKU specs

/tech/*                 // 🛠️ TECHNICIAN / CREW DASHBOARD
    /tech/assignments        // "My Gigs" (Pick-lists for load-in/out)
    /tech/assignments/[id]   // The actual checklist interface
    /tech/scan               // Global QR/Barcode scanner page
    /tech/maintenance        // Dedicated queue of broken gear to fix
