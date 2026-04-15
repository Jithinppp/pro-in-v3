'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { ListFilter } from 'lucide-react'

// This would normally be fetched from DB, but for MVP we take them as props
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

  const handleFilterChange = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'ALL' || !value) {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      params.delete('page') // Reset page
      router.push(pathname + '?' + params.toString())
    },
    [searchParams, pathname, router]
  )

  const Select = ({ label, name, options, valueKey = 'id', labelKey = 'name', currentValue }: any) => (
    <div className="space-y-1.5 flex-1 min-w-[150px]">
      <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">
        {label}
      </label>
      <select
        value={currentValue || 'ALL'}
        onChange={(e) => handleFilterChange(name, e.target.value)}
        className="w-full appearance-none py-2 px-3 bg-background border border-border-light rounded-lg text-sm text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-surface-input transition-all cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px'
        }}
      >
        <option value="ALL">All {label}s</option>
        {options.map((opt: any) => (
          <option key={opt[valueKey] || opt} value={opt[valueKey] || opt}>
            {opt[labelKey] || opt}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-text-secondary">
        <ListFilter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters</span>
      </div>
      <div className="flex flex-wrap gap-4">
        <Select label="Category" name="category" options={categories} currentValue={searchParams.get('category')} />
        <Select label="Subcategory" name="subcategory" options={subcategories} currentValue={searchParams.get('subcategory')} />
        <Select label="Model" name="model" options={models} currentValue={searchParams.get('model')} />
        <Select label="Location" name="location" options={locations} currentValue={searchParams.get('location')} />
        <Select label="Status" name="status" options={STATUSES.map(s => ({ id: s, name: s }))} currentValue={searchParams.get('status')} />
        <Select label="Condition" name="condition" options={CONDITIONS.map(s => ({ id: s, name: s }))} currentValue={searchParams.get('condition')} />
      </div>
    </div>
  )
}
