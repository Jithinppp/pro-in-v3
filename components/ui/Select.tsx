import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[11px] font-bold text-mid-gray uppercase tracking-widest block ml-0.5">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            className={cn(
              "w-full h-10 px-4 py-2 bg-white border border-border text-sm text-charcoal transition-all rounded-md appearance-none cursor-pointer outline-none",
              "focus:border-charcoal/20 focus:ring-4 focus:ring-charcoal/5",
              error && "border-destructive text-destructive focus:ring-destructive/5",
              className
            )}
            ref={ref}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23898989' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: '36px'
            }}
            {...props}
          >
            <option value="" disabled>Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-[11px] font-semibold text-destructive mt-1 ml-0.5">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }

