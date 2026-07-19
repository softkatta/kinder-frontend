import { useState } from 'react'
import { ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { AdminBtn } from '@/components/admin/AdminUi'
import { cn } from '@/utils/cn'

export type AttendanceFlow = 'staff_student' | 'student_branch'

const FLOW_OPTIONS: { value: AttendanceFlow; label: string }[] = [
  { value: 'staff_student', label: 'Flow 1 — Staff scans Student ID' },
  { value: 'student_branch', label: 'Flow 2 — Student scans Branch QR' },
]

interface AttendanceFlowFiltersProps {
  flow: AttendanceFlow
  onFlowChange: (flow: AttendanceFlow) => void
}

export function AttendanceFlowFilters({ flow, onFlowChange }: AttendanceFlowFiltersProps) {
  const [open, setOpen] = useState(false)

  const reset = () => onFlowChange('staff_student')

  return (
    <div className="attendance-panel-card overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 text-left hover:bg-slate-50/80"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Advanced Filters</h2>
            <p className="text-xs text-slate-500">Select attendance scanning flow</p>
          </div>
        </div>
        <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="p-5 space-y-4">
          <div>
            <label className="admin-field-label">Attendance Flow</label>
            <select
              className="admin-data-table-select mt-1.5 w-full max-w-md"
              value={flow}
              onChange={(e) => onFlowChange(e.target.value as AttendanceFlow)}
            >
              {FLOW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              {flow === 'staff_student'
                ? 'Staff scans student PVC ID at reception — auto check-in / check-out.'
                : 'Student scans school branch QR at entrance for self check-in.'}
            </p>
          </div>
          <div className="flex justify-end">
            <AdminBtn variant="secondary" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset Filters
            </AdminBtn>
          </div>
        </div>
      )}
    </div>
  )
}
