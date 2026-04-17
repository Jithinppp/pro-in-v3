'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { MoveAssetModal } from './MoveAssetModal'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface AssetTableProps {
  assets: any[]
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'AVAILABLE': 
      return 'bg-charcoal text-white'
    case 'MAINTENANCE':
      return 'bg-destructive/10 text-destructive border border-destructive/20'
    default:
      return 'bg-secondary text-charcoal border border-border'
  }
}

const getConditionStyles = (condition: string) => {
  switch (condition) {
    case 'EXCELLENT':
    case 'GOOD': 
      return 'text-charcoal font-semibold'
    case 'POOR':
    case 'BROKEN': 
      return 'text-destructive font-semibold'
    default: 
      return 'text-mid-gray'
  }
}

export function AssetTable({ assets }: AssetTableProps) {
  const [movingAsset, setMovingAsset] = useState<any | null>(null)
  const router = useRouter()

  if (assets.length === 0) {
    return (
      <div className="py-24 text-center bg-white border border-dashed border-border rounded-lg">
        <p className="text-sm font-display font-semibold text-charcoal">No assets matched your refinement</p>
        <p className="text-xs text-mid-gray mt-1">Try adjusting your filters or search term.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-secondary/30 text-[10px] font-bold text-mid-gray uppercase tracking-widest">
            <th className="px-6 py-4">SKU / ID</th>
            <th className="px-6 py-4">SERIAL</th>
            <th className="px-6 py-4">MODEL / SPEC</th>
            <th className="px-6 py-4">LOCATION</th>
            <th className="px-6 py-4">CONDITION</th>
            <th className="px-6 py-4">STATUS</th>
            <th className="px-6 py-4 text-right">ACTION</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {assets.map((asset) => (
            <tr key={asset.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
              <td className="px-6 py-5 font-display font-bold text-charcoal whitespace-nowrap tracking-tight">
                {asset.asset_code}
              </td>
              <td className="px-6 py-5 text-mid-gray font-mono text-xs">
                {asset.serial_number || '-'}
              </td>
              <td className="px-6 py-5 text-charcoal font-semibold">
                {asset.models ? `${asset.models.brand} ${asset.models.name}` : '-'}
              </td>
              <td className="px-6 py-5 text-mid-gray font-light">
                {asset.storage_locations?.name || '-'}
              </td>
              <td className={cn("px-6 py-5 text-xs uppercase tracking-wider", getConditionStyles(asset.condition))}>
                {asset.condition || '-'}
              </td>
              <td className="px-6 py-5">
                <span className={cn(
                  "px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest inline-block",
                  getStatusStyles(asset.status)
                )}>
                  {asset.status || '-'}
                </span>
              </td>
               <td className="px-6 py-5 text-right">
                 <div className="flex items-center justify-end gap-2">
                   <Link 
                     href={`/inv/assets/${asset.id}`}
                     className="p-2 text-mid-gray hover:text-charcoal hover:bg-secondary rounded-md transition-all"
                     title="Manage Asset"
                   >
                     <ChevronRight className="size-4" />
                   </Link>
                 </div>
               </td>

            </tr>
          ))}
        </tbody>
      </table>

      {movingAsset && (
        <MoveAssetModal 
          asset={movingAsset} 
          onClose={() => setMovingAsset(null)} 
          onSuccess={() => router.refresh()} 
        />
      )}
    </div>
  )
}
