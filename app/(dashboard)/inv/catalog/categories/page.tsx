'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus, Package, Edit2, Check, X, Trash2, ChevronLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const categorySchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').max(10),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function CategoriesPage() {
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const supabase = createClient()

  const createForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  })

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  })

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const startEditing = (cat: any) => {
    setEditingId(cat.id)
    editForm.reset({
      code: cat.code,
      name: cat.name,
      description: cat.description || '',
    })
  }

  const onCreate = async (values: CategoryFormValues) => {
    startTransition(async () => {
      const { error } = await supabase
        .from('categories')
        .insert([{
          code: values.code.toUpperCase().trim(),
          name: values.name.trim(),
          description: values.description?.trim()
        }])

      if (error) {
        toast.error('Could not create category. Code might already exist.')
      } else {
        createForm.reset()
        toast.success('Category created')
        fetchCategories()
      }
    })
  }

  const onUpdate = async (values: CategoryFormValues) => {
    if (!editingId) return
    startTransition(async () => {
      const { error } = await supabase
        .from('categories')
        .update({
          code: values.code.toUpperCase().trim(),
          name: values.name.trim(),
          description: values.description?.trim()
        })
        .eq('id', editingId)

      if (error) {
        toast.error('Update failed')
      } else {
        setEditingId(null)
        toast.success('Category updated')
        fetchCategories()
      }
    })
  }

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete category "${name}"?`)) return
    
    startTransition(async () => {
      // Deletion Guard: Check for children (subcategories)
      const { count } = await supabase
        .from('subcategories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id)

      if (count && count > 0) {
        toast.error("Cannot delete category item if it has children")
        return
      }

      const { error } = await supabase.from('categories').delete().eq('id', id)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Category deleted')
        fetchCategories()
      }
    })
  }

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
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary underline decoration-border-light decoration-4 underline-offset-8">Category Manager</h1>
          <p className="text-text-secondary text-sm">Define top-level gear taxonomy groups.</p>
        </div>
      </div>

      {/* Creation Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Register New Category
        </h2>
        
        <form onSubmit={createForm.handleSubmit(onCreate)} className="p-6 bg-white border border-border-light rounded-2xl space-y-4 shadow-none">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full md:w-32">
              <Input label="Code" placeholder="AUD" {...createForm.register('code')} error={createForm.formState.errors.code?.message} className="uppercase" />
            </div>
            <div className="flex-1 w-full">
              <Input label="Category Name" placeholder="e.g. Audio Equipment" {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <Input label="Description" placeholder="Optional notes..." {...createForm.register('description')} />
            </div>
            <Button isLoading={isPending} type="submit" size="lg" className="whitespace-nowrap font-bold">Add Category</Button>
          </div>
        </form>
      </section>

      {/* List Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
          <Package className="w-4 h-4" />
          Existing Categories
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                <th className="py-4 font-bold w-24">CODE</th>
                <th className="py-4 font-bold w-48">NAME</th>
                <th className="py-4 font-bold">DESCRIPTION</th>
                <th className="py-4 font-bold text-right w-32">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border-light/50 hover:bg-surface-warm/30 transition-colors group">
                  {editingId === cat.id ? (
                    <>
                      <td className="py-3 pr-2 font-bold"><input {...editForm.register('code')} className="w-full bg-surface-warm border border-border-light rounded px-2 py-1.5 uppercase outline-none focus:border-border-focus" /></td>
                      <td className="py-3 pr-2"><input {...editForm.register('name')} className="w-full bg-surface-warm border border-border-light rounded px-2 py-1.5 outline-none focus:border-border-focus" /></td>
                      <td className="py-3 pr-2"><input {...editForm.register('description')} className="w-full bg-surface-warm border border-border-light rounded px-2 py-1.5 outline-none focus:border-border-focus" /></td>
                      <td className="py-3 text-right flex items-center justify-end gap-1">
                        <button onClick={editForm.handleSubmit(onUpdate)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check className="w-5 h-5" /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-text-tertiary hover:bg-surface-warm rounded-lg"><X className="w-5 h-5" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-5 font-bold tracking-wider uppercase">{cat.code}</td>
                      <td className="py-5 font-medium">{cat.name}</td>
                      <td className="py-5 text-text-tertiary">{cat.description || '-'}</td>
                      <td className="py-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditing(cat)} className="p-2 text-text-tertiary hover:text-text-primary hover:bg-white rounded-lg border border-transparent hover:border-border-light transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => onDelete(cat.id, cat.name)} className="p-2 text-text-tertiary hover:text-error hover:bg-error/5 rounded-lg border border-transparent transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
