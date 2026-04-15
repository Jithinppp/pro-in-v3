import { ReactNode } from 'react'

interface PageHeaderProps {
  label: string
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ 
  label, 
  title, 
  subtitle, 
  actions, 
  className = '' 
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 ${className}`}>
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 bg-white border border-border-light rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-widest shadow-sm">
          {label}
        </div>
        <div className="space-y-1.5">
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary text-base font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}
