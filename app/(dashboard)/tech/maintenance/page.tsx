'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Hammer, CheckCircle2, Clock, AlertCircle, ChevronRight, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { completeMaintenance } from '@/app/(dashboard)/tech/maintenance/actions'
import { useRouter } from 'next/navigation'

export default function MaintenancePage() {
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  const router = useRouter()
  
  const [maintenanceQueue, setMaintenanceQueue] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fixingId, setFixingId] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')
  const [cost, setCost] = useState('')
  const [parts, setParts] = useState('')
  const [nextDate, setNextDate] = useState('')

  async function fetchQueue() {
    setIsLoading(true)
    const { data: assets } = await supabase
      .from('assets')
      .select('*, maintenance_logs(id, description, created_at)')
      .eq('status', 'MAINTENANCE')
      .order('created_at', { ascending: false })
    
    const processed = assets?.map(asset => ({
      ...asset,
      latestLog: asset.maintenance_logs?.[0] || null
    })) || []
    
    setMaintenanceQueue(processed)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  return (
    <PageContainer>
      <PageHeader 
        label="Technical Ops"
        title="Maintenance Queue"
        subtitle="Repair and certify broken equipment to return it to available stock."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-mid-gray animate-pulse">
          Loading maintenance queue...
        </div>
      ) : maintenanceQueue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <CheckCircle2 className="size-12 text-secondary" />
          <div>
            <p className="text-lg font-semibold text-charcoal">All Clear!</p>
            <p className="text-sm text-mid-gray">No assets currently require maintenance.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {maintenanceQueue.map((item) => (
              <div 
                key={item.id} 
                className={`p-6 rounded-xl border transition-all cursor-pointer ${fixingId === item.id ? 'border-charcoal bg-secondary/30 ring-1 ring-charcoal' : 'bg-white border-border hover:border-charcoal'}`}
                onClick={() => {
                  setFixingId(item.id)
                  setResolution('')
                  setCost('')
                  setParts('')
                  setNextDate('')
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
                      <AlertCircle className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-charcoal">{item.asset_code}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold uppercase">Broken</span>
                      </div>
                      <p className="text-sm text-mid-gray mt-1">
                        {item.latestLog?.description || 'No fault description provided.'}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-[11px] text-mid-gray">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          Reported {new Date(item.latestLog?.created_at || '').toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {item.storage_locations?.name || 'Unknown Location'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`size-5 text-mid-gray transition-transform ${fixingId === item.id ? 'rotate-90' : ''}`} />
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-1">
            {fixingId ? (
              <div className="p-6 bg-white border border-border rounded-xl space-y-6 sticky top-24">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-charcoal">Complete Repair</h3>
                  <p className="text-xs text-mid-gray">Provide resolution details to return this asset to stock.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-mid-gray">Resolution / Action Taken</label>
                    <textarea 
                      className="w-full p-3 rounded-lg border border-border text-sm focus:ring-1 focus:ring-charcoal outline-none min-h-[100px]"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="e.g. Replaced broken XLR connector and tested signal..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-mid-gray">Cost ($)</label>
                      <input 
                        type="number" 
                        className="w-full p-2 rounded-lg border border-border text-sm focus:ring-1 focus:ring-charcoal outline-none"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-mid-gray">Next Service</label>
                      <input 
                        type="date" 
                        className="w-full p-2 rounded-lg border border-border text-sm focus:ring-1 focus:ring-charcoal outline-none"
                        value={nextDate}
                        onChange={(e) => setNextDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-mid-gray">Parts Replaced</label>
                    <input 
                      className="w-full p-2 rounded-lg border border-border text-sm focus:ring-1 focus:ring-charcoal outline-none"
                      value={parts}
                      onChange={(e) => setParts(e.target.value)}
                      placeholder="e.g. 1x Neutrik Connector, 2m Belden Cable"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1 h-11" 
                      isLoading={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const item = maintenanceQueue.find(i => i.id === fixingId)
                          const result = await completeMaintenance({
                            logId: item.latestLog?.id,
                            assetId: item.id,
                            resolution,
                            cost: cost ? parseFloat(cost) : undefined,
                            partsReplaced: parts,
                            nextMaintenance: nextDate || null
                          })
                          if (result.success) {
                            toast.success('Asset returned to stock')
                            setFixingId(null)
                            fetchQueue()
                          } else {
                            toast.error(result.message)
                          }
                        })
                      }}
                    >
                      Mark as Fixed
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-11" 
                      onClick={() => setFixingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-secondary/20 border border-dashed border-border rounded-xl text-center space-y-4">
                <Hammer className="size-8 text-mid-gray mx-auto" />
                <p className="text-sm text-mid-gray">Select an asset from the queue to log its repair.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </PageContainer>
  )
}
