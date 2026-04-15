'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition, useState, useEffect } from 'react'
import { Search } from 'lucide-react'

export function AssetSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const currentQ = searchParams.get('q') || ''
        if (searchTerm !== currentQ) {
          const params = new URLSearchParams(searchParams.toString())
          if (searchTerm) {
            params.set('q', searchTerm)
          } else {
            params.delete('q')
          }
          params.delete('page')
          router.push(pathname + '?' + params.toString())
        }
      })
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, pathname, router, searchParams])

  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-placeholder">
        <Search className="w-4 h-4" strokeWidth={2} />
      </div>
      <input
        type="text"
        placeholder="Search by SKU, asset name, or serial number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-light rounded-xl text-sm text-text-primary outline-none focus:border-border-focus focus:ring-4 focus:ring-surface-input transition-all placeholder:text-text-placeholder"
      />
    </div>
  )
}
