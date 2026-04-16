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
    <div className={`flex flex-col items-center text-center space-y-6 mb-20 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-charcoal">
            {title}
          </h1>
          {subtitle && (
            <p className="text-mid-gray text-lg font-light max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-4 pt-2">
          {actions}
        </div>
      )}
    </div>
  )
}

