'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Users, Plus, Edit2, Trash2, Search, Info, Globe, Phone, Mail, MapPin, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'
import Link from 'next/link'

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface Supplier extends SupplierFormValues {
  id: string;
  created_at: string;
}

export default function SuppliersPage() {
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const createForm = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema) as any,
  })

  const editForm = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema) as any,
  })

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('*').order('name')
    setSuppliers(data || [])
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const onCreate = async (values: SupplierFormValues) => {
    startTransition(async () => {
      const { error } = await supabase.from('suppliers').insert([values])

      if (error) {
        toast.error('Could not create supplier')
      } else {
        createForm.reset()
        toast.success('Supplier Added')
        fetchSuppliers()
      }
    })
  }

  const onUpdate = async (values: SupplierFormValues) => {
    if (!editingId) return
    startTransition(async () => {
      const { error } = await supabase
        .from('suppliers')
        .update(values)
        .eq('id', editingId)

      if (error) {
        toast.error('Update failed')
      } else {
        setEditingId(null)
        toast.success('Supplier updated')
        fetchSuppliers()
      }
    })
  }

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Delete supplier "${name}"?`)) return
    
    startTransition(async () => {
      const { count: assetCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', id)

      if (assetCount && assetCount > 0) {
        toast.error("Cannot delete supplier with linked assets")
        return
      }

      const { error } = await supabase.from('suppliers').delete().eq('id', id)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Supplier removed')
        fetchSuppliers()
      }
    })
  }

  const startEditing = (sup: Supplier) => {
    setEditingId(sup.id)
    editForm.reset({
      name: sup.name,
      contact_name: sup.contact_name || '',
      email: sup.email || '',
      phone: sup.phone || '',
      website: sup.website || '',
      address: sup.address || '',
      notes: sup.notes || '',
      rating: sup.rating,
    })
  }

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageContainer>
      <div className="mb-12">
        <Link 
          href="/inv" 
          className="inline-flex items-center text-xs font-semibold text-mid-gray hover:text-charcoal uppercase tracking-widest transition-colors mb-4 group"
        >
          <Plus className="size-4 rotate-180 mr-1 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </Link>
        <PageHeader 
          label="Procurement"
          title="Supplier Directory"
          subtitle="Manage vendor relationships, contact details, and performance ratings."
          className="!mb-0 !items-start !text-left"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        
        <div className="flex-[2] space-y-8">
          <div className="relative w-full">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
            <input 
              placeholder="Search suppliers by name, contact, or email..." 
              className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-charcoal/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map(sup => (
                <div key={sup.id} className="group flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-charcoal/30 transition-all">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-3 rounded-lg bg-secondary text-charcoal">
                      <Users className="size-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-semibold text-charcoal truncate">{sup.name}</span>
                        {sup.rating && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-charcoal/5 rounded text-[10px] font-bold text-charcoal">
                            <Star className="size-3 fill-charcoal" />
                            {sup.rating}/5
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mid-gray font-light">
                        {sup.contact_name && (
                          <span className="flex items-center gap-1 truncate">
                            <Users className="size-3" /> {sup.contact_name}
                          </span>
                        )}
                        {sup.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="size-3" /> {sup.email}
                          </span>
                        )}
                        {sup.phone && (
                          <span className="flex items-center gap-1 truncate">
                            <Phone className="size-3" /> {sup.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(sup)} 
                      className="p-2 text-mid-gray hover:text-charcoal hover:bg-white rounded-lg transition-all"
                      title="Edit Supplier"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(sup.id, sup.name)} 
                      className="p-2 text-mid-gray hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                      title="Delete Supplier"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                <Users className="size-12 text-border" />
                <div className="space-y-2">
                  <p className="text-base font-display font-semibold text-charcoal">No Suppliers Found</p>
                  <p className="text-sm text-mid-gray font-light">Your vendor directory is currently empty.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:w-96 space-y-8">
          <div className="p-8 bg-white border border-border rounded-lg space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl font-display font-semibold flex items-center gap-3 text-charcoal">
                <Plus className="size-5" />
                {editingId ? 'Update Supplier' : 'Add New Supplier'}
              </h2>
              <p className="text-xs text-mid-gray leading-relaxed font-light">
                {editingId 
                  ? 'Modify the vendor details to keep your procurement records current.'
                  : 'Register a new vendor to link them to your asset procurement flow.'}
              </p>
            </div>

            <form 
              onSubmit={editingId ? editForm.handleSubmit(onUpdate) : createForm.handleSubmit(onCreate)} 
              className="space-y-5"
            >
              <div className="space-y-4">
                <Input 
                  label="Company Name" 
                  placeholder="e.g. Global AV Solutions" 
                  {...(editingId ? editForm.register('name') : createForm.register('name'))} 
                  error={editingId ? editForm.formState.errors.name?.message : createForm.formState.errors.name?.message} 
                />
                <Input 
                  label="Contact Person" 
                  placeholder="e.g. Jane Doe" 
                  {...(editingId ? editForm.register('contact_name') : createForm.register('contact_name'))} 
                />
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="contact@supplier.com" 
                  {...(editingId ? editForm.register('email') : createForm.register('email'))} 
                  error={editingId ? editForm.formState.errors.email?.message : createForm.formState.errors.email?.message} 
                />
                <Input 
                  label="Phone Number" 
                  placeholder="+1 (555) 000-0000" 
                  {...(editingId ? editForm.register('phone') : createForm.register('phone'))} 
                />
                <Input 
                  label="Website" 
                  placeholder="https://supplier.com" 
                  {...(editingId ? editForm.register('website') : createForm.register('website'))} 
                  error={editingId ? editForm.formState.errors.website?.message : createForm.formState.errors.website?.message} 
                />
                <Input 
                  label="Address" 
                  placeholder="Full company address" 
                  {...(editingId ? editForm.register('address') : createForm.register('address'))} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Rating (1-5)" 
                    type="number" 
                    placeholder="5" 
                    {...(editingId ? editForm.register('rating') : createForm.register('rating'))} 
                  />
                  <div className="flex items-end pb-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-mid-gray uppercase tracking-widest">
                      <Star className="size-3 fill-current" /> Performance
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mid-gray">Internal Notes</label>
                  <textarea 
                    className="w-full bg-white border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-charcoal/20 outline-none transition-all min-h-[100px] resize-none"
                    placeholder="Vendor specifics, payment terms, etc..."
                    {...(editingId ? editForm.register('notes') : createForm.register('notes'))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button isLoading={isPending} type="submit" className="w-full h-11">
                  {editingId ? 'Save Changes' : 'Register Supplier'}
                </Button>
                {editingId && (
                  <Button variant="ghost" onClick={() => setEditingId(null)} className="w-full h-11">
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            <div className="pt-6 border-t border-border flex gap-4 text-mid-gray">
              <Info className="size-4 flex-shrink-0 mt-1" />
              <p className="text-[11px] leading-relaxed font-light">
                Suppliers can be linked to assets during the addition process to track procurement sources.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}
