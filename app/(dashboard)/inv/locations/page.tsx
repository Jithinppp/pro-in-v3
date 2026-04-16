'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MapPin, Plus, ChevronRight, Edit2, Trash2, Home, ChevronLeft, Info, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/ui/PageHeader'
import Link from 'next/link'

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationSchema>

export default function StorageLocationsPage() {
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  
  const [allLocations, setAllLocations] = useState<any[]>([])
  const [currentPath, setCurrentPath] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const currentParentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null

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

  const drillDown = (loc: any) => {
    setCurrentPath([...currentPath, loc])
  }

  const goToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath([])
    } else {
      setCurrentPath(currentPath.slice(0, index + 1))
    }
  }

  const filteredLocations = allLocations.filter(loc => {
    const parentMatches = loc.parent_id === currentParentId
    const searchMatches = searchQuery ? loc.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    if (searchQuery) return searchMatches
    return parentMatches
  })

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
          <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
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
        
        {/* Navigator Section */}
        <div className="flex-[2] space-y-8">
          <div className="p-4 bg-secondary/30 border border-border rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 overflow-hidden">
              <button 
                onClick={() => goToBreadcrumb(-1)}
                className={`p-2 rounded-md hover:bg-white transition-all ${currentPath.length === 0 ? 'text-charcoal bg-white border border-border' : 'text-mid-gray'}`}
              >
                <Home className="size-4" />
              </button>
              {currentPath.map((loc, i) => (
                <div key={loc.id} className="flex items-center gap-1 flex-shrink-0">
                  <ChevronRight className="size-3 text-border" />
                  <button 
                    onClick={() => goToBreadcrumb(i)}
                    className={`text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded-md transition-all ${i === currentPath.length - 1 ? 'bg-white text-charcoal border border-border' : 'text-mid-gray hover:text-charcoal'}`}
                  >
                    {loc.name}
                  </button>
                </div>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
              <input 
                placeholder="Find a location..." 
                className="w-full bg-white border border-border rounded-md pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-charcoal/20 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => (
                <div 
                  key={loc.id}
                  className="group flex flex-col p-6 bg-white border border-border rounded-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-secondary rounded-md text-charcoal transition-all">
                      <MapPin className="size-5" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(loc)} className="p-2 text-mid-gray hover:text-charcoal hover:bg-secondary rounded-md transition-all"><Edit2 className="size-4" /></button>
                      <button onClick={() => onDelete(loc.id, loc.name)} className="p-2 text-mid-gray hover:text-destructive hover:bg-destructive/5 rounded-md transition-all"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                  
                  {editingId === loc.id ? (
                    <div className="space-y-4">
                      <input {...editForm.register('name')} className="w-full bg-white border border-border rounded px-3 py-2 text-sm font-semibold outline-none focus:ring-1 focus:ring-charcoal/20" />
                      <div className="flex gap-2">
                        <Button onClick={editForm.handleSubmit(onUpdate)} className="h-9 text-xs flex-1">Save</Button>
                        <Button variant="ghost" onClick={() => setEditingId(null)} className="h-9 text-xs flex-1">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="font-display font-semibold text-lg text-charcoal">{loc.name}</h3>
                      <p className="text-xs text-mid-gray font-light line-clamp-1 italic">{loc.description || 'No description provided'}</p>
                    </div>
                  )}

                  {!searchQuery && !editingId && (
                    <button 
                      onClick={() => drillDown(loc)}
                      className="mt-8 flex items-center text-[10px] font-bold text-mid-gray uppercase tracking-widest hover:text-charcoal transition-colors group/btn"
                    >
                      Explore Zone
                      <ChevronRight className="size-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white border border-dashed border-border rounded-lg">
                <MapPin className="size-12 text-border" />
                <div className="space-y-2">
                  <p className="text-base font-display font-semibold text-charcoal">Terminal Location</p>
                  <p className="text-sm text-mid-gray font-light">No nested sub-zones found at this level.</p>
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
                Add Room
              </h2>
              <p className="text-xs text-mid-gray leading-relaxed font-light">
                {currentParentId 
                  ? `This position will be nested inside "${currentPath[currentPath.length - 1].name}"`
                  : 'Specify a new top-level facility or global warehouse boundary.'}
              </p>
            </div>

            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-6">
              <Input label="Name / Label" placeholder="e.g. Rack A-1" {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
              <Input label="Description" placeholder="Optional notes..." {...createForm.register('description')} />
              
              <Button isLoading={isPending} type="submit" className="w-full h-11">
                Register Location
              </Button>
            </form>

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

