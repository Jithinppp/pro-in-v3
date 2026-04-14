import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, isLoading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`
          inline-flex cursor-pointer items-center justify-center py-3.5 px-4 bg-action-primary text-white rounded-lg font-medium text-sm
          hover:bg-action-hover active:scale-[0.98] transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {isLoading ? 'Processing...' : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
