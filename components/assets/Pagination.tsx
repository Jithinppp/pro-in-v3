'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  totalCount: number
  pageSize: number
  currentPage: number
}

export function Pagination({ totalCount, pageSize, currentPage }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(pathname + '?' + params.toString())
  }

  const startRecord = (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalCount)
  const totalPages = Math.ceil(totalCount / pageSize)

  if (totalCount === 0) return null

  return (
    <div className="flex items-center justify-between py-6 border-t border-border-light mt-8 text-sm">
      <div className="text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{startRecord}</span> to <span className="font-semibold text-text-primary">{endRecord}</span> of <span className="font-semibold text-text-primary">{totalCount}</span> assets
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-warm rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <span className="font-medium text-text-primary">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-warm rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
