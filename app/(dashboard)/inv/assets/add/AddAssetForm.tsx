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
import { ArrowLeft, Info, Layers, Package, Sparkles, Clock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'

const assetSchema = z.object({
  model_id: z.string().min(1, 'Model is required'),
  location_id: z.string().min(1, 'Location is required'),
  status: z.string().min(1, 'Status is required').default('AVAILABLE'),
  condition: z.string().min(1, 'Condition is required').default('EXCELLENT'),
  asset_code: z.string().optional(),
  serial_number: z.string().optional(),
  case_number: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_cost: z.coerce.number().optional(),
  warranty_expiry: z.string().optional(),
  last_maintenance: z.string().optional(),
  next_maintenance: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetSchema>

interface AddAssetFormProps {
  categories: { id: string; name: string; code: string }[]
  subcategories: { id: string; name: string; code: string; category_id: string }[]
  models: { id: string; name: string; brand: string; code: string; subcategory_id: string }[]
  locations: { id: string; name: string }[]
}

export function AddAssetForm({ categories, subcategories, models, locations }: AddAssetFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Selection State
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

  // Filtered Lists
  const filteredSubcategories = useMemo(() => 
    subcategories.filter(s => s.category_id === selectedCategoryId),
  [selectedCategoryId, subcategories])

  const filteredModels = useMemo(() => 
    models.filter(m => m.subcategory_id === selectedSubcategoryId),
  [selectedSubcategoryId, models])

  // Get Code Prefix
  const codePrefix = useMemo(() => {
    if (!selectedCategoryId || !selectedSubcategoryId || !modelId) return ''
    const cat = categories.find(c => c.id === selectedCategoryId)
    const sub = subcategories.find(s => s.id === selectedSubcategoryId)
    const mod = models.find(m => m.id === modelId)
    if (!cat || !sub || !mod) return ''
    return `${cat.code}-${sub.code}-${mod.code}-`
  }, [selectedCategoryId, selectedSubcategoryId, modelId, categories, subcategories, models])

  // Calculate Next Sequence from DB
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
        console.error('Sequence fetch failed', err)
        setNextSequence(1)
      } finally {
        setIsGenerating(false)
      }
    }

    fetchLastSequence()
  }, [codePrefix, supabase, setValue])

  // Update Display Code
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
      const result = await addAssets({
        ...values,
        items
      })

      if (result.success) {
        router.push('/inv/assets')
        router.refresh()
      } else {
        setError(result.error || 'Failed to add asset')
      }
    })
  }

  return (
    <PageContainer>
      <PageHeader 
        label="Registration"
        title="Register Single Asset"
        subtitle="Assign a unique system ID to high-value equipment."
        actions={
          <Link href="/inv/assets" className="p-3 hover:bg-white border border-transparent hover:border-border-light rounded-2xl transition-all text-text-tertiary shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        }
      />

      {error && (
        <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-sm font-medium flex items-center gap-3">
          <Info className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* Left Column: Core Data */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-10">
          
          {/* Section: Categorization */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="h-6 w-1 bg-text-primary rounded-full"></div>
              <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Categorization
              </h2>
            </div>
            
            <div className="p-10 bg-white border border-border-light rounded-[32px] shadow-sm hover:shadow-md transition-shadow duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Select 
                  label="1. Parent Category" 
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                />
                <Select 
                  label="2. Subcategory" 
                  disabled={!selectedCategoryId}
                  value={selectedSubcategoryId}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  options={filteredSubcategories.map(s => ({ value: s.id, label: s.name }))}
                />
              </div>

              <div className="mt-8 pt-8 border-t border-border-light/50">
                <Select 
                  label="3. Target Product Model" 
                  disabled={!selectedSubcategoryId}
                  {...register('model_id')} 
                  options={filteredModels.map(m => ({ value: m.id, label: `${m.brand} ${m.name}` }))}
                  error={errors.model_id?.message}
                />
              </div>
            </div>
          </div>

          {/* Section: Financials & Lifecycle */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="h-6 w-1 bg-text-primary rounded-full"></div>
              <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Financials & Lifecycle
              </h2>
            </div>
            
            <div className="p-10 bg-white border border-border-light rounded-[32px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Purchase Cost" 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  {...register('purchase_cost')}
                  error={errors.purchase_cost?.message}
                />
                <Input 
                  label="Purchase Date" 
                  type="date" 
                  {...register('purchase_date')}
                  error={errors.purchase_date?.message}
                />
                <Input 
                  label="Warranty Expiry" 
                  type="date" 
                  {...register('warranty_expiry')}
                  error={errors.warranty_expiry?.message}
                />
                <Input 
                  label="Case Number / Rack ID" 
                  placeholder="e.g. CASE-42 or RACK-A1"
                  {...register('case_number')}
                  error={errors.case_number?.message}
                />
              </div>
            </div>
          </div>

          {/* Section: Maintenance */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="h-6 w-1 bg-text-primary rounded-full"></div>
              <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Maintenance Schedule
              </h2>
            </div>
            
            <div className="p-10 bg-white border border-border-light rounded-[32px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Last Maintenance Service" 
                  type="date" 
                  {...register('last_maintenance')}
                  error={errors.last_maintenance?.message}
                />
                <Input 
                  label="Next Scheduled Service" 
                  type="date" 
                  {...register('next_maintenance')}
                  error={errors.next_maintenance?.message}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Identification & Status */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-10">
          
          <div className="space-y-6">
             <div className="flex items-center gap-3 px-2">
              <div className="h-6 w-1 bg-text-primary rounded-full"></div>
              <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4" />
                Identification
              </h2>
            </div>

            <div className="p-8 bg-white border border-border-light rounded-[32px] shadow-sm space-y-8">
               {/* System Generated Code Preview */}
               <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
                    Generated Code
                  </label>
                  {isGenerating && <span className="text-[10px] text-action-primary animate-pulse font-bold">Syncing...</span>}
                </div>
                <div className="group relative">
                  <Input 
                    readOnly 
                    {...register('asset_code')}
                    className="bg-surface-warm/30 border-dashed border-border-light font-mono font-bold text-action-primary tracking-widest text-base py-4 text-center"
                    placeholder="[SELECT MODEL]"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Sparkles className={`w-5 h-5 text-action-primary/40 transition-opacity ${codePrefix ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-border-light/50">
                <Input 
                  label="Serial Number" 
                  placeholder="Required for single assets" 
                  {...register('serial_number')}
                  error={errors.serial_number?.message}
                />
                <Select 
                  label="Storage Location" 
                  {...register('location_id')} 
                  options={locations.map(l => ({ value: l.id, label: l.name }))}
                  error={errors.location_id?.message}
                />
                <div className="grid grid-cols-2 gap-4">
                   <Select 
                    label="Initial Status" 
                    {...register('status')} 
                    options={[
                      { value: 'AVAILABLE', label: 'Available' },
                      { value: 'MAINTENANCE', label: 'Maintenance' },
                      { value: 'OUT', label: 'Out' },
                      { value: 'PENDING_QC', label: 'Pending QC' },
                    ]}
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
                  />
                </div>
              </div>

              <div className="p-5 bg-surface-warm rounded-2xl border border-border-light flex gap-4">
                <Info className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-tertiary leading-relaxed font-medium">
                  Registration will create a unique physical record. Ensure serial numbers match the physical unit.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button isLoading={isPending} type="submit" size="xl" className="w-full">
              Complete Registration
            </Button>
            <Link href="/inv/assets" className="block text-center mt-4 text-xs font-bold text-text-tertiary uppercase tracking-widest hover:text-text-primary transition-colors">
              Cancel and Return
            </Link>
          </div>

        </div>
      </form>
    </PageContainer>
  )
}
