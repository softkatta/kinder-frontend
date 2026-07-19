import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import type { AdminTableSelection } from '@/components/admin/AdminDataTable'

export function useTableBulkDelete<T extends { id: number }>(options: {
  deleteOne: (id: number) => Promise<void>
  onDone?: () => void
  confirmMany?: (ids: number[]) => string
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const selection: AdminTableSelection<T> = {
    selectedIds,
    onChange: (ids) => setSelectedIds(ids.map(Number)),
    getRowId: (row) => row.id,
  }

  const dropFromSelection = useCallback((id: number) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const bulkDelete = useCallback(async () => {
    if (!selectedIds.length) return
    const ids = [...selectedIds]
    const msg = options.confirmMany?.(ids)
      ?? `Delete ${ids.length} selected record(s)? This cannot be undone.`
    if (!confirm(msg)) return

    setBulkDeleting(true)
    const results = await Promise.allSettled(ids.map((id) => options.deleteOne(id)))
    const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[]
    const ok = ids.length - failed.length
    if (ok > 0) toast.success(`Deleted ${ok} record(s)`)
    if (failed.length > 0) {
      const firstMsg = (failed[0].reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(firstMsg || `${failed.length} delete(s) failed`)
    }
    setSelectedIds([])
    setBulkDeleting(false)
    options.onDone?.()
  }, [selectedIds, options])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  return { selection, bulkDelete, clearSelection, dropFromSelection, selectedIds, setSelectedIds, bulkDeleting }
}
