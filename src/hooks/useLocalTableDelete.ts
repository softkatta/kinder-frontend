import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import type { AdminTableSelection } from '@/components/admin/AdminDataTable'

export function useLocalTableDelete<T>(
  initialData: T[],
  options?: {
    labelOf?: (row: T) => string
    getRowId?: (row: T) => string | number
  },
) {
  const getRowId = options?.getRowId ?? ((row: T) => (row as { id: number }).id)

  const [rows, setRows] = useState(initialData)
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const selection: AdminTableSelection<T> = {
    selectedIds,
    onChange: setSelectedIds,
    getRowId,
  }

  const remove = useCallback(async (row: T) => {
    const label = options?.labelOf?.(row) ?? `record`
    const id = getRowId(row)
    if (!confirm(`Delete ${label}?`)) return
    setRows((prev) => prev.filter((r) => getRowId(r) !== id))
    setSelectedIds((prev) => prev.filter((x) => x !== id))
    toast.success('Deleted')
  }, [getRowId, options])

  const bulkDelete = useCallback(async () => {
    if (!selectedIds.length) return
    if (!confirm(`Delete ${selectedIds.length} selected record(s)?`)) return
    setBulkDeleting(true)
    const idSet = new Set(selectedIds)
    setRows((prev) => prev.filter((r) => !idSet.has(getRowId(r))))
    setSelectedIds([])
    setBulkDeleting(false)
    toast.success(`Deleted ${idSet.size} record(s)`)
  }, [getRowId, selectedIds])

  return { rows, setRows, selection, remove, bulkDelete, bulkDeleting, selectedIds }
}
