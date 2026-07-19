export interface ExamDocumentView {
  type: 'marksheet' | 'certificate'
  render_mode?: 'template' | 'legacy'
  student_name: string
  paper_size?: string
  html?: string
  css?: string
  school?: { name: string; address?: string; phone?: string; email?: string; logo_path?: string | null; logo_url?: string | null }
  roll_number?: string | null
  class_name?: string
  exam_name?: string
  exam_type?: string
  subject?: string | null
  exam_date?: string | null
  academic_year?: string | null
  marks_obtained?: number
  max_marks?: number
  percentage?: number
  grade?: string
  result_status?: string
  remarks?: string | null
  issued_date?: string
  certificate_title?: string
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function marksheetHtml(doc: ExamDocumentView): string {
  const rows = [
    ['Student Name', doc.student_name],
    ['Roll Number', doc.roll_number || '—'],
    ['Class', doc.class_name || '—'],
    ['Exam', doc.exam_name || '—'],
    ['Subject', doc.subject || '—'],
    ['Exam Date', doc.exam_date || '—'],
    ['Academic Year', doc.academic_year || '—'],
    ['Marks Obtained', `${doc.marks_obtained ?? '—'} / ${doc.max_marks ?? '—'}`],
    ['Percentage', `${doc.percentage ?? '—'}%`],
    ['Grade', doc.grade || '—'],
    ['Result', (doc.result_status || '—').toUpperCase()],
  ]

  return `
  <div class="doc marksheet">
    <div class="header">
      <div class="school">${esc(doc.school?.name || '')}</div>
      <div class="title">MARKSHEET</div>
      <div class="sub">${esc(doc.academic_year || '')}</div>
    </div>
    <table class="grid">
      ${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(String(v))}</td></tr>`).join('')}
    </table>
    ${doc.remarks ? `<p class="remarks"><strong>Remarks:</strong> ${esc(doc.remarks)}</p>` : ''}
    <div class="footer">
      <div class="sign">Class Teacher</div>
      <div class="sign">Principal</div>
    </div>
    <p class="issued">Issued on ${esc(doc.issued_date || '')}</p>
  </div>`
}

function certificateHtml(doc: ExamDocumentView): string {
  return `
  <div class="doc certificate">
    <div class="border-outer">
      <div class="border-inner">
        <p class="school">${esc(doc.school?.name || '')}</p>
        <h1>${esc(doc.certificate_title || 'Certificate of Achievement')}</h1>
        <p class="presented">This is to certify that</p>
        <p class="name">${esc(doc.student_name)}</p>
        <p class="detail">Roll No. ${esc(doc.roll_number || '—')} · Class ${esc(doc.class_name || '—')}</p>
        <p class="body">has successfully completed <strong>${esc(doc.exam_name || '')}</strong>
        ${doc.subject ? ` in <strong>${esc(doc.subject)}</strong>` : ''}
        with <strong>${doc.percentage ?? '—'}%</strong> marks (Grade <strong>${esc(doc.grade || '—')}</strong>)
        for academic year <strong>${esc(doc.academic_year || '')}</strong>.</p>
        <div class="footer">
          <div class="sign">Date: ${esc(doc.issued_date || '')}</div>
          <div class="sign">Principal</div>
        </div>
      </div>
    </div>
  </div>`
}

const FALLBACK_CSS = `
@page { size: A4 portrait; margin: 12mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Georgia, 'Times New Roman', serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #1e293b; }
.doc { max-width: 180mm; margin: 0 auto; }
.marksheet .header { text-align: center; border-bottom: 3px double #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
.marksheet .school { font-size: 22px; font-weight: bold; color: #312e81; }
.marksheet .title { font-size: 18px; letter-spacing: 4px; margin-top: 8px; color: #4f46e5; }
.marksheet .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
.marksheet table.grid { width: 100%; border-collapse: collapse; font-size: 13px; }
.marksheet table.grid th, .marksheet table.grid td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
.marksheet table.grid th { width: 38%; background: #f8fafc; font-weight: 600; }
.marksheet .remarks { margin-top: 16px; font-size: 12px; }
.marksheet .footer { display: flex; justify-content: space-between; margin-top: 48px; font-size: 12px; }
.marksheet .sign { border-top: 1px solid #94a3b8; padding-top: 6px; min-width: 140px; text-align: center; }
.marksheet .issued { text-align: center; margin-top: 24px; font-size: 11px; color: #64748b; }
.certificate { text-align: center; padding: 8mm; }
.certificate .border-outer { border: 4px solid #4f46e5; padding: 6px; }
.certificate .border-inner { border: 2px solid #a5b4fc; padding: 24px 20px; min-height: 240mm; display: flex; flex-direction: column; justify-content: center; }
.certificate .school { font-size: 20px; font-weight: bold; color: #312e81; }
.certificate h1 { font-size: 26px; color: #4f46e5; margin: 16px 0 24px; letter-spacing: 2px; }
.certificate .presented { font-size: 14px; color: #64748b; }
.certificate .name { font-size: 32px; font-weight: bold; margin: 12px 0; color: #0f172a; }
.certificate .detail { font-size: 13px; color: #475569; margin-bottom: 20px; }
.certificate .body { font-size: 15px; line-height: 1.7; max-width: 140mm; margin: 0 auto 40px; }
.certificate .footer { display: flex; justify-content: space-between; margin-top: auto; padding-top: 40px; font-size: 12px; }
.certificate .sign { min-width: 160px; }
`

function templatePrintCss(doc: ExamDocumentView): string {
  const landscape = doc.paper_size?.includes('landscape')
  const pageW = landscape ? '297mm' : '210mm'
  const pageH = landscape ? '210mm' : '297mm'
  const pageRule = landscape
    ? '@page { size: A4 landscape; margin: 0; }'
    : '@page { size: A4 portrait; margin: 0; }'

  return `${pageRule}
html, body { width: ${pageW}; height: ${pageH}; margin: 0; padding: 0; overflow: hidden; background: #fff; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.td-page { width: ${pageW} !important; height: ${pageH} !important; margin: 0 !important; overflow: hidden; position: relative; }
* { box-sizing: border-box; }
${doc.css || ''}`
}

function openPrintWindow(html: string) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(iframe)

  const docWin = iframe.contentWindow
  const docEl = iframe.contentDocument || docWin?.document
  if (!docEl || !docWin) return

  docEl.open()
  docEl.write(html)
  docEl.close()

  const cleanup = () => {
    setTimeout(() => iframe.remove(), 500)
  }

  const triggerPrint = () => {
    setTimeout(() => {
      docWin.focus()
      docWin.print()
      setTimeout(cleanup, 60000)
    }, 150)
  }

  docWin.onafterprint = cleanup
  iframe.onload = () => {
    const imgs = Array.from(docEl.images)
    if (imgs.length === 0) {
      triggerPrint()
      return
    }
    Promise.all(
      imgs.map((img) => img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })),
    ).then(triggerPrint)
  }
}

export function printExamDocument(doc: ExamDocumentView) {
  if (doc.render_mode === 'template' && doc.html) {
    const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || window.location.origin
    const css = templatePrintCss(doc)
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><base href="${apiOrigin}/"><title>${esc(doc.student_name)}</title><style>${css}</style></head><body>${doc.html}</body></html>`
    openPrintWindow(html)
    return
  }

  const body = doc.type === 'certificate' ? certificateHtml(doc) : marksheetHtml(doc)
  const css = FALLBACK_CSS
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${esc(doc.student_name)}</title><style>${css}</style></head><body>${body}</body></html>`
  openPrintWindow(html)
}
