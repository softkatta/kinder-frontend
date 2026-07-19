import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  requiredMark?: boolean
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, requiredMark, id, children, ...props }, ref) => {
    const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const field = (
      <div className="form-control form-control--select">
        <select
          ref={ref}
          id={fieldId}
          className={cn('select', error && 'input--error', className)}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {children}
        </select>
      </div>
    )

    if (!label && !hint && !error) return field

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={fieldId} className="form-label">
            {label}
            {requiredMark && <span className="form-required">*</span>}
          </label>
        )}
        {field}
        {hint && !error && <p className="form-hint">{hint}</p>}
        {error && <p className="form-error">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
