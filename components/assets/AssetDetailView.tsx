'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  ArrowRight, 
  Edit3, 
  Trash2, 
  Package, 
  MapPin, 
  Activity, 
  Tag,
  Calendar,
  CreditCard,
  ShieldCheck,
  Users,
  Info,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { deleteAsset, updateAsset, getAssetMaintenanceLogs } from '@/app/(dashboard)/inv/assets/actions'
import { reportDamage } from '@/app/(dashboard)/tech/maintenance/actions'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { MoveAssetModal } from './MoveAssetModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const updateAssetSchema = z.object({
  location_id: z.string().min(1, 'Location is required'),
  status: z.string().min(1, 'Status is required'),
  condition: z.string().min(1, 'Condition is required'),
  serial_number: z.string().optional(),
  case_number: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_cost: z.coerce.number().optional(),
  warranty_expiry: z.string().optional(),
  last_maintenance: z.string().optional(),
  next_maintenance: z.string().optional(),
  description: z.string().optional(),
  weight: z.string().optional(),
  invoice_number: z.string().optional(),
  supplier_id: z.string().optional(),
})

type UpdateAssetValues = z.infer<typeof updateAssetSchema>

interface AssetDetailViewProps {
  asset: any
  updatedAt: string
  locations: { id: string, name: string }[]
  suppliers: { id: string, name: string }[]
}

const DetailItem = ({ label, value, icon: Icon, isEditing, register, error, type }: { 
  label: string, 
  value: any, 
  icon?: any, 
  isEditing?: boolean, 
  register?: any, 
  error?: string,
  type?: string
}) => {
  if (isEditing) {
    return (
      <Input 
        label={label} 
        type={type}
        {...register} 
        error={error} 
        icon={Icon ? <Icon className="size-4" /> : undefined}
      />
    )
  }

  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-border rounded-lg">
      {Icon && <Icon className="size-4 text-mid-gray mt-1" />}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-mid-gray uppercase tracking-widest">{label}</span>
        <span className="text-sm font-display font-semibold text-charcoal">{value || '-'}</span>
      </div>
    </div>
  )
}

