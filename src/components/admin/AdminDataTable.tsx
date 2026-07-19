import { type ReactNode, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2,
  RefreshCw, FileSpreadsheet, FileText, Printer, Columns3,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAdminTable, type AdminTableFilterConfig, type SortDir } from '@/hooks/useAdminTable'
import { AdminAdvancedFilters, type AdvancedFilterField } from '@/components/admin/AdminAdvancedFilters'
import { exportTableToCsv, printTableElement } from '@/utils/tableExport'

export interface AdminTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  className?: string
  headerClassName?: string
  exportValue?: (row: T) => string
  cell: (row: T, index: number) => ReactNode
}

export interface AdminTableFilterOption {
  key: string
  label: string
  icon?: AdvancedFilterField['icon']
  type?: 'select' | 'date'
  options: { value: string; label: string }[]
}

export interface AdminTableSelection<T> {
  selectedIds: Array<string | number>
  onChange: (ids: Array<string | number>) => void
  getRowId: (row: T) => string | number
}

interface AdminDataTableProps<T> {
  data: T[]
  columns: AdminTableColumn<T>[]
  rowKey: (row: T, index: number) => string | number
  searchKeys?: (keyof T)[]
  searchFn?: (row: T, query: string) => boolean
  searchPlaceholder?: string
  filters?: AdminTableFilterOption[]
  filterConfigs?: AdminTableFilterConfig<T>[]
  pageSize?: number
  title?: string
  subtitle?: string
  toolbarExtra?: ReactNode
  emptyMessage?: string
  filterSubtitle?: string
  exportFilename?: string
  onRefresh?: () => void
  showExportTools?: boolean
  hideTableHead?: boolean
  getSortValue?: (row: T, key: string) => string | number
  initialSort?: { key: string; dir: SortDir }
  selection?: AdminTableSelection<T>
  onBulkDelete?: () => void | Promise<void>
  bulkDeleting?: boolean
  bulkDeleteLabel?: string
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
  return dir === 'asc'
    ? <ArrowUp className="h-3.5 w-3.5 text-primary-600" />
    : <ArrowDown className="h-3.5 w-3.5 text-primary-600" />
}

