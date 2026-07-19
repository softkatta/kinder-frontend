import { useMemo, useState } from 'react'

export type SortDir = 'asc' | 'desc'

export interface AdminTableFilterConfig<T> {
  key: string
  defaultValue?: string
  match: (row: T, value: string) => boolean
}

interface UseAdminTableOptions<T> {
  data: T[]
  pageSize?: number
  searchKeys?: (keyof T)[]
  searchFn?: (row: T, query: string) => boolean
  filters?: AdminTableFilterConfig<T>[]
  initialSort?: { key: string; dir: SortDir }
  getSortValue?: (row: T, key: string) => string | number
}

export function useAdminTable<T>({
  data,
  pageSize = 8,
  searchKeys = [],
  searchFn,
  filters = [],
  initialSort,
  getSortValue,
}: UseAdminTableOptions<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState(initialSort ?? { key: '', dir: 'asc' as SortDir })
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [f.key, f.defaultValue ?? 'all'])),
  )

  const setFilter = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return data.filter((row) => {
      if (q) {
        const matchesSearch = searchFn
          ? searchFn(row, q)
          : searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q))
        if (!matchesSearch) return false
      }

      return filters.every((filter) => {
        const value = filterValues[filter.key] ?? 'all'
        if (value === 'all') return true
        return filter.match(row, value)
      })
    })
  }, [data, search, searchKeys, searchFn, filters, filterValues])

  const sorted = useMemo(() => {
    if (!sort.key) return filtered

    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = getSortValue ? getSortValue(a, sort.key) : (a as Record<string, unknown>)[sort.key]
      const bv = getSortValue ? getSortValue(b, sort.key) : (b as Record<string, unknown>)[sort.key]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sort, getSortValue])

  const totalItems = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, safePage, pageSize])

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, totalItems)

  return {
    search,
    setSearch: handleSearch,
    filterValues,
    setFilter,
    page: safePage,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    from,
    to,
    rows: paginated,
    sort,
    toggleSort,
  }
}
