import { CMS_META_FIELDS, type CmsFieldDef } from '@/config/cmsFieldConfig'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormStack } from '@/components/ui/Form'

interface CmsMetaFieldsProps {
  type: string
  meta: Record<string, string | boolean>
  onChange: (key: string, value: string | boolean) => void
}

function FieldInput({ field, value, onChange, labelSuffix }: {
  field: CmsFieldDef
  value: string | boolean
  onChange: (v: string | boolean) => void
  labelSuffix?: string
}) {
  const label = labelSuffix ? `${field.label} (${labelSuffix})` : field.label

  if (field.type === 'checkbox') {
    return (
      <Checkbox
        label={label}
        checked={value === true || value === 'true'}
        onChange={(e) => onChange(e.target.checked)}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <Select
        label={label}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        hint={field.hint}
      >
        <option value="">— Select —</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
    )
  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        label={label}
        placeholder={field.placeholder}
        rows={4}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        hint={field.hint}
      />
    )
  }

  return (
    <Input
      label={label}
      type={field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
      placeholder={field.placeholder}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      hint={field.hint}
    />
  )
}

export function CmsMetaFields({ type, meta, onChange }: CmsMetaFieldsProps) {
  const fields = CMS_META_FIELDS[type] ?? []
  if (fields.length === 0) return null

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-3">
        Extra fields (shown on public website)
      </p>
      <FormStack>
        {fields.map((field) => {
          if (field.type === 'text' || field.type === 'textarea') {
            return (
              <div key={field.key} className="grid gap-3 md:grid-cols-2">
                <FieldInput
                  field={field}
                  labelSuffix="English"
                  value={meta[field.key] ?? ''}
                  onChange={(v) => onChange(field.key, v)}
                />
                <FieldInput
                  field={field}
                  labelSuffix="मराठी"
                  value={meta[`${field.key}_mr`] ?? ''}
                  onChange={(v) => onChange(`${field.key}_mr`, v)}
                />
              </div>
            )
          }

          return (
            <FieldInput
              key={field.key}
              field={field}
              value={meta[field.key] ?? ''}
              onChange={(v) => onChange(field.key, v)}
            />
          )
        })}
      </FormStack>
    </div>
  )
}
