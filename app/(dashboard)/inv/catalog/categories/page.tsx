'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageContainer } from '@/components/ui/PageContainer'
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
    <PageContainer>
      <div className="mb-12">
        <Link 
          href="/inv/catalog" 
          className="inline-flex items-center text-xs font-semibold text-mid-gray hover:text-charcoal uppercase tracking-widest transition-colors mb-4 group"
        >
          <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>
        <PageHeader 
          label="Catalog Portal"
          title="Category Manager"
          subtitle="Define top-level gear taxonomy groups and codes."
          className="!mb-0 !items-start !text-left"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left Column: Register Form */}
        <section className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-mid-gray">
            <Plus className="size-4" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold">New Category</h2>
          </div>
          
          <form onSubmit={createForm.handleSubmit(onCreate)} className="p-8 bg-white rounded-lg border border-border space-y-6">
            <Input 
              label="Code" 
              placeholder="AUD" 
              {...createForm.register('code')} 
              error={createForm.formState.errors.code?.message} 
              className="uppercase font-display font-semibold" 
            />
            <Input 
              label="Category Name" 
              placeholder="e.g. Audio Equipment" 
              {...createForm.register('name')} 
              error={createForm.formState.errors.name?.message} 
            />
            <Input 
              label="Description" 
              placeholder="Optional notes..." 
              {...createForm.register('description')} 
            />
            <Button isLoading={isPending} type="submit" className="w-full">
              Add Category
            </Button>
          </form>
        </section>

        {/* Right Column: Existing List */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-mid-gray">
            <Package className="size-4" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Existing Taxonomy</h2>
          </div>
          
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-[10px] font-bold text-mid-gray uppercase tracking-widest">
                  <th className="px-6 py-4 w-24">CODE</th>
                  <th className="px-6 py-4 w-48">NAME</th>
                  <th className="px-6 py-4">DESCRIPTION</th>
                  <th className="px-6 py-4 text-right w-32">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                    {editingId === cat.id ? (
                      <>
                        <td className="px-6 py-3"><input {...editForm.register('code')} className="w-full bg-white border border-border rounded px-2 py-1.5 uppercase font-semibold outline-none focus:ring-1 focus:ring-link/50" /></td>
                        <td className="px-6 py-3"><input {...editForm.register('name')} className="w-full bg-white border border-border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-link/50" /></td>
                        <td className="px-6 py-3"><input {...editForm.register('description')} className="w-full bg-white border border-border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-link/50" /></td>
                        <td className="px-6 py-3 text-right flex items-center justify-end gap-1">
                          <button onClick={editForm.handleSubmit(onUpdate)} className="p-2 text-charcoal hover:bg-secondary rounded-md" title="Save"><Check className="size-5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-mid-gray hover:bg-secondary rounded-md" title="Cancel"><X className="size-5" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-5 font-display font-bold tracking-wider text-charcoal uppercase">{cat.code}</td>
                        <td className="px-6 py-5 font-semibold text-charcoal">{cat.name}</td>
                        <td className="px-6 py-5 text-mid-gray font-light italic">{cat.description || '-'}</td>
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(cat)} className="p-2 text-mid-gray hover:text-charcoal hover:bg-secondary rounded-md transition-all"><Edit2 className="size-4" /></button>
                            <button onClick={() => onDelete(cat.id, cat.name)} className="p-2 text-mid-gray hover:text-destructive hover:bg-destructive/5 rounded-md transition-all"><Trash2 className="size-4" /></button>
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
    </PageContainer>
  )
}
