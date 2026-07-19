export function exportTableToCsv(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  const escape = (v: string) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return /[",\n]/.test(s) ? `"${s}"` : s
  }
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function printTableElement(el: HTMLElement | null, title = 'Export') {
  if (!el) return
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!win) return
  win.document.write(`
    <!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:24px;color:#0f172a}
      h1{font-size:18px;margin:0 0 16px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left}
      th{background:#f1f5f9;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
    </style></head><body>
    <h1>${title}</h1>${el.outerHTML}</body></html>`)
  win.document.close()
  win.focus()
  win.print()
}
