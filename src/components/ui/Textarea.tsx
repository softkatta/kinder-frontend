import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
  requiredMark?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, requiredMark, id, rows = 4, ...props }, ref) => {
    const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const field = (
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={cn('textarea', error && 'input--error', className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
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
Textarea.displayName = 'Textarea'