export function AssetDetailView({ asset, updatedAt, locations, suppliers }: AssetDetailViewProps) {
  const [movingAsset, setMovingAsset] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchLogs() {
      setIsLoadingLogs(true)
      try {
        const logs = await getAssetMaintenanceLogs(asset.id)
        setMaintenanceLogs(logs)
      } catch (error) {
        console.error('Failed to fetch maintenance logs:', error)
      } finally {
        setIsLoadingLogs(false)
      }
    }
    fetchLogs()
  }, [asset.id])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateAssetValues>({
    resolver: zodResolver(updateAssetSchema) as any,
    defaultValues: {
      location_id: asset.location_id || '',
      status: asset.status || '',
      condition: asset.condition || '',
      serial_number: asset.serial_number || '',
      case_number: asset.case_number || '',
      purchase_date: asset.purchase_date || '',
      purchase_cost: asset.purchase_cost,
      warranty_expiry: asset.warranty_expiry || '',
      last_maintenance: asset.last_maintenance || '',
      next_maintenance: asset.next_maintenance || '',
      description: asset.description || '',
      weight: asset.weight || '',
      invoice_number: asset.invoice_number || '',
      supplier_id: asset.supplier_id || '',
    }
  })

  const handleSave = async (values: UpdateAssetValues) => {
    try {
      await updateAsset(asset.id, values)
      toast.success('Asset updated successfully')
      setIsEditing(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update asset')
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setConfirmOpen(true)
  }

  const handleReportDamage = async () => {
    const description = window.prompt('Describe the damage or fault:')
    if (!description) return

    try {
      const result = await reportDamage({ assetId: asset.id, description })
      if (result.success) {
        toast.success('Damage reported. Asset moved to maintenance.')
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to report damage')
    }
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

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* System Identity Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">System Identity</h2>
              <div className="h-px w-full bg-border"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                label="Asset Code" 
                value={asset.asset_code} 
                icon={Tag} 
              />
              <DetailItem 
                label="Serial Number" 
                value={asset.serial_number} 
                icon={Activity} 
                isEditing={isEditing}
                register={register('serial_number')}
                error={errors.serial_number?.message}
              />
              <DetailItem 
                label="Model" 
                value={asset.models ? `${asset.models.brand} ${asset.models.name}` : '-'} 
                icon={Package} 
              />
              <DetailItem 
                label="Subcategory" 
                value={asset.models?.subcategories?.name} 
                icon={Package} 
              />
              <DetailItem 
                label="Category" 
                value={asset.models?.subcategories?.categories?.name} 
                icon={Package} 
              />
              <DetailItem 
                label="Case Number" 
                value={asset.case_number} 
                icon={Package} 
                isEditing={isEditing}
                register={register('case_number')}
                error={errors.case_number?.message}
              />
            </div>
          </section>

          {/* Logistics & Status Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">Logistics & State</h2>
              <div className="h-px w-full bg-border"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <Select 
                    label="Current Location" 
                    {...register('location_id')} 
                    options={locations.map(l => ({ value: l.id, label: l.name }))}
                    error={errors.location_id?.message}
                  />
                  <Select 
                    label="Asset Status" 
                    {...register('status')} 
                    options={[
                      { value: 'AVAILABLE', label: 'Available' },
                      { value: 'RESERVED', label: 'Reserved' },
                      { value: 'OUT', label: 'Out' },
                      { value: 'PENDING_QC', label: 'Pending QC' },
                      { value: 'MAINTENANCE', label: 'Maintenance' },
                    ]}
                    error={errors.status?.message}
                  />
                  <Select 
                    label="Condition" 
                    {...register('condition')} 
                      options={[
                        { value: 'EXCELLENT', label: 'Excellent' },
                        { value: 'GOOD', label: 'Good' },
                        { value: 'FAIR', label: 'Fair' },
                        { value: 'POOR', label: 'Poor' },
                      ]}
                    error={errors.condition?.message}
                  />
                  <Select 
                    label="Supplier" 
                    {...register('supplier_id')} 
                    options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                    error={errors.supplier_id?.message}
                  />
                </>
              ) : (
                <>
                  <DetailItem label="Current Location" value={asset.storage_locations?.name} icon={MapPin} />
                  <DetailItem label="Asset Status" value={asset.status} icon={Activity} />
                  <DetailItem label="Condition" value={asset.condition} icon={ShieldCheck} />
                  <DetailItem 
                    label="Supplier" 
                    value={asset.suppliers ? `${asset.suppliers.name} (${asset.suppliers.contact_name || 'No Contact'})` : '-'} 
                    icon={Users} 
                  />
                </>
              )}
            </div>
          </section>

          {/* Procurement & Financials Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">Procurement & Value</h2>
              <div className="h-px w-full bg-border"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                label="Invoice Number" 
                value={asset.invoice_number} 
                icon={CreditCard} 
                isEditing={isEditing}
                register={register('invoice_number')}
                error={errors.invoice_number?.message}
              />
              <DetailItem 
                label="Purchase Cost" 
                value={asset.purchase_cost ? `$${asset.purchase_cost}` : '-'} 
                icon={CreditCard} 
                isEditing={isEditing}
                register={register('purchase_cost')}
                error={errors.purchase_cost?.message}
              />
               <DetailItem 
                 label="Purchase Date" 
                 value={asset.purchase_date} 
                 icon={Calendar} 
                 isEditing={isEditing}
                 register={register('purchase_date')}
                 error={errors.purchase_date?.message}
                 type="date"
               />
               <DetailItem 
                 label="Warranty Expiry" 
                 value={asset.warranty_expiry} 
                 icon={ShieldCheck} 
                 isEditing={isEditing}
                 register={register('warranty_expiry')}
                 error={errors.warranty_expiry?.message}
                 type="date"
               />
             </div>
           </section>
 
            {/* Lifecycle & Maintenance Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">Lifecycle & Maintenance</h2>
                <div className="h-px w-full bg-border"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  label="Last Maintenance" 
                  value={asset.last_maintenance} 
                  icon={Calendar} 
                  isEditing={isEditing}
                  register={register('last_maintenance')}
                  error={errors.last_maintenance?.message}
                  type="date"
                />
                <DetailItem 
                  label="Next Maintenance" 
                  value={asset.next_maintenance} 
                  icon={Calendar} 
                  isEditing={isEditing}
                  register={register('next_maintenance')}
                  error={errors.next_maintenance?.message}
                  type="date"
                />
                <div className="md:col-span-2">
                  {isEditing ? (
                    <Input 
                      label="Technical Description" 
                      {...register('description')} 
                      error={errors.description?.message}
                      className="min-h-[100px] py-3"
                    />
                  ) : (
                    <DetailItem label="Technical Description" value={asset.description} icon={Info} />
                  )}
                </div>
              </div>

              {/* Maintenance History Log */}
              {!isEditing && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-[11px] font-bold text-mid-gray uppercase tracking-widest">Service History</h3>
                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center py-8 text-xs text-mid-gray animate-pulse">
                      Loading history...
                    </div>
                  ) : maintenanceLogs.length > 0 ? (
                    <div className="space-y-3">
                      {maintenanceLogs.map((log) => (
                        <div key={log.id} className="p-4 bg-white border border-border rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-3 text-mid-gray" />
                              <span className="text-xs font-semibold text-charcoal">{log.service_date}</span>
                            </div>
                            <span className="text-[10px] font-medium text-mid-gray px-2 py-0.5 bg-secondary rounded-full">
                              {log.technician || 'System'}
                            </span>
                          </div>
                          <p className="text-sm text-charcoal leading-relaxed">{log.description}</p>
                          {log.cost && (
                            <div className="flex items-center gap-1 text-[11px] text-mid-gray italic">
                              <span>Cost:</span>
                              <span className="font-medium text-charcoal">${log.cost}</span>
                            </div>
                          )}
                          {log.parts_replaced && (
                            <div className="flex items-center gap-1 text-[11px] text-mid-gray italic">
                              <span>Parts:</span>
                              <span className="font-medium text-charcoal">{log.parts_replaced}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-border rounded-lg">
                      <p className="text-xs text-mid-gray italic">No maintenance records found for this asset.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-border rounded-lg space-y-6 sticky top-24">
            <h3 className="text-[10px] font-bold text-mid-gray uppercase tracking-widest">Management</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {!isEditing && (
                <Button 
                  variant="secondary"
                  className="w-full justify-start gap-3 h-12 text-sm font-semibold text-charcoal hover:bg-secondary/80 transition-all"
                  onClick={() => setMovingAsset(asset)}
                >
                  <ArrowRight className="size-4" />
                  Move Asset
                </Button>
              )}

              {isEditing ? (
                <>
                  <Button 
                    className="w-full justify-start gap-3 h-12 text-sm font-semibold text-white bg-charcoal hover:bg-charcoal/90 transition-all"
                    onClick={handleSubmit(handleSave)}
                  >
                    <Save className="size-4" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-sm font-semibold text-charcoal hover:bg-secondary transition-all"
                    onClick={handleCancel}
                  >
                    <X className="size-4" />
                    Cancel Edit
                  </Button>
                </>
              ) : (
                <Button 
                  variant="secondary"
                  className="w-full justify-start gap-3 h-12 text-sm font-semibold text-charcoal hover:bg-secondary/80 transition-all"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="size-4" />
                  Edit Details
                </Button>
              )}

               {!isEditing && (
                 <Button 
                   variant="secondary"
                   className="w-full justify-start gap-3 h-12 text-sm font-semibold text-charcoal hover:bg-secondary/80 transition-all mb-3"
                   onClick={handleReportDamage}
                 >
                   <Activity className="size-4 text-destructive" />
                   Report Damage
                 </Button>
               )}
               {!isEditing && (
                 <Button 
                   variant="danger"
                  className="w-full justify-center gap-3 h-12 text-sm font-semibold hover:bg-destructive/90 transition-all"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" />
                  Delete Asset
                </Button>
              )}
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
             <div className="flex items-center gap-3 text-mid-gray italic">
               <Info className="size-4 flex-shrink-0" />
               <p className="text-xs leading-relaxed font-light">
                 Last modified on <span className="text-charcoal font-semibold">{updatedAt}</span>.
               </p>
             </div>
           </div>
        </div>
      </div>

      {movingAsset && (
        <MoveAssetModal 
          asset={movingAsset} 
          onClose={() => setMovingAsset(null)} 
          onSuccess={() => {
            setMovingAsset(null);
          }} 
        />
      )}
    </div>
  )
}
