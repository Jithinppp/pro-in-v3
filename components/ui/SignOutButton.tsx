'use client'

import { useFormStatus } from 'react-dom'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        flex items-center gap-1.5 text-[13px] font-medium 
        transition-colors cursor-pointer
        ${pending ? 'text-text-tertiary/50 cursor-wait' : 'text-text-tertiary hover:text-text-primary'}
      `}
      title="Sign Out"
    >
      <span>{pending ? 'Signing out...' : 'Sign Out'}</span>
      <LogOut className="w-3.5 h-3.5" />
    </button>
  )
}
