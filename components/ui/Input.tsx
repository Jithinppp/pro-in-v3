import { forwardRef, InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-placeholder">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={`
              w-full outline-none py-3 bg-surface-input border text-sm text-text-primary transition-all placeholder:text-text-placeholder rounded-lg
              focus:border-border-focus focus:ring-4 focus:ring-border-light
              ${icon ? 'pl-11 pr-4' : 'px-4'}
              ${error ? 'border-error' : 'border-border-light'}
              ${className}
            `}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-medium text-error mt-1.5">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
