'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationNodeProps {
  location: any
  allLocations: any[]
  onSelect: (id: string) => void
  selectedId?: string
}

function LocationNode({ location, allLocations, onSelect, selectedId }: LocationNodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const children = allLocations.filter(loc => loc.parent_id === location.id)
  const hasChildren = children.length > 0
  const isSelected = selectedId === location.id

  return (
    <div className="flex flex-col w-full">
      <div 
        onClick={() => onSelect(location.id)}
        className={cn(
          "group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all",
          isSelected ? "bg-charcoal text-white" : "hover:bg-secondary/50 text-charcoal"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {hasChildren ? (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
              className={cn(
                "p-1 rounded transition-colors",
                isSelected ? "hover:bg-white/20" : "hover:bg-white"
              )}
            >
              {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className={cn("size-3.5", isSelected ? "text-white/70" : "text-mid-gray")} />
            <span className="text-sm font-medium truncate">{location.name}</span>
          </div>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="ml-6 border-l border-border pl-4 mt-1 space-y-1">
          {children.map(child => (
            <LocationNode 
              key={child.id} 
              location={child} 
              allLocations={allLocations} 
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function LocationPicker({ 
  value, 
  onChange, 
  placeholder = "Select a location..." 
}: { 
  value?: string, 
  onChange: (id: string) => void, 
  placeholder?: string 
}) {
  const [allLocations, setAllLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase.from('storage_locations').select('*').order('name')
      setAllLocations(data || [])
      setIsLoading(false)
    }
    fetchLocations()
  }, [])

  if (isLoading) {
    return <div className="p-4 text-center text-xs text-mid-gray animate-pulse">Loading warehouse map...</div>
  }

  return (
    <div className="w-full max-h-80 overflow-y-auto p-2 bg-white border border-border rounded-lg">
      {allLocations.filter(loc => !loc.parent_id).length > 0 ? (
        <div className="space-y-1">
          {allLocations
            .filter(loc => !loc.parent_id)
            .map(loc => (
              <LocationNode 
                key={loc.id} 
                location={loc} 
                allLocations={allLocations} 
                onSelect={onChange}
                selectedId={value}
              />
            ))
          }
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-mid-gray">No locations configured.</div>
      )}
    </div>
  )
}
