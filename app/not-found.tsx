'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-surface-warm flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-border-focus tracking-tighter">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Missing Asset Found!</h2>
        </div>
        
        <p className="text-text-secondary text-base">
          Whoops. The page or item you are looking for has been misplaced in the warehouse (or doesn't exist).
        </p>
        
        <div className="pt-4">
          <Button onClick={() => router.push('/')} className="px-8">
            Return to Safety
          </Button>
        </div>
      </div>
    </div>
  )
}
