import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuickActionCardProps {
  title: string
  desc: string
  icon: LucideIcon
  href: string
  className?: string
}

export function QuickActionCard({ title, desc, icon: Icon, href, className }: QuickActionCardProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "group flex flex-col items-start p-6 bg-white border border-border rounded-lg transition-all hover:border-charcoal/10",
        "h-auto text-left space-y-4",
        className
      )}
    >
      <div className="p-3 rounded-md bg-secondary text-charcoal transition-all">
        <Icon className="size-6" strokeWidth={2} />
      </div>
      <div className="space-y-1.5">
        <span className="text-sm font-display font-semibold text-charcoal leading-tight block">
          {title}
        </span>
        <span className="text-[11px] text-mid-gray leading-relaxed font-light block">
          {desc}
        </span>
      </div>
    </Link>
  )
}

