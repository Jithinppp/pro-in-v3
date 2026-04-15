import { Users, Shield, Settings, Key } from 'lucide-react'
import { QuickActionCard } from '@/components/ui/QuickActionCard'

export default function AdminDashboard() {
  return (
    <div className="space-y-16 pb-24 animate-fade-up">
      <div className="space-y-6">
        <div className="inline-flex items-center px-3 py-1 bg-white border border-border-light rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          Dashboard
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-semibold tracking-tight text-text-primary flex items-center gap-3">
            Admin Console <span className="text-3xl">👋</span>
          </h1>
          <p className="text-text-secondary text-lg">System-wide Settings</p>
        </div>
      </div>

      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden p-8 rounded-3xl bg-background border border-border-light">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-surface-warm">
                <Users className="w-6 h-6 text-text-secondary" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-text-secondary">Total Users</p>
              <p className="text-4xl font-semibold tracking-tight tabular-nums">0</p>
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
              { title: "Manage Users", desc: "Roles & Access", icon: Users, href: "/admin/users" },
              { title: "Security", desc: "Audit logs", icon: Shield, href: "/admin/security" },
              { title: "API Keys", desc: "Integrations", icon: Key, href: "/admin/api" },
            ].map((link, i) => (
              <QuickActionCard key={i} {...link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
