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
  const percent = typeof doc.percentage === 'number' ? `${doc.percentage.toFixed(1)}%` : '—'
  const marks = typeof doc.marks_obtained === 'number' ? doc.marks_obtained.toFixed(1) : '—'
  const maxMarks = typeof doc.max_marks === 'number' ? doc.max_marks : '—'
  const resultTone = doc.result_status === 'pass' ? 'good' : doc.result_status === 'fail' ? 'bad' : 'neutral'

  const schoolName = esc(doc.school?.name || 'School Name')
  const schoolMeta = [doc.school?.address, doc.school?.phone, doc.school?.email]
    .filter(Boolean)
    .map((item) => esc(String(item)))
    .join(' • ')

  const logo = doc.school?.logo_url
    ? `<img src="${esc(doc.school.logo_url)}" alt="School Logo" class="logo-img" />`
    : `<div class="logo-fallback">${schoolName.slice(0, 1)}</div>`

  const rows = [
    ['Student Name', doc.student_name || '—'],
    ['Roll Number', doc.roll_number || '—'],
    ['Class', doc.class_name || '—'],
    ['Exam', doc.exam_name || '—'],
    ['Subject', doc.subject || 'All Subjects'],
    ['Exam Date', doc.exam_date || '—'],
    ['Academic Year', doc.academic_year || '—'],
    ['Marks Obtained', `${marks} / ${maxMarks}`],
    ['Percentage', percent],
    ['Grade', doc.grade || '—'],
    ['Result', (doc.result_status || '—').toUpperCase()],
  ]

  return `
  <div class="doc marksheet">
    <div class="sheet-bg"></div>
    <header class="sheet-header">
      <div class="sheet-brand">
        ${logo}
        <div>
          <p class="school">${schoolName}</p>
          ${schoolMeta ? `<p class="school-meta">${schoolMeta}</p>` : ''}
        </div>
      </div>
      <div class="sheet-badges">
        <span class="pill">${esc(doc.academic_year || 'Academic Year')}</span>
        <span class="pill tone-${resultTone}">${esc((doc.result_status || 'pending').toUpperCase())}</span>
      </div>
    </header>

    <div class="title-wrap">
      <h1>Academic Marksheet</h1>
      <p>Official performance summary for ${esc(doc.exam_name || 'examination')}</p>
    </div>

    <table class="grid">
      ${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(String(v))}</td></tr>`).join('')}
    </table>

    <section class="summary-cards">
      <article><span>Total Marks</span><strong>${esc(String(maxMarks))}</strong></article>
      <article><span>Obtained</span><strong>${esc(String(marks))}</strong></article>
      <article><span>Percentage</span><strong>${esc(percent)}</strong></article>
      <article><span>Grade</span><strong>${esc(doc.grade || '—')}</strong></article>
    </section>

    ${doc.remarks ? `<p class="remarks"><strong>Remarks:</strong> ${esc(doc.remarks)}</p>` : '<p class="remarks muted">Remarks: Not provided.</p>'}

    <footer class="footer">
      <div class="sign-block"><span>Class Teacher</span></div>
      <div class="sign-block"><span>Academic Coordinator</span></div>
      <div class="sign-block"><span>Principal</span></div>
    </footer>
    <p class="issued">Issued on ${esc(doc.issued_date || '')}</p>
  </div>`
}

function certificateHtml(doc: ExamDocumentView): string {
  const schoolName = esc(doc.school?.name || 'School Name')
  const schoolMeta = [doc.school?.address, doc.school?.phone]
    .filter(Boolean)
    .map((item) => esc(String(item)))
    .join(' • ')

  const logo = doc.school?.logo_url
    ? `<img src="${esc(doc.school.logo_url)}" alt="School Logo" class="logo-img" />`
    : `<div class="logo-fallback">${schoolName.slice(0, 1)}</div>`

  const title = esc(doc.certificate_title || 'Certificate of Achievement')
  const student = esc(doc.student_name || 'Student')
  const examName = esc(doc.exam_name || 'Annual Examination')
  const subjectText = doc.subject ? ` in ${esc(doc.subject)}` : ''
  const grade = esc(doc.grade || '—')
  const percent = typeof doc.percentage === 'number' ? `${doc.percentage.toFixed(1)}%` : '—'

  return `
  <div class="doc certificate">
    <div class="cert-frame">
      <div class="cert-layer">
        <header class="cert-header">
          ${logo}
          <div>
            <p class="school">${schoolName}</p>
            ${schoolMeta ? `<p class="school-meta">${schoolMeta}</p>` : ''}
          </div>
          <div class="medal">${esc(doc.result_status?.toUpperCase() || 'PASS')}</div>
        </header>

        <p class="kicker">Certificate</p>
        <h1>${title}</h1>
        <p class="presented">This is proudly presented to</p>
        <p class="name">${student}</p>

        <p class="body">
          for successfully completing <strong>${examName}</strong>${subjectText}
          during the academic year <strong>${esc(doc.academic_year || '—')}</strong>,
          with grade <strong>${grade}</strong> and score <strong>${esc(percent)}</strong>.
        </p>

        <div class="facts">
          <div><span>Roll Number</span><strong>${esc(doc.roll_number || '—')}</strong></div>
          <div><span>Class</span><strong>${esc(doc.class_name || '—')}</strong></div>
          <div><span>Issued Date</span><strong>${esc(doc.issued_date || '—')}</strong></div>
        </div>

        <footer class="footer">
          <div class="sign-block"><span>Class Teacher</span></div>
          <div class="sign-block"><span>Principal</span></div>
        </footer>
      </div>
    </div>
  </div>`
}

const FALLBACK_CSS = `
@page { size: A4 portrait; margin: 10mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color: #0f172a;
  background: #f8fafc;
}
.doc {
  width: 190mm;
  min-height: 270mm;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #dbe7f3;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.sheet-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 100% 0%, rgba(30, 64, 175, 0.08), transparent 30%),
    radial-gradient(circle at 0% 100%, rgba(22, 163, 74, 0.07), transparent 32%);
  pointer-events: none;
}
.sheet-header, .cert-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 0;
}
.sheet-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
}
.logo-fallback {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f766e, #1d4ed8);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 20px;
}
.school {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.school-meta {
  font-size: 11px;
  color: #475569;
  margin-top: 3px;
}
.sheet-badges {
  display: flex;
  gap: 8px;
}
.pill {
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  font-size: 11px;
  padding: 5px 10px;
}
.pill.tone-good { background: #ecfdf3; border-color: #bbf7d0; color: #166534; }
.pill.tone-bad { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.pill.tone-neutral { background: #f8fafc; border-color: #e2e8f0; color: #334155; }
.title-wrap {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 10px 18px 0;
}
.title-wrap h1 { font-size: 28px; letter-spacing: 0.4px; }
.title-wrap p { margin-top: 4px; color: #475569; font-size: 12px; }
.grid {
  position: relative;
  z-index: 1;
  margin: 14px 18px 0;
  width: calc(100% - 36px);
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid #dbe3ef;
  background: #fff;
}
.grid th,
.grid td {
  border: 1px solid #dbe3ef;
  padding: 8px 10px;
  text-align: left;
}
.grid th {
  width: 36%;
  background: #f8fbff;
  color: #1e293b;
  font-weight: 600;
}
.summary-cards {
  position: relative;
  z-index: 1;
  margin: 12px 18px 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.summary-cards article {
  border: 1px solid #dbe7f3;
  border-radius: 10px;
  padding: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
}
.summary-cards span { display: block; color: #64748b; font-size: 10px; margin-bottom: 4px; }
.summary-cards strong { font-size: 15px; }
.remarks {
  position: relative;
  z-index: 1;
  margin: 12px 18px 0;
  font-size: 11.5px;
  line-height: 1.6;
  padding: 9px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.remarks.muted { color: #64748b; }
.footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 28px 18px 0;
}
.sign-block {
  flex: 1;
  border-top: 1px solid #94a3b8;
  padding-top: 6px;
  text-align: center;
  font-size: 11px;
  color: #334155;
}
.issued {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 12px;
  font-size: 10.5px;
  color: #64748b;
}

.certificate {
  background: linear-gradient(155deg, #fffef7 0%, #ffffff 50%, #f8fbff 100%);
}
.cert-frame {
  margin: 8px;
  min-height: calc(270mm - 16px);
  border: 2px solid #c8a54b;
  border-radius: 14px;
  padding: 5px;
  background:
    linear-gradient(135deg, rgba(239, 246, 255, 0.6), rgba(255, 255, 255, 0.8)),
    repeating-linear-gradient(45deg, rgba(200, 165, 75, 0.06), rgba(200, 165, 75, 0.06) 8px, transparent 8px, transparent 16px);
}
.cert-layer {
  min-height: calc(270mm - 30px);
  border: 1px solid rgba(200, 165, 75, 0.7);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  text-align: center;
}
.kicker {
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 11px;
  color: #475569;
}
.certificate h1 {
  margin-top: 6px;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 34px;
  color: #9a6c07;
}
.presented { margin-top: 12px; font-size: 13px; color: #475569; }
.name {
  margin-top: 8px;
  font-size: 38px;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #0f172a;
}
.body {
  margin: 16px auto 0;
  max-width: 150mm;
  line-height: 1.75;
  font-size: 14px;
  color: #1e293b;
}
.facts {
  margin: 18px auto 0;
  width: 100%;
  max-width: 160mm;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.facts > div {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.85);
  padding: 9px;
}
.facts span {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-bottom: 3px;
}
.facts strong { font-size: 13px; }
.medal {
  min-width: 68px;
  border-radius: 999px;
  border: 1px solid #d9b55d;
  background: #fff8dd;
  color: #7a5a0d;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 10px;
}
`

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
  const body = doc.type === 'certificate' ? certificateHtml(doc) : marksheetHtml(doc)
  const css = FALLBACK_CSS
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${esc(doc.student_name)}</title><style>${css}</style></head><body>${body}</body></html>`
  openPrintWindow(html)
}
