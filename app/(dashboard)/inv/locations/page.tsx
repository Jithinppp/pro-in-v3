'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MapPin, Plus, ChevronRight, ChevronDown, Edit2, Trash2, Search, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'
import Link from 'next/link'

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationSchema>

function LocationNode({ 
  location, 
  allLocations, 
  onEdit, 
  onDelete, 
  onAddChild,
  searchQuery 
}: { 
  location: any, 
  allLocations: any[], 
  onEdit: (loc: any) => void, 
  onDelete: (id: string, name: string) => void,
  onAddChild: (parentId: string) => void,
  searchQuery: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const children = allLocations.filter(loc => loc.parent_id === location.id)
  const hasChildren = children.length > 0

  return (
    <div className="flex flex-col w-full">
      <div className="group flex items-center justify-between p-2 hover:bg-secondary/50 rounded-md transition-all border border-transparent hover:border-border">
        <div className="flex items-center gap-2 overflow-hidden">
          {hasChildren ? (
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-white rounded transition-colors"
            >
              {isOpen ? <ChevronDown className="size-3.5 text-charcoal" /> : <ChevronRight className="size-3.5 text-charcoal" />}
            </button>
          ) : (
            <div className="w-5" /> 
          )}
          
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-mid-gray" />
            <span className="text-sm font-medium text-charcoal truncate">{location.name}</span>
            {location.description && (
              <span className="text-[10px] text-mid-gray italic truncate opacity-60">({location.description})</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 transition-opacity">
          <button 
            onClick={() => onAddChild(location.id)} 
            className="p-1.5 text-mid-gray hover:text-charcoal hover:bg-white rounded transition-all"
            title="Add Sub-location"
          >
            <Plus className="size-3.5" />
          </button>
          <button 
            onClick={() => onEdit(location)} 
            className="p-1.5 text-mid-gray hover:text-charcoal hover:bg-white rounded transition-all"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button 
            onClick={() => onDelete(location.id, location.name)} 
            className="p-1.5 text-mid-gray hover:text-destructive hover:bg-destructive/5 rounded transition-all"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="ml-6 border-l border-border pl-4 mt-1 space-y-1">
          {children.map(child => (
            <LocationNode 
              key={child.id} 
              location={child} 
              allLocations={allLocations} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onAddChild={onAddChild}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function StorageLocationsPage() {
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  
  const [allLocations, setAllLocations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentParentId, setCurrentParentId] = useState<string | null>(null)

  const createForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
  })

  const editForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
  })

  const fetchLocations = async () => {
    const { data } = await supabase.from('storage_locations').select('*').order('name')
    setAllLocations(data || [])
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const onCreate = async (values: LocationFormValues) => {
    startTransition(async () => {
      const { error } = await supabase
        .from('storage_locations')
        .insert([{
          name: values.name.trim(),
          description: values.description?.trim(),
          parent_id: currentParentId
        }])

      if (error) {
        toast.error('Could not create location')
      } else {
        createForm.reset()
        setCurrentParentId(null)
        toast.success('Location Added')
        fetchLocations()
      }
    })
  }

  const onUpdate = async (values: LocationFormValues) => {
    if (!editingId) return
    startTransition(async () => {
      const { error } = await supabase
        .from('storage_locations')
        .update({
          name: values.name.trim(),
          description: values.description?.trim(),
        })
        .eq('id', editingId)

      if (error) {
        toast.error('Update failed')
      } else {
        setEditingId(null)
        toast.success('Location updated')
        fetchLocations()
      }
    })
  }

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Delete location "${name}"?`)) return
    
    startTransition(async () => {
      const { count: childCount } = await supabase
        .from('storage_locations')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', id)

      if (childCount && childCount > 0) {
        toast.error("Cannot delete location with child sub-locations")
        return
      }

      const { count: assetCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', id)

      if (assetCount && assetCount > 0) {
        toast.error("Cannot delete location with active inventory assigned")
        return
      }

      const { error } = await supabase.from('storage_locations').delete().eq('id', id)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Location removed')
        fetchLocations()
      }
    })
  }

  const startEditing = (loc: any) => {
    setEditingId(loc.id)
    editForm.reset({
      name: loc.name,
      description: loc.description || ''
    })
  }

  return (
    <PageContainer>
      <div className="mb-12">
        <Link 
          href="/inv" 
          className="inline-flex items-center text-xs font-semibold text-mid-gray hover:text-charcoal uppercase tracking-widest transition-colors mb-4 group"
        >
          <ChevronRight className="size-4 rotate-180 mr-1 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </Link>
        <PageHeader 
          label="Logistics"
          title="Storage Layout"
          subtitle="Design your warehouse topography and bin systems."
          className="!mb-0 !items-start !text-left"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Tree Navigator Section */}
        <div className="flex-[2] space-y-8">
          <div className="relative w-full">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
            <input 
              placeholder="Search locations..." 
              className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-charcoal/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="p-6 bg-white border border-border rounded-xl space-y-4">
            {allLocations.filter(loc => !loc.parent_id).length > 0 ? (
              <div className="space-y-2">
                {allLocations
                  .filter(loc => !loc.parent_id)
                  .map(loc => (
                    <LocationNode 
                      key={loc.id} 
                      location={loc} 
                      allLocations={allLocations} 
                      onEdit={startEditing} 
                      onDelete={onDelete} 
                      onAddChild={(id) => setCurrentParentId(id)}
                      searchQuery={searchQuery}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                <MapPin className="size-12 text-border" />
                <div className="space-y-2">
                  <p className="text-base font-display font-semibold text-charcoal">No Locations Found</p>
                  <p className="text-sm text-mid-gray font-light">Start by adding your first top-level warehouse zone.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Sidebar */}
        <aside className="lg:w-80 space-y-8">
          <div className="p-8 bg-white border border-border rounded-lg space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl font-display font-semibold flex items-center gap-3 text-charcoal">
                <Plus className="size-5" />
                {currentParentId ? 'Add Sub-Location' : 'Add Root Location'}
              </h2>
              <p className="text-xs text-mid-gray leading-relaxed font-light">
                {currentParentId 
                  ? `This location will be nested inside a selected zone.`
                  : 'Specify a new top-level facility or global warehouse boundary.'}
              </p>
            </div>

            {editingId ? (
              <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-mid-gray">Editing Location</label>
                  <Input label="Name / Label" placeholder="e.g. Rack A-1" {...editForm.register('name')} error={editForm.formState.errors.name?.message} />
                  <Input label="Description" placeholder="Optional notes..." {...editForm.register('description')} />
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full h-11">Save Changes</Button>
                  <Button variant="ghost" onClick={() => setEditingId(null)} className="w-full h-11">Cancel</Button>
                </div>
              </form>
            ) : (
              <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-6">
                <Input label="Name / Label" placeholder="e.g. Rack A-1" {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
                <Input label="Description" placeholder="Optional notes..." {...createForm.register('description')} />
                
                <Button isLoading={isPending} type="submit" className="w-full h-11">
                  Register Location
                </Button>
              </form>
            )}

            {currentParentId && (
              <Button 
                variant="ghost" 
                onClick={() => setCurrentParentId(null)} 
                className="w-full h-10 text-xs border border-dashed border-border"
              >
                Reset to Root Level
              </Button>
            )}

            <div className="pt-6 border-t border-border flex gap-4 text-mid-gray">
              <Info className="size-4 flex-shrink-0 mt-1" />
              <p className="text-[11px] leading-relaxed font-light">
                Logistics Tip: Use a "Parent &gt; Child" hierarchy for better organizational clarity.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  )
}
