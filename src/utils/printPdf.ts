import type { AxiosResponse } from 'axios'

export async function printPdfResponse(res: AxiosResponse<Blob>, title = 'Print') {
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  iframe.title = title
  iframe.src = url
  document.body.appendChild(iframe)
  iframe.onload = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
      URL.revokeObjectURL(url)
    }, 1500)
  }
}

export function openPdfPrintWindow(url: string) {
  const win = window.open(url, '_blank')
  if (win) {
    win.addEventListener('load', () => win.print())
  }
}
