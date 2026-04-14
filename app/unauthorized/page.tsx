'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-surface-warm flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-[#fef3f2] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-4xl font-semibold text-text-primary tracking-tight">Access Denied</h1>
        </div>
        
        <p className="text-text-secondary text-base">
          You do not have the required role permissions to access this specific dashboard.
        </p>
        
        <div className="pt-4">
          <Button onClick={() => router.push('/')} className="px-8">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}
