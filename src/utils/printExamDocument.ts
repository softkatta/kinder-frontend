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

function apiOrigin(): string {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (!configured) return window.location.origin

  try {
    return new URL(configured).origin
  } catch {
    return window.location.origin
  }
}

function resolveLogoCandidates(school?: ExamDocumentView['school']): { primary: string | null; fallback: string | null } {
  const origin = apiOrigin()

  const pathRaw = school?.logo_path?.trim() || ''
  const urlRaw = school?.logo_url?.trim() || ''

  const normalizePath = (value: string): string => {
    if (!value) return ''
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
    if (value.startsWith('/storage/')) return `${origin}${value}`
    if (value.startsWith('storage/')) return `${origin}/${value}`
    return `${origin}/storage/${value.replace(/^\/+/, '')}`
  }

  const normalizeUrl = (value: string): string => {
    if (!value) return ''
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
    return `${origin}/${value.replace(/^\/+/, '')}`
  }

  const fromPath = normalizePath(pathRaw)
  const fromUrl = normalizeUrl(urlRaw)

  if (fromPath && fromUrl && fromPath !== fromUrl) {
    return { primary: fromPath, fallback: fromUrl }
  }

  if (fromPath) return { primary: fromPath, fallback: null }
  if (fromUrl) return { primary: fromUrl, fallback: null }

  return { primary: null, fallback: null }
}

function logoHtml(school?: ExamDocumentView['school']): string {
  const rawSchoolName = school?.name?.trim() || 'School'
  const schoolInitial = esc(rawSchoolName.slice(0, 1).toUpperCase())
  const { primary, fallback } = resolveLogoCandidates(school)

  if (!primary) {
    return `<div class="logo-wrap logo-missing"><div class="logo-fallback">${schoolInitial}</div></div>`
  }

  const onError = "if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';return;}this.style.display='none';this.closest('.logo-wrap')?.classList.add('logo-missing');"
  return `<div class="logo-wrap"><img src="${esc(primary)}" data-fallback="${esc(fallback ?? '')}" alt="School Logo" class="logo-img" onerror="${onError}" /><div class="logo-fallback">${schoolInitial}</div></div>`
}

