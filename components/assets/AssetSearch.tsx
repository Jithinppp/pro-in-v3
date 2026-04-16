'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    }, 400)

    return () => clearTimeout(timer)
  }, [searchTerm, pathname, router, searchParams])

  return (
    <div className="relative w-full group">
      <div className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 text-mid-gray transition-colors",
        "group-focus-within:text-charcoal"
      )}>
        <Search className="size-4" strokeWidth={2.5} />
      </div>
      <input
        type="text"
        placeholder="Find assets by SKU, name, or serial..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={cn(
          "w-full pl-11 pr-4 py-3 bg-white border border-border rounded-md text-sm text-charcoal outline-none transition-all",
          "focus:border-charcoal/20 focus:ring-4 focus:ring-charcoal/5",
          "placeholder:text-mid-gray font-sans"
        )}
      />
    </div>
  )
}

