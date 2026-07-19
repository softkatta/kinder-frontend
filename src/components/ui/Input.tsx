import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  requiredMark?: boolean
  leadingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, requiredMark, leadingIcon, id, ...props }, ref) => {
    const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const field = (
      <div className={cn('form-control', leadingIcon && 'form-control--icon')}>
        {leadingIcon && <span className="form-control-icon">{leadingIcon}</span>}
        <input
          ref={ref}
          id={fieldId}
          className={cn('input', leadingIcon && 'input--with-icon', error && 'input--error', className)}
          aria-invalid={error ? true : undefined}
          {...props}
        />
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
Input.displayName = 'Input'
