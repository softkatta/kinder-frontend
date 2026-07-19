import type { IdCardViewData } from '@/components/idcards/idCardTheme'
import { cardBackgroundGradient } from '@/components/idcards/idCardTheme'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function cardFaceHtml(card: IdCardViewData, side: 'front' | 'back'): string {
  const t = card.theme
  const m = card.meta ?? {}
  const grad = cardBackgroundGradient(t, side)

  const photo = card.photo_url
    ? `<img src="${esc(card.photo_url)}" alt="" style="width:100%;height:100%;object-fit:cover;" />`
    : `<span style="font-size:18px;font-weight:700;color:rgba(255,255,255,0.7);">${esc(card.initials)}</span>`

  const subtitles = card.subtitle_lines.map((l) => `<div class="meta">${esc(l)}</div>`).join('')
  const adm = card.card_type === 'student' && m.admission_number
    ? `<div class="meta">Adm: ${esc(String(m.admission_number))}</div>` : ''
  const blood = card.blood_group ? `<div class="meta">Blood: ${esc(card.blood_group)}</div>` : ''
  const emergency = card.emergency_contact
    ? `<p class="back-p"><span class="lbl">Emergency</span><br/>${esc(card.emergency_contact)}</p>` : ''

  if (side === 'front') {
    return `
    <div class="pvc front" style="background:${grad}">
      <div class="overlay-front"></div>
      <div class="inner">
        <div class="head">
          <div class="logo">★</div>
          <div><div class="school-short">${esc(card.school.short_name ?? 'LITTLE STARS')}</div>
          <div class="school-name">${esc(card.school.name)}</div></div>
        </div>
        <div class="body">
          <div class="info">
            <span class="badge">${esc(card.role_badge)}</span>
            <div class="name">${esc(card.full_name)}</div>
            <div class="id">${esc(card.card_number)}</div>
            ${subtitles}${adm}${blood}
            <div class="valid">${esc(card.validity_label)}</div>
          </div>
          <div class="photo">${photo}</div>
        </div>
        <div class="foot">${esc(card.school.phone)} | ${esc(card.school.email)}</div>
      </div>
    </div>`
  }

  const qr = card.qr_data_uri
    ? `<img src="${esc(card.qr_data_uri)}" alt="QR" style="width:22mm;height:22mm;display:block;" />`
    : ''

  return `
  <div class="pvc back" style="background:${grad}">
    <div class="dots"></div>
    <div class="inner back-inner">
      <div class="back-left">
        <div class="digital">✦ DIGITAL PASS</div>
        <div class="qr-box">${qr}</div>
        <div class="qr-hint">Show at reception — staff scanner only</div>
        <div class="qr-id">${esc(card.card_number)}</div>
      </div>
      <div class="back-right">
        ${emergency}
        <p class="back-p"><span class="lbl">Address</span><br/>${esc(card.school.address)}</p>
        <p class="back-p"><span class="lbl">Phone</span><br/>${esc(card.school.phone)}</p>
        <p class="back-p"><span class="lbl">Email</span><br/>${esc(card.school.email)}</p>
        <p class="back-p"><span class="lbl">Website</span><br/>${esc(card.school.website)}</p>
        <p class="dates">Issued: ${esc(card.issue_date)} · Exp: ${esc(card.expiry_date)}</p>
        <p class="note">${esc(card.back_note)}</p>
      </div>
    </div>
  </div>`
}

const PRINT_CSS = `
@page { size: A4 portrait; margin: 10mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.sheet { page-break-after: always; text-align: center; padding: 4mm 0; }
.sheet:last-child { page-break-after: auto; }
.pair { display: inline-flex; gap: 6mm; align-items: flex-start; justify-content: center; }
.pvc {
  width: 85.6mm; height: 53.98mm; border-radius: 3.5mm; overflow: hidden;
  position: relative; color: #fff; text-align: left;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
.overlay-front { position:absolute;inset:0;background:linear-gradient(to bottom right,rgba(255,255,255,0.1),transparent,rgba(0,0,0,0.1));pointer-events:none; }
.dots { position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,0.15) 1px,transparent 1px);background-size:3mm 3mm;opacity:0.35; }
.inner { position:relative;z-index:1;height:100%;padding:3mm 3.5mm 7mm; }
.back-inner { display:flex;gap:2mm;padding:3mm;height:100%; }
.head { display:flex;gap:2mm;align-items:center;margin-bottom:2mm; }
.logo { width:9mm;height:9mm;background:rgba(255,255,255,0.95);border-radius:2mm;display:flex;align-items:center;justify-content:center;color:#4F46E5;font-weight:700;font-size:9pt;flex-shrink:0; }
.school-short { font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:0.3px; }
.school-name { font-size:6pt;opacity:0.85; }
.body { display:flex;gap:2mm; }
.info { flex:1;min-width:0; }
.badge { display:inline-block;font-size:5.5pt;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:0.8mm 2mm;border-radius:3mm;background:rgba(255,255,255,0.22);margin-bottom:1mm; }
.name { font-size:11pt;font-weight:700;line-height:1.15; }
.id { font-size:7pt;font-family:monospace;opacity:0.9;margin:0.5mm 0 1mm; }
.meta { font-size:6pt;opacity:0.9;line-height:1.4; }
.valid { font-size:5.5pt;opacity:0.75;margin-top:1.5mm; }
.photo { width:20mm;height:24mm;border-radius:2.5mm;border:1.5px solid rgba(255,255,255,0.4);background:rgba(255,255,255,0.2);overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.foot { position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.3);padding:1.2mm 3.5mm;font-size:5.5pt; }
.back-left { width:42%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center; }
.digital { font-size:5.5pt;font-weight:700;letter-spacing:1px;margin-bottom:1.5mm;opacity:0.9; }
.qr-box { background:#fff;border-radius:2mm;padding:1.5mm; }
.qr-hint { font-size:5pt;opacity:0.75;margin-top:1.5mm;line-height:1.3;max-width:28mm; }
.qr-id { font-size:5.5pt;font-family:monospace;margin-top:1mm;opacity:0.85; }
.back-right { flex:1;font-size:5.5pt;line-height:1.45;display:flex;flex-direction:column;justify-content:center; }
.lbl { font-weight:700;opacity:0.7;font-size:5pt;text-transform:uppercase;letter-spacing:0.3px; }
.back-p { margin-bottom:1mm; }
.dates { font-size:5pt;opacity:0.85;margin-top:1mm; }
.note { margin-top:1.5mm;padding:1.5mm;background:rgba(0,0,0,0.15);border-radius:1.5mm;font-style:italic;font-size:5pt;line-height:1.35;opacity:0.9; }
`

/** Print cards exactly as preview — same tab, hidden iframe, browser print dialog */
export function printIdCards(cards: IdCardViewData[]) {
  const sheets = cards.map((card) => `
    <div class="sheet">
      <div class="pair">
        ${cardFaceHtml(card, 'front')}
        ${cardFaceHtml(card, 'back')}
      </div>
    </div>
  `).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ID Cards</title><style>${PRINT_CSS}</style></head>
    <body>${sheets}</body></html>`

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  iframe.title = 'ID Cards'
  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  const doc = win?.document
  if (!win || !doc) {
    iframe.remove()
    return
  }

  const cleanup = () => {
    iframe.remove()
  }

  const doPrint = () => {
    win.addEventListener('afterprint', cleanup, { once: true })
    win.focus()
    win.print()
    setTimeout(cleanup, 2000)
  }

  iframe.onload = () => setTimeout(doPrint, 300)
  doc.open()
  doc.write(html)
  doc.close()
}
