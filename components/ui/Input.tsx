import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[11px] font-bold text-mid-gray uppercase tracking-widest block ml-0.5">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid-gray transition-colors group-focus-within:text-charcoal">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full h-10 px-4 py-2 bg-white border border-border text-sm text-charcoal transition-all rounded-md placeholder:text-mid-gray outline-none",
              "focus:border-charcoal/20 focus:ring-4 focus:ring-charcoal/5",
              icon && "pl-10",
              error && "border-destructive text-destructive focus:ring-destructive/5",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-semibold text-destructive mt-1 ml-0.5">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }

