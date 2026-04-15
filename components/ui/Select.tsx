import { forwardRef, SelectHTMLAttributes } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider block">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={`
              w-full appearance-none outline-none py-3 px-4 bg-surface-input border text-sm text-text-primary transition-all rounded-lg cursor-pointer
              focus:border-border-focus focus:ring-4 focus:ring-border-light
              ${error ? 'border-error' : 'border-border-light'}
              ${className}
            `}
            ref={ref}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
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
        {error && <p className="text-[11px] font-medium text-error mt-1.5">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