function marksheetHtml(doc: ExamDocumentView): string {
  const percent = typeof doc.percentage === 'number' ? `${doc.percentage.toFixed(1)}%` : '—'
  const marks = typeof doc.marks_obtained === 'number' ? doc.marks_obtained.toFixed(1) : '—'
  const maxMarks = typeof doc.max_marks === 'number' ? doc.max_marks : '—'
  const resultTone = doc.result_status === 'pass' ? 'good' : doc.result_status === 'fail' ? 'bad' : 'neutral'

  const schoolName = esc(doc.school?.name || 'School Name')
  const schoolAddress = doc.school?.address?.trim() || ''
  const schoolContact = [doc.school?.phone, doc.school?.email]
    .filter(Boolean)
    .map((item) => esc(String(item)))
    .join(' • ')

  const logo = logoHtml(doc.school)

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
        <div class="school-details">
          <p class="school">${schoolName}</p>
          ${schoolAddress ? `<p class="school-meta">${esc(schoolAddress)}</p>` : ''}
          ${schoolContact ? `<p class="school-meta school-meta-sub">${schoolContact}</p>` : ''}
        </div>
      </div>
      <div class="sheet-badges">
        <span class="pill">AY ${esc(doc.academic_year || '—')}</span>
        <span class="pill tone-${resultTone}">RESULT: ${esc((doc.result_status || 'pending').toUpperCase())}</span>
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
  const schoolAddress = doc.school?.address?.trim() || ''
  const schoolPhone = doc.school?.phone?.trim() || ''

  const logo = logoHtml(doc.school)

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
        <div class="cert-ribbon">Softkatt Little Stars Kindergarten</div>
        <header class="cert-header">
          ${logo}
          <div class="school-details">
            <p class="school">${schoolName}</p>
            ${schoolAddress ? `<p class="school-meta">${esc(schoolAddress)}</p>` : ''}
            ${schoolPhone ? `<p class="school-meta school-meta-sub">${esc(schoolPhone)}</p>` : ''}
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
:root {
  --brand-navy: #103f91;
  --brand-royal: #1d4ed8;
  --brand-cyan: #0f9ca8;
  --brand-mint: #15b79e;
  --brand-gold: #c89b3c;
  --brand-gold-soft: #f7e7bf;
  --ink-strong: #0f172a;
  --ink-soft: #475569;
}
body {
  font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color: var(--ink-strong);
  background: #eff5ff;
}
.doc {
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #dbe7f3;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.marksheet {
  width: 190mm;
  min-height: 270mm;
}
.sheet-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 100% 0%, rgba(16, 63, 145, 0.12), transparent 32%),
    radial-gradient(circle at 0% 100%, rgba(15, 156, 168, 0.1), transparent 34%),
    linear-gradient(160deg, rgba(16, 63, 145, 0.03), rgba(15, 156, 168, 0.04));
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
  flex: 1;
  min-width: 0;
}
.logo-wrap {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: #fff;
}
.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 3px;
  background: #fff;
}
.logo-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--brand-cyan), var(--brand-royal));
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 20px;
  display: none;
}
.logo-wrap.logo-missing .logo-fallback {
  display: grid;
}
.school {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--brand-navy);
}
.school-meta {
  font-size: 11px;
  color: var(--ink-soft);
  margin-top: 3px;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.school-meta-sub {
  font-size: 10.5px;
  opacity: 0.92;
}
.school-details {
  min-width: 0;
}
.sheet-badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
.pill {
  border: 1px solid #cde0ff;
  border-radius: 999px;
  background: #f1f7ff;
  color: var(--brand-royal);
  font-weight: 600;
  font-size: 11px;
  padding: 5px 10px;
  white-space: nowrap;
}
.pill.tone-good { background: #e9fcf7; border-color: #b8f0e4; color: #0f766e; }
.pill.tone-bad { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.pill.tone-neutral { background: #f8fafc; border-color: #e2e8f0; color: #334155; }
.title-wrap {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 10px 18px 0;
}
.title-wrap h1 { font-size: 28px; letter-spacing: 0.4px; }
.title-wrap h1 { color: var(--brand-navy); }
.title-wrap p { margin-top: 4px; color: var(--ink-soft); font-size: 12px; }
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
  background: linear-gradient(180deg, #ffffff, #f2f9ff);
}
.summary-cards span { display: block; color: #64748b; font-size: 10px; margin-bottom: 4px; }
.summary-cards strong { font-size: 15px; color: var(--brand-navy); }
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
  width: 279mm;
  min-height: 190mm;
  background: linear-gradient(155deg, #fffdf4 0%, #ffffff 45%, #edf5ff 100%);
}
.cert-frame {
  margin: 8px;
  min-height: calc(190mm - 16px);
  border: 2px solid var(--brand-gold);
  border-radius: 14px;
  padding: 5px;
  background:
    radial-gradient(circle at 8% 10%, rgba(16, 63, 145, 0.06), transparent 28%),
    radial-gradient(circle at 92% 88%, rgba(15, 156, 168, 0.08), transparent 35%),
    repeating-linear-gradient(45deg, rgba(200, 155, 60, 0.05), rgba(200, 155, 60, 0.05) 8px, transparent 8px, transparent 16px);
}
.cert-layer {
  min-height: calc(190mm - 30px);
  border: 1px solid rgba(200, 155, 60, 0.7);
  border-radius: 10px;
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  text-align: center;
  position: relative;
}
.cert-layer::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px dashed rgba(29, 78, 216, 0.22);
  border-radius: 8px;
  pointer-events: none;
}
.cert-ribbon {
  align-self: center;
  background: linear-gradient(90deg, var(--brand-navy), var(--brand-cyan));
  color: #fff;
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
  box-shadow: 0 4px 10px rgba(16, 63, 145, 0.2);
}
.kicker {
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 11px;
  color: var(--ink-soft);
}
.certificate h1 {
  margin-top: 4px;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 46px;
  color: #9a6f17;
}
.presented { margin-top: 8px; font-size: 14px; color: var(--ink-soft); }
.name {
  margin-top: 6px;
  font-size: 56px;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #0b2f66;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
}
.body {
  margin: 10px auto 0;
  max-width: 235mm;
  line-height: 1.7;
  font-size: 18px;
  color: #1e2f4c;
}
.facts {
  margin: 14px auto 0;
  width: 100%;
  max-width: 235mm;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.facts > div {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 249, 255, 0.85));
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
  border: 1px solid var(--brand-gold);
  background: var(--brand-gold-soft);
  color: #7a5a0d;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 10px;
}

@media print {
  .certificate {
    break-before: always;
  }
}
`

function cssForDoc(type: ExamDocumentView['type']): string {
  if (type === 'certificate') {
    return FALLBACK_CSS.replace('@page { size: A4 portrait; margin: 10mm; }', '@page { size: A4 landscape; margin: 9mm; }')
  }

  return FALLBACK_CSS
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
  const body = doc.type === 'certificate' ? certificateHtml(doc) : marksheetHtml(doc)
  const css = cssForDoc(doc.type)
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${esc(doc.student_name)}</title><style>${css}</style></head><body>${body}</body></html>`
  openPrintWindow(html)
}