export function AdminDataTable<T>({
  data,
  columns,
  rowKey,
  searchKeys,
  searchFn,
  searchPlaceholder = 'Search records...',
  filters = [],
  filterConfigs = [],
  pageSize = 8,
  title,
  subtitle,
  toolbarExtra,
  emptyMessage = 'No records found.',
  filterSubtitle,
  exportFilename,
  onRefresh,
  showExportTools = true,
  hideTableHead = true,
  getSortValue,
  initialSort,
  selection,
  onBulkDelete,
  bulkDeleting = false,
  bulkDeleteLabel,
}: AdminDataTableProps<T>) {
  const tableRef = useRef<HTMLDivElement>(null)
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])
  const [columnsOpen, setColumnsOpen] = useState(false)

  const table = useAdminTable({
    data,
    pageSize,
    searchKeys,
    searchFn,
    filters: filterConfigs,
    getSortValue,
    initialSort,
  })

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.includes(c.key)),
    [columns, hiddenColumns],
  )

  const pageRowIds = useMemo(
    () => (selection ? table.rows.map((row) => selection.getRowId(row)) : []),
    [selection, table.rows],
  )

  const allPageSelected = pageRowIds.length > 0 && pageRowIds.every((id) => selection?.selectedIds.includes(id))
  const somePageSelected = pageRowIds.some((id) => selection?.selectedIds.includes(id))

  const toggleRow = (id: string | number, checked: boolean) => {
    if (!selection) return
    if (checked) {
      if (!selection.selectedIds.includes(id)) {
        selection.onChange([...selection.selectedIds, id])
      }
    } else {
      selection.onChange(selection.selectedIds.filter((x) => x !== id))
    }
  }

  const togglePageAll = () => {
    if (!selection) return
    if (allPageSelected) {
      selection.onChange(selection.selectedIds.filter((id) => !pageRowIds.includes(id)))
    } else {
      selection.onChange([...new Set([...selection.selectedIds, ...pageRowIds])])
    }
  }

  const selectedCount = selection?.selectedIds.length ?? 0

  const advancedFields: AdvancedFilterField[] = filters.map((f) => ({
    key: f.key,
    label: f.label,
    icon: f.icon,
    type: f.type,
    options: f.options,
  }))

  const resetFilters = () => {
    filters.forEach((f) => table.setFilter(f.key, f.type === 'date' ? '' : 'all'))
  }

  const exportName = exportFilename ?? title?.toLowerCase().replace(/\s+/g, '-') ?? 'export'

  const handleExportCsv = () => {
    const headers = visibleColumns.map((c) => c.header)
    const rows = table.rows.map((row) =>
      visibleColumns.map((col) => {
        if (col.exportValue) return col.exportValue(row)
        const val = getSortValue ? getSortValue(row, col.key) : (row as Record<string, unknown>)[col.key]
        return String(val ?? '')
      }),
    )
    exportTableToCsv(exportName, headers, rows)
  }

  const handlePrint = () => {
    const el = tableRef.current?.querySelector('.admin-data-table-grid')
    printTableElement(el as HTMLElement | null, title ?? 'Table')
  }

  const toggleColumn = (key: string) => {
    setHiddenColumns((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key)
      if (visibleColumns.length <= 1) return prev
      return [...prev, key]
    })
  }

  return (
    <div className="admin-data-table-root" ref={tableRef}>
      {filters.length > 0 && (
        <AdminAdvancedFilters
          fields={advancedFields}
          values={table.filterValues}
          onChange={table.setFilter}
          onReset={resetFilters}
          subtitle={filterSubtitle}
          className="admin-data-table-advanced-filters--outside"
        />
      )}

      <div className="admin-data-table">
        {(title || subtitle) && !hideTableHead && (
          <div className="admin-data-table-head">
            <div>
              {title && <h3 className="admin-data-table-title">{title}</h3>}
              {subtitle && <p className="admin-data-table-subtitle">{subtitle}</p>}
            </div>
          </div>
        )}

        <div className="admin-data-table-toolbar">
          <div className="admin-data-table-search">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={table.search}
              onChange={(e) => table.setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="admin-data-table-search-input"
            />
          </div>

          <div className="admin-data-table-actions">
            {toolbarExtra}

            {selection && onBulkDelete && selectedCount > 0 && (
              <button
                type="button"
                className="admin-data-table-bulk-delete"
                onClick={() => void onBulkDelete()}
                disabled={bulkDeleting}
              >
                <Trash2 className="h-4 w-4" />
                {bulkDeleting ? 'Deleting...' : (bulkDeleteLabel ?? `Delete (${selectedCount})`)}
              </button>
            )}

            {showExportTools && (
              <>
                {onRefresh && (
                  <button type="button" className="admin-data-table-tool-btn" onClick={onRefresh} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden xl:inline">Refresh</span>
                  </button>
                )}
                <button type="button" className="admin-data-table-tool-btn" onClick={handleExportCsv} title="Export Excel">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="hidden xl:inline">Excel</span>
                </button>
                <button type="button" className="admin-data-table-tool-btn" onClick={handlePrint} title="Export PDF">
                  <FileText className="h-4 w-4" />
                  <span className="hidden xl:inline">PDF</span>
                </button>
                <button type="button" className="admin-data-table-tool-btn" onClick={handlePrint} title="Print">
                  <Printer className="h-4 w-4" />
                  <span className="hidden xl:inline">Print</span>
                </button>
                <div className="relative">
                  <button
                    type="button"
                    className="admin-data-table-tool-btn"
                    onClick={() => setColumnsOpen((v) => !v)}
                    title="Columns"
                  >
                    <Columns3 className="h-4 w-4" />
                    <span className="hidden xl:inline">Columns</span>
                  </button>
                  {columnsOpen && (
                    <>
                      <button type="button" className="fixed inset-0 z-10" onClick={() => setColumnsOpen(false)} aria-label="Close" />
                      <div className="admin-data-table-columns-menu">
                        <p className="admin-data-table-columns-title">Show columns</p>
                        {columns.map((col) => (
                          <label key={col.key} className="admin-data-table-columns-item">
                            <input
                              type="checkbox"
                              checked={!hiddenColumns.includes(col.key)}
                              onChange={() => toggleColumn(col.key)}
                            />
                            <span>{col.header}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="admin-data-table-wrap">
        <table className="admin-data-table-grid w-full">
          <thead>
            <tr>
              {selection && (
                <th className="admin-data-table-th admin-data-table-th--check">
                  <input
                    type="checkbox"
                    className="admin-data-table-checkbox"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected && !allPageSelected
                    }}
                    onChange={togglePageAll}
                    aria-label="Select all on page"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th key={col.key} className={cn('admin-data-table-th', col.headerClassName)}>
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => table.toggleSort(col.key)}
                      className="admin-data-table-sort-btn"
                    >
                      {col.header}
                      <SortIcon active={table.sort.key === col.key} dir={table.sort.dir} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selection ? 1 : 0)} className="admin-data-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.rows.map((row, i) => {
                const rowId = selection ? selection.getRowId(row) : rowKey(row, i)
                return (
                  <tr key={rowKey(row, i)} className="admin-data-table-row">
                    {selection && (
                      <td className="admin-data-table-td admin-data-table-td--check">
                        <input
                          type="checkbox"
                          className="admin-data-table-checkbox"
                          checked={selection.selectedIds.includes(rowId)}
                          onChange={(e) => toggleRow(rowId, e.target.checked)}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className={cn('admin-data-table-td', col.className)}>
                        {col.cell(row, i)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-data-table-footer">
        <p className="admin-data-table-count">
          Showing <strong>{table.totalItems === 0 ? 0 : table.to}</strong> of <strong>{table.totalItems}</strong>
        </p>

        <div className="admin-data-table-pagination">
          <button
            type="button"
            className="admin-data-table-page-btn"
            disabled={table.page <= 1}
            onClick={() => table.setPage(table.page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="admin-data-table-page-indicator">
            {table.page}/{table.totalPages}
          </span>
          <button
            type="button"
            className="admin-data-table-page-btn"
            disabled={table.page >= table.totalPages}
            onClick={() => table.setPage(table.page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
