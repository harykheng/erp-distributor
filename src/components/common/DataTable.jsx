import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, Inbox } from 'lucide-react'

export default function DataTable({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Cari...',
  searchKeys = [],
  pageSize = 10,
  emptyLabel = 'Belum ada data',
  toolbarRight = null,
  rowKey = (row) => row.id,
  onRowClick = null,
}) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = data
    if (query && searchKeys.length) {
      const q = query.toLowerCase()
      rows = rows.filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)))
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }
    return rows
  }, [data, query, sortKey, sortDir, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  return (
    <div className="rounded-2xl border border-base-800 bg-base-900 shadow-card overflow-hidden">
      {(searchable || toolbarRight) && (
        <div className="flex items-center justify-between gap-3 p-4 border-b border-base-800">
          {searchable && (
            <div className="relative w-full max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-base-850 border border-base-700 rounded-lg pl-9 pr-3 py-2 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-1 focus:ring-brand/60 focus:border-brand/60"
              />
            </div>
          )}
          {toolbarRight}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={`text-left px-4 py-3 text-xs font-semibold text-base-400 uppercase tracking-wide whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:text-base-200 select-none' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-base-500">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox size={28} className="text-base-700" />
                    <span className="text-sm">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`border-b border-base-800/60 last:border-0 hover:bg-base-850/70 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-base-200 align-middle whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-base-800 text-xs text-base-400">
          <span>
            Halaman {page} dari {totalPages} &middot; {filtered.length} data
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-md border border-base-700 disabled:opacity-40 hover:bg-base-800"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-md border border-base-700 disabled:opacity-40 hover:bg-base-800"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
