import { useCallback, useEffect, useRef, useState } from 'react'
import { Select } from '@/components/ui/Select'
import { portalApi } from '@/api/services'

interface ChildOption {
  id: number
  name: string
  class: string
}

interface ParentChildSelectorProps {
  value: number | null
  onChange: (childId: number | null) => void
  className?: string
}

export function ParentChildSelector({ value, onChange, className = '' }: ParentChildSelectorProps) {
  const [children, setChildren] = useState<ChildOption[]>([])
  const autoSelected = useRef(false)

  const load = useCallback(async () => {
    try {
      const res = await portalApi.parentChildren()
      setChildren((res.data.data as ChildOption[]) ?? [])
    } catch {
      setChildren([])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!autoSelected.current && children.length === 1 && value === null) {
      autoSelected.current = true
      onChange(children[0].id)
    }
  }, [children, value, onChange])

  if (children.length <= 1) {
    return null
  }

  return (
    <div className={className}>
      <Select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        aria-label="Select child"
      >
        <option value="">Select child</option>
        {children.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.class})
          </option>
        ))}
      </Select>
    </div>
  )
}
