'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { addAssets } from './actions'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Info, Layers, Package, Sparkles, Clock, ShieldCheck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const assetSchema = z.object({
  model_id: z.string().min(1, 'Model is required'),
  location_id: z.string().min(1, 'Location is required'),
  status: z.string().min(1, 'Status is required'),
  condition: z.string().min(1, 'Condition is required'),
  asset_code: z.string().optional(),
  serial_number: z.string().optional(),
  case_number: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_cost: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().optional()),
  warranty_expiry: z.string().optional(),
  last_maintenance: z.string().optional(),
  next_maintenance: z.string().optional(),
  description: z.string().optional(),
  weight: z.string().optional(),
  invoice_number: z.string().optional(),
  supplier_id: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetSchema>

interface AddAssetFormProps {
  categories: { id: string; name: string; code: string }[]
  subcategories: { id: string; name: string; code: string; category_id: string }[]
  models: { id: string; name: string; brand: string; code: string; subcategory_id: string }[]
  locations: { id: string; name: string }[]
  suppliers: { id: string; name: string }[]
}

export function AddAssetForm({ categories, subcategories, models, locations, suppliers }: AddAssetFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('')
  const [nextSequence, setNextSequence] = useState<number>(1)
  const [isGenerating, setIsGenerating] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      model_id: '',
      asset_code: '',
    },
  })

  const modelId = watch('model_id')

  const filteredSubcategories = useMemo(() => 
    subcategories.filter(s => s.category_id === selectedCategoryId),
  [selectedCategoryId, subcategories])

  const filteredModels = useMemo(() => 
    models.filter(m => m.subcategory_id === selectedSubcategoryId),
  [selectedSubcategoryId, models])

  const codePrefix = useMemo(() => {
    if (!selectedCategoryId || !selectedSubcategoryId || !modelId) return ''
    const cat = categories.find(c => c.id === selectedCategoryId)
    const sub = subcategories.find(s => s.id === selectedSubcategoryId)
    const mod = models.find(m => m.id === modelId)
    if (!cat || !sub || !mod) return ''
    return `${cat.code}-${sub.code}-${mod.code}-`
  }, [selectedCategoryId, selectedSubcategoryId, modelId, categories, subcategories, models])

  useEffect(() => {
    const fetchLastSequence = async () => {
      if (!codePrefix) {
        setNextSequence(1)
        setValue('asset_code', '')
        return
      }

      setIsGenerating(true)
      try {
        const { data } = await supabase
          .from('assets')
          .select('asset_code')
          .like('asset_code', `${codePrefix}%`)
          .order('asset_code', { ascending: false })
          .limit(1)

        if (data && data.length > 0) {
          const lastCode = data[0].asset_code
          const lastNumStr = lastCode.split('-').pop()
          const lastNum = parseInt(lastNumStr || '0', 10)
          setNextSequence(lastNum + 1)
        } else {
          setNextSequence(1)
        }
      } catch (err) {
        setNextSequence(1)
      } finally {
        setIsGenerating(false)
      }
    }

    fetchLastSequence()
  }, [codePrefix, supabase, setValue])

  useEffect(() => {
    if (codePrefix) {
      const formattedSeq = nextSequence.toString().padStart(4, '0')
      setValue('asset_code', `${codePrefix}${formattedSeq}`)
    }
  }, [codePrefix, nextSequence, setValue])

  const handleCategoryChange = (id: string) => {
    setSelectedCategoryId(id)
    setSelectedSubcategoryId('')
    setValue('model_id', '')
  }

  const handleSubcategoryChange = (id: string) => {
    setSelectedSubcategoryId(id)
    setValue('model_id', '')
  }

  const onSubmit = async (values: AssetFormValues) => {
    setError(null)
    if (!values.asset_code) {
      setError('System could not generate a code. Please select a Model.')
      return
    }

    const items = [{
      asset_code: values.asset_code,
      serial_number: values.serial_number || '',
    }]

    startTransition(async () => {
      const result = await addAssets({ ...values, items })
      if (result.success) {
        toast.success('Asset successfully registered')
        router.push('/inv/assets')
        router.refresh()
      } else {
        setError(result.error || 'Failed to add asset')
      }
    })
  }

  return (
    <PageContainer>
      <div className="mb-12">
        <Link 
          href="/inv/assets" 
          className="inline-flex items-center text-xs font-semibold text-mid-gray hover:text-charcoal uppercase tracking-widest transition-colors mb-4 group"
        >
          <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Inventory
        </Link>
        <PageHeader 
          label="Registration"
          title="Register Single Asset"
          subtitle="Assign a unique system ID and track lifecycle data for high-value equipment."
          className="!mb-0 !items-start !text-left"
        />
      </div>

      {error && (
        <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-md text-destructive text-sm font-medium flex items-center gap-3">
          <Info className="size-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Hierarchy Section */}
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">Catalog Hierarchy</h2>
                <div className="h-px w-full bg-border"></div>
              </div>
              
              <div className="p-10 bg-white border border-border rounded-lg space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Select 
                    label="Parent Category" 
                    value={selectedCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                    className="h-11"
                  />
                  <Select 
                    label="Subcategory" 
                    disabled={!selectedCategoryId}
                    value={selectedSubcategoryId}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    options={filteredSubcategories.map(s => ({ value: s.id, label: s.name }))}
                    className="h-11"
                  />
                </div>
                <Select 
                  label="Target Product Model" 
                  disabled={!selectedSubcategoryId}
                  {...register('model_id')} 
                  options={filteredModels.map(m => ({ value: m.id, label: `${m.brand} ${m.name}` }))}
                  error={errors.model_id?.message}
                  className="h-11"
                />
              </div>
            </section>

            {/* Financials Section */}
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">Lifecycle & Value</h2>
                <div className="h-px w-full bg-border"></div>
              </div>
              
               <div className="p-10 bg-white border border-border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-10">
                 <Input label="Purchase Cost" type="number" step="0.01" placeholder="0.00" {...register('purchase_cost')} />
                 <Input label="Purchase Date" type="date" {...register('purchase_date')} />
                 <Input label="Warranty Expiry" type="date" {...register('warranty_expiry')} />
                 <Input label="Invoice Number" placeholder="INV-000" {...register('invoice_number')} />
                 <Input label="Weight / Dim" placeholder="e.g. 12kg / 20x10x10" {...register('weight')} />
                 <Input label="Case / Rack ID" placeholder="e.g. CASE-42" {...register('case_number')} />
                 <div className="md:col-span-2">
                   <Input label="Technical Description" placeholder="Additional specifications or notes..." {...register('description')} />
                 </div>
               </div>

            </section>

            {/* Maintenance Section */}
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-bold text-mid-gray uppercase tracking-[0.3em] whitespace-nowrap">Maintenance Schedule</h2>
                <div className="h-px w-full bg-border"></div>
              </div>
              
              <div className="p-10 bg-white border border-border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-10">
                <Input label="Last Service" type="date" {...register('last_maintenance')} />
                <Input label="Next Scheduled" type="date" {...register('next_maintenance')} />
              </div>
            </section>
          </div>

          {/* Sidebar / Finalization */}
          <aside className="lg:col-span-4 space-y-12">
            
            <div className="p-8 bg-white border border-border rounded-lg space-y-10 sticky top-24">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-charcoal flex items-center gap-2 uppercase tracking-widest">
                  <Sparkles className="size-4" />
                  System Identity
                </h3>
                <p className="text-xs text-mid-gray font-light">
                  Required identifiers for physical tracking.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-mid-gray uppercase tracking-widest ml-1">Unique System Code</label>
                  <div className="relative group">
                     <input 
                       readOnly 
                       {...register('asset_code')}
                       className={cn(
                         "w-full h-14 bg-secondary border border-border rounded-md text-charcoal font-display font-bold text-center tracking-widest pr-4 outline-none transition-all"
                       )}
                       placeholder="----"
                     />

                    {isGenerating && <div className="absolute inset-0 bg-white/50 animate-pulse rounded-md" />}
                  </div>
                </div>

                <Input 
                  label="Serial Number" 
                  placeholder="Required for single items" 
                  {...register('serial_number')}
                  error={errors.serial_number?.message}
                  className="h-11"
                />

                 <Select 
                   label="Storage Location" 
                   {...register('location_id')} 
                   options={locations.map(l => ({ value: l.id, label: l.name }))}
                   error={errors.location_id?.message}
                   className="h-11"
                 />

                 <div className="space-y-2">
                   <div className="flex items-center justify-between px-1">
                     <label className="text-[11px] font-bold text-mid-gray uppercase tracking-widest">Supplier</label>
                     <Link 
                       href="/inv/suppliers" 
                       className="text-[10px] font-semibold text-charcoal hover:underline uppercase tracking-tighter"
                     >
                       + Add New
                     </Link>
                   </div>
                   <Select 
                     {...register('supplier_id')} 
                     options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                     className="h-11"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">

                  <Select label="Status" {...register('status')} options={[{ value: 'AVAILABLE', label: 'Available' }, { value: 'MAINTENANCE', label: 'Maintenance' }]} className="h-11" />
                  <Select label="Condition" {...register('condition')} options={[{ value: 'EXCELLENT', label: 'Excellent' }, { value: 'GOOD', label: 'Good' }, { value: 'FAIR', label: 'Fair' }]} className="h-11" />
                </div>
              </div>

              <div className="pt-6 border-t border-border flex gap-4 text-mid-gray italic">
                <Info className="size-4 flex-shrink-0 mt-1" />
                <p className="text-[10px] leading-relaxed font-light">
                  Once registered, this asset will be live and searchable in the global database.
                </p>
              </div>

              <Button isLoading={isPending} type="submit" className="w-full h-12">
                Register Record
              </Button>
            </div>
          </aside>

        </div>
      </form>
    </PageContainer>
  )
}

