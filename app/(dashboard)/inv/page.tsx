import { Package, MapPin, Boxes, PackageOpen, Clock, ShieldCheck, Archive } from 'lucide-react'
import Link from 'next/link'

export default function InvDashboard() {
  return (
    <div className="space-y-16 pb-24 animate-fade-up">
      <div className="space-y-6">
        <div className="inline-flex items-center px-3 py-1 bg-white border border-border-light rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          Dashboard
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-semibold tracking-tight text-text-primary flex items-center gap-3">
            Hi Inventory Manager <span className="text-3xl">👋</span>
          </h1>
          <p className="text-text-secondary text-lg">Track and manage your inventory</p>
        </div>
      </div>

      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="relative overflow-hidden p-8 rounded-3xl bg-background border border-border-light">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-surface-warm">
                <Package className="w-6 h-6 text-text-secondary" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-text-secondary">Total Assets</p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums">0</p>
            </div>
          </div>

          <div className="relative overflow-hidden p-8 rounded-3xl bg-background border border-border-light">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-surface-warm">
                <Boxes className="w-6 h-6 text-text-secondary" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-text-secondary">Available</p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums">0</p>
            </div>
          </div>

          <div className="relative overflow-hidden p-8 rounded-3xl bg-[#fffbeb] border border-[#fef3c7]">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-[#fef3c7]/50">
                <ShieldCheck className="w-6 h-6 text-amber-700" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-amber-700">Maintenance</p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums text-amber-900">0</p>
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
              { title: "Storage Layout", desc: "Warehouse topography", icon: MapPin, href: "/inv/locations" },
              { title: "Kits & Bundles", desc: "Manage bundles", icon: Boxes, href: "/inv/kits" },
              { title: "Consumables", desc: "Track stock levels", icon: PackageOpen, href: "/inv/consumables" },
              { title: "Activities", desc: "Recent changes", icon: Clock, href: "/inv/activity" },
              { title: "Audit", desc: "Analytics & reports", icon: ShieldCheck, href: "/inv/reports" },
              { title: "Equipment Archive", desc: "Retired items", icon: Archive, href: "/inv/assets/archive" },
              { title: "Kits Archive", desc: "Retired kits", icon: Archive, href: "/inv/kits/archive" },
            ].map((link, i) => (
              <Link key={i} href={link.href} className="group flex flex-col items-center justify-center p-6 bg-background border border-border-light rounded-3xl hover:border-border-focus transition-all hover:-translate-y-1 aspect-square sm:aspect-auto sm:h-52 text-center relative overflow-hidden">
                <div className="p-4 rounded-2xl bg-surface-warm group-hover:bg-border-light transition-colors mb-4">
                  <link.icon className="w-8 h-8 text-text-secondary" strokeWidth={1.5} />
                </div>
                <span className="text-base font-semibold text-text-primary leading-tight px-2">{link.title}</span>
                <span className="text-xs text-text-tertiary mt-2">{link.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
