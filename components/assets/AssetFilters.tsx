'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { ListFilter, ChevronDown, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface AssetFiltersProps {
  categories: { id: string, name: string }[]
  subcategories: { id: string, name: string }[]
  models: { id: string, name: string }[]
  locations: { id: string, name: string }[]
}

const STATUSES = ['AVAILABLE', 'RESERVED', 'OUT', 'PENDING_QC', 'MAINTENANCE']
const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN']

export function AssetFilters({ categories, subcategories, models, locations }: AssetFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Open filters by default if any filter is active
    if (searchParams.toString()) {
      setIsOpen(true)
    }
  }, [searchParams])

  const handleFilterChange = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'ALL' || !value) {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      params.delete('page')
      router.push(pathname + '?' + params.toString())
    },
    [searchParams, pathname, router]
  )

  const Select = ({ label, name, options, valueKey = 'id', labelKey = 'name', currentValue }: any) => {
    const getPluralLabel = (label: string) => {
      switch (label) {
        case 'Category': return 'Categories';
        case 'Subcategory': return 'Subcategories';
        case 'Status': return 'Status';
        case 'Condition': return 'Conditions';
        case 'Model': return 'Models';
        case 'Location': return 'Locations';
        default: return `${label}s`;
      }
    };

    return (
      <div className="space-y-1.5 flex-1 min-w-[160px]">
        <label className="text-[11px] font-bold text-mid-gray uppercase tracking-widest block ml-0.5">
          {label}
        </label>
        <div className="relative group">
          <select
            value={currentValue || 'ALL'}
            onChange={(e) => handleFilterChange(name, e.target.value)}
            className={cn(
              "w-full appearance-none h-10 px-4 pr-10 bg-white border border-border rounded-md text-sm text-charcoal outline-none transition-all",
              "focus:border-charcoal/20 focus:ring-4 focus:ring-charcoal/5 cursor-pointer font-sans"
            )}
          >
            <option value="ALL">All {getPluralLabel(label)}</option>
            {options.map((opt: any) => (
              <option key={opt[valueKey] || opt} value={opt[valueKey] || opt}>
                {opt[labelKey] || opt}
              </option>
            ))}
          </select>
          <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-mid-gray pointer-events-none group-focus-within:text-charcoal transition-colors" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-mid-gray">
          <ListFilter className="size-4" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Refine Catalog</span>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-mid-gray hover:text-charcoal transition-colors flex items-center gap-2"
        >
          <Filter className="size-3" />
          {isOpen ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      {isOpen && (
        <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
          <Select label="Category" name="category" options={categories} currentValue={searchParams.get('category')} />
          <Select label="Subcategory" name="subcategory" options={subcategories} currentValue={searchParams.get('subcategory')} />
          <Select label="Model" name="model" options={models} currentValue={searchParams.get('model')} />
          <Select label="Location" name="location" options={locations} currentValue={searchParams.get('location')} />
          <Select label="Status" name="status" options={STATUSES.map(s => ({ id: s, name: s }))} currentValue={searchParams.get('status')} />
          <Select label="Condition" name="condition" options={CONDITIONS.map(s => ({ id: s, name: s }))} currentValue={searchParams.get('condition')} />
        </div>
      )}
    </div>
  )
}

