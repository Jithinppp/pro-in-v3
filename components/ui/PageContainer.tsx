import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: string
}

export function PageContainer({ 
  children, 
  className = '', 
  maxWidth = 'max-w-7xl' 
}: PageContainerProps) {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-6 md:px-8 pt-24 pb-32 ${className}`}>
      {children}
    </div>
  )
}

