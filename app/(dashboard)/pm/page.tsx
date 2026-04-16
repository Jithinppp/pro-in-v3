import { FolderKanban, MapPin, Search, PlusCircle, LayoutList, History } from 'lucide-react'
import { QuickActionCard } from '@/components/ui/QuickActionCard'

export default function PmDashboard() {
  return (
    <div className="space-y-16 pb-24 animate-fade-up">
      <div className="space-y-6">
        <div className="inline-flex items-center px-3 py-1 bg-white border border-border rounded-full text-[10px] font-bold text-mid-gray uppercase tracking-widest">
          Dashboard
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-semibold tracking-tight text-charcoal flex items-center gap-3">
            Hi Project Manager <span className="text-3xl">👋</span>
          </h1>
          <p className="text-mid-gray text-lg">Manage your AV productions</p>
        </div>
      </div>

      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden p-8 rounded-3xl bg-white border border-border">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-secondary">
                <FolderKanban className="w-6 h-6 text-charcoal" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-mid-gray">Active Projects</p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums">0</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-border"></div>
            <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Quick Actions</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: "New Project", desc: "Draft a production", icon: PlusCircle, href: "/pm/projects/new" },
              { title: "All Projects", desc: "View timelines", icon: LayoutList, href: "/pm/projects" },
              { title: "Venues", desc: "Manage locations", icon: MapPin, href: "/pm/venues" },
              { title: "Catalog Search", desc: "Browse models", icon: Search, href: "/pm/catalog" },
              { title: "Past Shows", desc: "Archive", icon: History, href: "/pm/archive" },
            ].map((link, i) => (
              <QuickActionCard key={i} {...link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
