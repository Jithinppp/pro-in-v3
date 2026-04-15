import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

export interface QuickActionCardProps {
  title: string
  desc: string
  icon: LucideIcon
  href: string
}

export function QuickActionCard({ title, desc, icon: Icon, href }: QuickActionCardProps) {
  return (
    <Link 
      href={href} 
      className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-background border border-border-light rounded-2xl sm:rounded-3xl hover:border-border-focus transition-all hover:-translate-y-1 h-auto sm:h-52 text-center"
    >
      <div className="p-3 sm:p-4 rounded-2xl bg-surface-warm group-hover:bg-border-light transition-colors mb-3 sm:mb-4">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary" strokeWidth={1.5} />
      </div>
      <span className="text-[13px] sm:text-base font-semibold text-text-primary leading-tight px-1 line-clamp-2">
        {title}
      </span>
      <span className="hidden sm:block text-xs text-text-tertiary mt-2">
        {desc}
      </span>
    </Link>
  )
}
