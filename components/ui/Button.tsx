import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, isLoading, disabled, variant = 'primary', size = 'md', ...props }, ref) => {
    
    const variants = {
      primary: 'bg-action-primary text-white hover:bg-action-hover border-transparent',
      secondary: 'bg-white text-text-primary border-border-light hover:bg-surface-warm',
      outline: 'bg-transparent text-text-primary border-border-light hover:border-border-focus'
    }

    const sizes = {
      sm: 'py-2 px-3 text-xs rounded-md',
      md: 'py-3.5 px-6 text-sm rounded-lg',
      lg: 'py-4 px-8 text-base rounded-lg',
      xl: 'py-6 px-10 text-base font-bold rounded-2xl shadow-xl shadow-text-primary/10 hover:shadow-text-primary/20'
    }

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`
          inline-flex cursor-pointer items-center justify-center transition-all duration-200 border
          active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
