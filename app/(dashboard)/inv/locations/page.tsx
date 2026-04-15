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

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationSchema>

export default function StorageLocationsPage() {
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  
  const [allLocations, setAllLocations] = useState<any[]>([])
  const [currentPath, setCurrentPath] = useState<any[]>([]) // Breadcrumbs
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
      // 1. Check for child locations
      const { count: childCount } = await supabase
        .from('storage_locations')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', id)

      if (childCount && childCount > 0) {
        toast.error("Cannot delete location with child sub-locations")
        return
      }

      // 2. Check for assets
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

  // Filtering
  const filteredLocations = allLocations.filter(loc => {
    const parentMatches = loc.parent_id === currentParentId
    const searchMatches = searchQuery ? loc.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    
    // If searching, ignore hierarchy and show all matches
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
      <PageHeader 
        label="Logistics"
        title="Storage Layout"
        subtitle="Design your warehouse topography and bin systems."
        actions={
          <Link 
            href="/inv" 
            className="inline-flex items-center text-xs font-bold text-text-tertiary hover:text-action-primary uppercase tracking-widest transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>
        }
      />

      <div className="space-y-12">

      {/* Topography Navigator */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left: Navigator List */}
        <div className="flex-[2] space-y-6">
          <div className="p-4 bg-surface-warm border border-border-light rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <button 
                onClick={() => goToBreadcrumb(-1)}
                className={`p-2 rounded-lg hover:bg-white transition-colors ${currentPath.length === 0 ? 'text-action-primary font-bold' : 'text-text-tertiary'}`}
              >
                <Home className="w-4 h-4" />
              </button>
              {currentPath.map((loc, i) => (
                <div key={loc.id} className="flex items-center gap-2 flex-shrink-0">
                  <ChevronRight className="w-3 h-3 text-text-tertiary" />
                  <button 
                    onClick={() => goToBreadcrumb(i)}
                    className={`text-xs font-bold whitespace-nowrap px-2 py-1 rounded-md transition-all ${i === currentPath.length - 1 ? 'bg-white text-text-primary border border-border-light shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                  >
                    {loc.name}
                  </button>
                </div>
              ))}
            </div>
            <div className="relative w-full md:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                placeholder="Search..." 
                className="w-full bg-white border border-border-light rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-action-primary outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => (
                <div 
                  key={loc.id}
                  className="group flex flex-col p-5 bg-white border border-border-light rounded-2xl hover:border-action-primary transition-all hover:bg-surface-warm/30 shadow-none cursor-default"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-surface-warm rounded-xl text-text-secondary group-hover:text-action-primary group-hover:bg-white border border-transparent group-hover:border-border-light transition-all">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(loc)} className="p-2 text-text-tertiary hover:text-text-primary rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(loc.id, loc.name)} className="p-2 text-text-tertiary hover:text-error rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  {editingId === loc.id ? (
                    <div className="space-y-3">
                      <input {...editForm.register('name')} className="w-full bg-surface-warm border border-border-light rounded px-2 py-1.5 text-sm outline-none focus:border-border-focus" />
                      <div className="flex gap-2">
                        <Button onClick={editForm.handleSubmit(onUpdate)} className="h-8 text-[10px] flex-1">Save</Button>
                        <Button variant="secondary" onClick={() => setEditingId(null)} className="h-8 text-[10px] flex-1">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h3 className="font-bold text-text-primary group-hover:text-action-primary transition-colors">{loc.name}</h3>
                      <p className="text-xs text-text-tertiary line-clamp-1">{loc.description || 'No description'}</p>
                    </div>
                  )}

                  {!searchQuery && !editingId && (
                    <button 
                      onClick={() => drillDown(loc)}
                      className="mt-6 flex items-center text-[10px] font-bold text-text-tertiary uppercase tracking-widest hover:text-action-primary transition-colors"
                    >
                      Explore Zone
                      <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 bg-surface-warm/20 border border-dashed border-border-light rounded-3xl animate-pulse">
                <MapPin className="w-10 h-10 text-text-tertiary opacity-30" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-secondary">No Locations Found</p>
                  <p className="text-xs text-text-tertiary">Start building your warehouse map.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Add New Location */}
        <div className="flex-1 space-y-6">
          <div className="p-8 bg-white border border-border-light rounded-3xl space-y-6 shadow-none">
            <div className="space-y-1">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-action-primary" />
                Register Room/Bin
              </h2>
              <p className="text-xs text-text-tertiary">
                {currentParentId 
                  ? `This position will be nested inside ${currentPath[currentPath.length - 1].name}`
                  : 'This will be a top-level warehouse or room.'}
              </p>
            </div>

            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              <Input label="Placement Name" placeholder="e.g. Rack A-1 or Bin 102" {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
              <Input label="Notes" placeholder="e.g. Locked cabinet, sensitive gear..." {...createForm.register('description')} />
              
              <div className="pt-2">
                <Button isLoading={isPending} type="submit" className="w-full font-bold">Register Location</Button>
              </div>
            </form>

            <div className="pt-4 border-t border-border-light flex gap-3 text-text-tertiary">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                Use hierarchical naming for best results. Top-level should be Rooms/Warehouses, inner-levels should be Shelves or Bins.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  )
}
