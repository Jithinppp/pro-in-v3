import { ScanBarcode, QrCode, Hammer, FileText, CheckCircle2 } from 'lucide-react'
import { QuickActionCard } from '@/components/ui/QuickActionCard'

export default function TechDashboard() {
  return (
    <div className="space-y-16 pb-24 animate-fade-up">
      <div className="space-y-6">
        <div className="inline-flex items-center px-3 py-1 bg-white border border-border rounded-full text-[10px] font-bold text-mid-gray uppercase tracking-widest">
          Dashboard
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-semibold tracking-tight text-charcoal flex items-center gap-3">
            Hi Technician <span className="text-3xl">👋</span>
          </h1>
          <p className="text-mid-gray text-lg">Scanner & Pull-sheets</p>
        </div>
      </div>

      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden p-8 rounded-3xl bg-white border border-border">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 rounded-2xl bg-secondary">
                <FileText className="w-6 h-6 text-charcoal" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-2 text-mid-gray">Pending Pulls</p>
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
              { title: "Assignments", desc: "View pull-sheets", icon: FileText, href: "/tech/assignments" },
              { title: "Scan Out", desc: "Fulfill pulls", icon: ScanBarcode, href: "/tech/scan" },
              { title: "Scan Returns", desc: "Process checking", icon: QrCode, href: "/tech/returns" },
              { title: "QC & Maintenance", desc: "Log damages", icon: Hammer, href: "/tech/maintenance" },
            ].map((link, i) => (
              <QuickActionCard key={i} {...link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
