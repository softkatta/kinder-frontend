import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    return (
      <label htmlFor={fieldId} className={cn('form-check', className)}>
        <input ref={ref} id={fieldId} type="checkbox" className="form-check-input" {...props} />
        <span className="form-check-text">
          <span className="form-check-label">{label}</span>
          {description && <span className="form-check-desc">{description}</span>}
        </span>
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'
