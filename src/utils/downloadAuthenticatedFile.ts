export async function downloadAuthenticatedFile(url: string, filename: string) {
  const token = localStorage.getItem('auth_token')
  const tenantId = localStorage.getItem('tenant_id') || '1'
  const res = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'X-Tenant-ID': tenantId,
      Accept: 'application/pdf',
    },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Download failed')
  const blob = await res.blob()
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
  URL.revokeObjectURL(href)
}
