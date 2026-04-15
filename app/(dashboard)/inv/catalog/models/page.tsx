'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { EditDrawer } from '@/components/ui/EditDrawer'
import { Plus, LayoutGrid, Edit2, Info, Trash2, ChevronLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const modelSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(2, 'Model Code must be at least 2 characters').max(20),
})

type ModelFormValues = z.infer<typeof modelSchema>

export default function ModelsPage() {
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [editingModel, setEditingModel] = useState<any | null>(null)

  // Instant selection state (No URL dependency)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('')

  const createForm = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
  })

  const editForm = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
  })

  // Load initial data
  useEffect(() => {
    const fetchBaseData = async () => {
      const { data: catData } = await supabase.from('categories').select('*').order('name')
      setCategories(catData || [])
      const { data: subData } = await supabase.from('subcategories').select('*').order('name')
      setSubcategories(subData || [])
    }
    fetchBaseData()
  }, [])

  // Load Models when Selection Changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedSubcategoryId) {
        setModels([])
        return
      }
      const { data } = await supabase
        .from('models')
        .select('*')
        .eq('subcategory_id', selectedSubcategoryId)
        .order('name')
      setModels(data || [])
    }
    fetchModels()
  }, [selectedSubcategoryId])

  useEffect(() => {
    if (editingModel) {
      editForm.reset({
        brand: editingModel.brand,
        name: editingModel.name,
        code: editingModel.code,
      })
    }
  }, [editingModel, editForm])

  const handleCategoryChange = (val: string) => {
    setSelectedCategoryId(val)
    setSelectedSubcategoryId('') // Reset subcategory when parent changes
  }

  const onCreate = async (values: ModelFormValues) => {
    if (!selectedSubcategoryId) return
    startTransition(async () => {
      const { error } = await supabase
        .from('models')
        .insert([{
          subcategory_id: selectedSubcategoryId,
          brand: values.brand.trim(),
          name: values.name.trim(),
          code: values.code.toUpperCase().trim()
        }])

      if (error) {
        toast.error('Could not create model. Code might already exist.')
      } else {
        createForm.reset()
        toast.success('Product model registered')
        // Refresh local list
        const { data } = await supabase.from('models').select('*').eq('subcategory_id', selectedSubcategoryId).order('name')
        setModels(data || [])
      }
    })
  }

  const onUpdate = async (values: ModelFormValues) => {
    if (!editingModel) return
    startTransition(async () => {
      const { error } = await supabase
        .from('models')
        .update({
          brand: values.brand.trim(),
          name: values.name.trim(),
          code: values.code.toUpperCase().trim()
        })
        .eq('id', editingModel.id)

      if (error) {
        toast.error('Update failed')
      } else {
        setEditingModel(null)
        toast.success('Model updated')
        const { data } = await supabase.from('models').select('*').eq('subcategory_id', selectedSubcategoryId).order('name')
        setModels(data || [])
      }
    })
  }

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Delete model "${name}" and all related data?`)) return
    startTransition(async () => {
      const { count } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('model_id', id)

      if (count && count > 0) {
        toast.error("Cannot delete model if physical assets exist in inventory")
        return
      }

      const { error } = await supabase.from('models').delete().eq('id', id)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Model removed from catalog')
        const { data } = await supabase.from('models').select('*').eq('subcategory_id', selectedSubcategoryId).order('name')
        setModels(data || [])
      }
    })
  }

  const filteredSubcategories = subcategories.filter(s => s.category_id === selectedCategoryId)

  return (
    <div className="max-w-[1200px] mx-auto py-12 px-4 md:px-0 space-y-10 animate-fade-up">
      {/* Navigation & Header */}
      <div className="space-y-6">
        <Link 
          href="/inv/catalog" 
          className="inline-flex items-center text-xs font-bold text-text-tertiary hover:text-action-primary uppercase tracking-widest transition-colors mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary underline decoration-border-light decoration-4 underline-offset-8">Equipment Models</h1>
          <p className="text-text-secondary text-sm">Manage specific hardware specifications.</p>
        </div>
      </div>

      {/* Selectors - INSTANT STATE */}
      <section className="p-6 bg-surface-warm border border-border-light rounded-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-1.5 min-w-[200px]">
          <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">1. Category</h3>
          <Select 
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            value={selectedCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
          />
        </div>

        <div className="w-10 h-px bg-border-light hidden md:block mt-6" />

        <div className={`flex-1 space-y-1.5 min-w-[200px] transition-opacity ${!selectedCategoryId ? 'opacity-30' : 'opacity-100'}`}>
          <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">2. Subcategory</h3>
          <Select 
            disabled={!selectedCategoryId}
            options={filteredSubcategories.map(s => ({ value: s.id, label: s.name }))}
            value={selectedSubcategoryId}
            onChange={(e) => setSelectedSubcategoryId(e.target.value)}
          />
        </div>
      </section>

      {selectedSubcategoryId ? (
        <>
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Model to {subcategories.find(s => s.id === selectedSubcategoryId)?.name}
            </h2>
            
            <form onSubmit={createForm.handleSubmit(onCreate)} className="p-6 bg-white border border-border-light rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-none uppercase text-xs">
              <div>
                <Input label="Brand" placeholder="e.g. Sony" {...createForm.register('brand')} error={createForm.formState.errors.brand?.message} />
              </div>
              <div>
                <Input label="Model Name" placeholder="e.g. A7S III" {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
              </div>
              <div>
                <Input label="Model Code" placeholder="A7S3" {...createForm.register('code')} error={createForm.formState.errors.code?.message} className="uppercase" />
              </div>
              <Button isLoading={isPending} type="submit" size="lg" className="font-bold">Register Model</Button>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Catalog List
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                    <th className="py-4 font-bold">CODE</th>
                    <th className="py-4 font-bold">BRAND</th>
                    <th className="py-4 font-bold">NAME</th>
                    <th className="py-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {models.map((m) => (
                    <tr key={m.id} className="border-b border-border-light/50 hover:bg-surface-warm/30 transition-colors group">
                      <td className="py-5 font-bold tracking-wider uppercase">{m.code}</td>
                      <td className="py-5 text-text-secondary font-medium">{m.brand}</td>
                      <td className="py-5">{m.name}</td>
                      <td className="py-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingModel(m)} className="p-2 text-text-tertiary hover:text-text-primary hover:bg-white rounded-lg border border-transparent transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => onDelete(m.id, m.name)} className="p-2 text-text-tertiary hover:text-error hover:bg-error/5 rounded-lg border border-transparent transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-surface-warm/20 border border-dashed border-border-light rounded-3xl">
          <Info className="w-10 h-10 text-text-tertiary opacity-30" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-secondary">Double-tier Filter Required</p>
            <p className="text-xs text-text-tertiary">Select Category then Subcategory to view models.</p>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      <EditDrawer isOpen={!!editingModel} onClose={() => setEditingModel(null)} title="Edit Specification">
        <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-6">
          <Input label="Brand" {...editForm.register('brand')} error={editForm.formState.errors.brand?.message} />
          <Input label="Model Name" {...editForm.register('name')} error={editForm.formState.errors.name?.message} />
          <Input label="Model Code" {...editForm.register('code')} error={editForm.formState.errors.code?.message} className="uppercase" />
          <div className="pt-4 space-y-3">
            <Button isLoading={isPending} type="submit" className="w-full">Update SKU</Button>
            <Button variant="secondary" type="button" className="w-full" onClick={() => setEditingModel(null)}>Cancel</Button>
          </div>
        </form>
      </EditDrawer>
    </div>
  )
}
