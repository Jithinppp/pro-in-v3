import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: string // e.g., 'max-w-5xl', 'max-w-7xl'
}

export function PageContainer({ 
  children, 
  className = '', 
  maxWidth = 'max-w-[1200px]' 
}: PageContainerProps) {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 md:px-0 pb-24 animate-fade-up ${className}`}>
      {children}
    </div>
  )
}
