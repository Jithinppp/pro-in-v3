'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { LocationPicker } from '@/components/ui/LocationPicker'
import { X, Move, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface MoveAssetModalProps {
  asset: any
  onClose: () => void
  onSuccess: () => void
}

export function MoveAssetModal({ asset, onClose, onSuccess }: MoveAssetModalProps) {
  const [targetLocationId, setTargetLocationId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setTargetLocationId(asset.location_id)
  }, [asset])

  const handleMove = async () => {
    if (!targetLocationId) {
      toast.error('Please select a destination location')
      return
    }

    if (targetLocationId === asset.location_id) {
      toast.error('Asset is already in this location')
      return
    }

    setIsPending(true)
    try {
      // 1. Update Asset Location
      const { error: updateError } = await supabase
        .from('assets')
        .update({ location_id: targetLocationId })
        .eq('id', asset.id)

      if (updateError) throw updateError

      // 2. Log Activity
      const { data: profile } = await supabase.from('profiles').select('id').single()
      
      await supabase.from('activity_log').insert([{
        user_id: profile?.id,
        entity_type: 'ASSET',
        entity_id: asset.id,
        action: 'MOVE',
        old_value: asset.storage_locations?.name || 'Unknown',
        new_value: targetLocationId, // We'll leave the ID, or could fetch the name
      }])

      toast.success('Asset relocated successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to move asset')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-md text-charcoal">
              <Move className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-charcoal">Relocate Asset</h3>
              <p className="text-xs text-mid-gray">{asset.asset_code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-mid-gray hover:text-charcoal hover:bg-secondary rounded-md transition-all">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-mid-gray">Target Destination</label>
            <LocationPicker 
              value={targetLocationId || undefined} 
              onChange={setTargetLocationId} 
            />
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button 
              onClick={handleMove} 
              disabled={isPending} 
              className="flex-1 h-11"
            >
              {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Confirm Move
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
