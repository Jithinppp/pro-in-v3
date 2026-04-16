import { Package, MapPin, Boxes, PackageOpen, Clock, ShieldCheck, Archive, LayoutGrid, CheckCircle2 } from 'lucide-react'
import { QuickActionCard } from '@/components/ui/QuickActionCard'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'
import { createClient } from '@/lib/supabase/server'

export default async function InvDashboard() {
  const supabase = await createClient()

  const [{ count: totalAssets }, { count: availableAssets }, { count: maintenanceAssets }] = await Promise.all([
    supabase.from('assets').select('*', { count: 'exact', head: true }),
    supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'AVAILABLE'),
    supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'MAINTENANCE'),
  ])

  const outAssets = (totalAssets || 0) - (availableAssets || 0) - (maintenanceAssets || 0)

  return (
    <PageContainer>
      <PageHeader 
        label="Organization Dashboard"
        title="Hi Inventory Manager 👋"
        subtitle="Operational overview of your global assets, logistics, and maintenance status."
      />

      <div className="space-y-20">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="relative overflow-hidden p-8 rounded-lg bg-white border border-border group transition-all">
            <div className="flex items-start justify-between mb-10">
              <div className="p-3 rounded-md bg-secondary text-charcoal transition-all">
                <Package className="size-6" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-mid-gray group-hover:text-charcoal transition-colors" />
                <span className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.2em]">Verified</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-mid-gray italic">Total Assets Tracked</p>
              <p className="text-5xl font-display font-semibold tracking-tight tabular-nums text-charcoal">{totalAssets?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="relative overflow-hidden p-8 rounded-lg bg-white border border-border group transition-all">
            <div className="flex items-start justify-between mb-10">
              <div className="p-3 rounded-md bg-secondary text-charcoal transition-all">
                <Boxes className="size-6" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-mid-gray italic">Available for Deployment</p>
              <p className="text-5xl font-display font-semibold tracking-tight tabular-nums text-charcoal">{availableAssets?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="relative overflow-hidden p-8 rounded-lg bg-white border border-border group transition-all">
            <div className="flex items-start justify-between mb-10">
              <div className="p-3 rounded-md bg-secondary text-charcoal transition-all">
                <ShieldCheck className="size-6" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-mid-gray italic">Under Maintenance</p>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-display font-semibold tracking-tight tabular-nums text-charcoal">{maintenanceAssets?.toLocaleString() || 0}</p>
                <span className="text-xs text-destructive font-semibold tracking-tight">Live status</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Hub */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">Core Operations</h2>
            <div className="h-px w-full bg-border"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Asset Management", desc: "Detailed tracking & technical specifications of all units.", icon: Package, href: "/inv/assets" },
              { title: "Catalog Builder", desc: "Maintain the global taxonomy of Categories and Models.", icon: LayoutGrid, href: "/inv/catalog" },
              { title: "Storage Layout", desc: "Define warehouse topography, rooms, and bin identifiers.", icon: MapPin, href: "/inv/locations" },
              { title: "Kits & Bundles", desc: "Manage logical asset groupings and equipment packages.", icon: Boxes, href: "/inv/kits" },
              { title: "Consumables", desc: "Stock levels for non-serialized items and supplies.", icon: PackageOpen, href: "/inv/consumables" },
              { title: "Audit Log", desc: "Historical records of movements and maintenance events.", icon: ShieldCheck, href: "/inv/reports" },
              { title: "Equipment Archive", desc: "Retired hardware history and decommissioning records.", icon: Archive, href: "/inv/assets/archive" },
              { title: "Kits Archive", desc: "Records of retired equipment kits and past projects.", icon: Archive, href: "/inv/kits/archive" },
            ].map((link, i) => (
              <QuickActionCard key={i} {...link} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

