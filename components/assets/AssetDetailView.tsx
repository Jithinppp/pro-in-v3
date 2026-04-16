'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, 
  ArrowRight, 
  Edit3, 
  Trash2, 
  Package, 
  MapPin, 
  Activity, 
  Tag 
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { deleteAsset } from '@/app/(dashboard)/inv/assets/actions'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { MoveAssetModal } from './MoveAssetModal'

interface AssetDetailViewProps {
  asset: any
  updatedAt: string
}

const DetailItem = ({ label, value, icon: Icon }: { label: string, value: any, icon?: any }) => (
  <div className="flex items-start gap-4 p-4 bg-white border border-border rounded-lg">
    {Icon && <Icon className="size-4 text-mid-gray mt-1" />}
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-mid-gray uppercase tracking-widest">{label}</span>
      <span className="text-sm font-display font-semibold text-charcoal">{value || '-'}</span>
    </div>
  </div>
)

export function AssetDetailView({ asset, updatedAt }: AssetDetailViewProps) {
  const [movingAsset, setMovingAsset] = useState<any | null>(null)
  const router = useRouter()

  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleDelete = async () => {
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteAsset(asset.id)
      toast.success('Asset deleted')
      router.push('/inv/assets')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete asset')
    } finally {
      setConfirmOpen(false)
    }
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

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem 
              label="Asset Code" 
              value={asset.asset_code} 
              icon={Tag} 
            />
            <DetailItem 
              label="Serial Number" 
              value={asset.serial_number} 
              icon={Activity} 
            />
            <DetailItem 
              label="Model / Brand" 
              value={asset.models ? `${asset.models.brand} ${asset.models.name}` : '-'} 
              icon={Package} 
            />
            <DetailItem 
              label="Current Location" 
              value={asset.storage_locations?.name} 
              icon={MapPin} 
            />
            <DetailItem 
              label="Condition" 
              value={asset.condition} 
            />
            <DetailItem 
              label="Status" 
              value={asset.status} 
            />
          </section>

          {/* Additional Information / History could go here */}
          <section className="p-6 bg-white border border-border rounded-lg">
            <h3 className="text-[10px] font-bold text-mid-gray uppercase tracking-widest mb-4">Technical Specification</h3>
            <p className="text-sm text-mid-gray leading-relaxed">
              No additional technical specifications provided for this asset.
            </p>
          </section>
        </div>

        {/* Actions Section */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-border rounded-lg space-y-6">
            <h3 className="text-[10px] font-bold text-mid-gray uppercase tracking-widest">Management</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="secondary"
                className="w-full justify-start gap-3 h-12 text-sm font-semibold text-charcoal hover:bg-secondary/80 transition-all"
                onClick={() => setMovingAsset(asset)}
              >
                <ArrowRight className="size-4" />
                Move Asset
              </Button>

              <Link href={`/inv/assets/edit/${asset.id}`}>
                <Button 
                  variant="secondary"
                  className="w-full justify-start gap-3 h-12 text-sm font-semibold text-charcoal hover:bg-secondary/80 transition-all"
                >
                  <Edit3 className="size-4" />
                  Edit Details
                </Button>
              </Link>

              <Button 
                variant="danger"
                className="w-full justify-center gap-3 h-12 text-sm font-semibold hover:bg-destructive/90 transition-all"
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
                Delete Asset
              </Button>
            </div>
          </div>
          <ConfirmModal
            open={confirmOpen}
            title="Delete Asset"
            description="Are you sure you want to delete this asset? This action cannot be undone."
            onConfirm={confirmDelete}
            onClose={() => setConfirmOpen(false)}
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />

           <div className="p-6 bg-secondary/30 border border-border rounded-lg">
             <p className="text-xs text-mid-gray leading-relaxed">
               Asset was last updated on <span className="text-charcoal font-semibold">{updatedAt}</span>.
             </p>
           </div>
        </div>
      </div>

      {movingAsset && (
        <MoveAssetModal 
          asset={movingAsset} 
          onClose={() => setMovingAsset(null)} 
          onSuccess={() => {
            setMovingAsset(null);
            // In a real app, we'd refresh the server component
          }} 
        />
      )}
    </div>
  )
}
