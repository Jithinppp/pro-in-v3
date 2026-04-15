import { Package, MapPin, Boxes, PackageOpen, Clock, ShieldCheck, Archive, LayoutGrid } from 'lucide-react'
import { QuickActionCard } from '@/components/ui/QuickActionCard'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'

export default function InvDashboard() {
  return (
    <PageContainer>
      <PageHeader 
        label="Dashboard"
        title="Hi Inventory Manager 👋"
        subtitle="Track and manage your inventory across all venues and warehouses."
      />

      <div className="space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="relative overflow-hidden p-8 rounded-3xl bg-white border border-border-light group hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-blue-50 transition-colors group-hover:bg-blue-100">
                <Package className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-text-secondary">Total Assets</p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums text-text-primary">2,840</p>
            </div>
          </div>

          <div className="relative overflow-hidden p-8 rounded-3xl bg-white border border-border-light group hover:border-emerald-200 transition-all">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-emerald-50 transition-colors group-hover:bg-emerald-100">
                <Boxes className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-text-secondary">Available</p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums text-text-primary">2,412</p>
            </div>
          </div>

          <div className="relative overflow-hidden p-8 rounded-3xl bg-white border border-border-light group hover:border-amber-200 transition-all">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-amber-50 transition-colors group-hover:bg-amber-100">
                <ShieldCheck className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-text-secondary">Maintenance</p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums text-text-primary">12</p>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-border-focus"></div>
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-widest">Quick Actions</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: "Asset Management", desc: "Track & manage assets", icon: Package, href: "/inv/assets" },
              { title: "Catalog Builder", desc: "Manage gear hierarchy", icon: LayoutGrid, href: "/inv/catalog" },
              { title: "Storage Layout", desc: "Warehouse topography", icon: MapPin, href: "/inv/locations" },
              { title: "Kits & Bundles", desc: "Manage bundles", icon: Boxes, href: "/inv/kits" },
              { title: "Consumables", desc: "Track stock levels", icon: PackageOpen, href: "/inv/consumables" },
              { title: "Audit Log", desc: "Inventory reports", icon: ShieldCheck, href: "/inv/reports" },
              { title: "Equipment Archive", desc: "Retired items", icon: Archive, href: "/inv/assets/archive" },
              { title: "Kits Archive", desc: "Retired kits", icon: Archive, href: "/inv/kits/archive" },
            ].map((link, i) => (
              <QuickActionCard key={i} {...link} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
