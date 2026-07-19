import { CR80_ASPECT, cardBackgroundGradient, type IdCardViewData } from './idCardTheme'

interface IdCardFaceProps {
  card: IdCardViewData
  side: 'front' | 'back'
  className?: string
  scale?: number
}

function CardShell({ card, side, className, scale = 1, children }: IdCardFaceProps & { children: React.ReactNode }) {
  const w = 340 * scale
  const h = w / CR80_ASPECT
  const t = card.theme

  return (
    <div
      className={`id-card-pvc relative overflow-hidden rounded-[14px] shadow-xl ${className ?? ''}`}
      style={{
        width: w,
        height: h,
        background: cardBackgroundGradient(t, side),
        color: '#fff',
        boxShadow: '0 12px 40px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.08) inset',
      }}
    >
      {side === 'back' && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
      )}
      {side === 'front' && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/10" />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}

export function IdCardFront({ card, className, scale }: Omit<IdCardFaceProps, 'side'>) {
  const m = card.meta ?? {}

  return (
    <CardShell card={card} side="front" className={className} scale={scale}>
      <div className="flex h-full flex-col p-3 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/95 text-violet-600 font-bold text-sm shadow-sm">
            ★
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wide leading-tight uppercase truncate">
              {card.school.short_name ?? 'Little Stars'}
            </p>
            <p className="text-[8px] opacity-85 truncate">{card.school.name}</p>
          </div>
        </div>

        <div className="flex flex-1 gap-2 min-h-0">
          <div className="flex-1 min-w-0">
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[7px] font-bold tracking-wider uppercase mb-1"
              style={{ background: card.theme.badge_bg, color: card.theme.badge_text }}
            >
              {card.role_badge}
            </span>
            <h3 className="text-sm font-bold leading-tight truncate">{card.full_name}</h3>
            <p className="text-[9px] font-mono opacity-90 mt-0.5">{card.card_number}</p>
            {card.subtitle_lines.map((line) => (
              <p key={line} className="text-[8px] opacity-90 leading-snug mt-0.5 truncate">{line}</p>
            ))}
            {card.card_type === 'student' && m.admission_number && (
              <p className="text-[8px] opacity-90 mt-0.5">Adm: {m.admission_number}</p>
            )}
            {card.blood_group && (
              <p className="text-[8px] opacity-80 mt-1">Blood: {card.blood_group}</p>
            )}
            <p className="text-[7px] opacity-75 mt-1.5">{card.validity_label}</p>
          </div>

          <div className="shrink-0">
            <div className="h-[72px] w-[60px] rounded-lg border-2 border-white/40 bg-white/20 overflow-hidden flex items-center justify-center">
              {card.photo_url ? (
                <img src={card.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-white/70">{card.initials}</span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/30 px-3 py-1 text-[7px] truncate">
          {card.school.phone} | {card.school.email}
        </div>
      </div>
    </CardShell>
  )
}

export function IdCardBack({ card, className, scale }: Omit<IdCardFaceProps, 'side'>) {
  return (
    <CardShell card={card} side="back" className={className} scale={scale}>
      <div className="flex h-full p-3 gap-2">
        <div className="w-[42%] flex flex-col items-center justify-center text-center">
          <p className="text-[7px] font-bold tracking-widest opacity-90 mb-1.5">✦ DIGITAL PASS</p>
          <div className="bg-white rounded-lg p-1.5 shadow-md">
            {card.qr_data_uri ? (
              <img src={card.qr_data_uri} alt="QR" className="h-[72px] w-[72px]" />
            ) : (
              <div className="h-[72px] w-[72px] bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">QR</div>
            )}
          </div>
          <p className="text-[6px] opacity-75 mt-1.5 leading-tight px-1">Show at reception — staff scanner only</p>
          <p className="text-[7px] font-mono opacity-85 mt-1">{card.card_number}</p>
        </div>

        <div className="flex-1 flex flex-col justify-center text-[7px] leading-relaxed min-w-0">
          {card.emergency_contact && (
            <p className="mb-1"><span className="font-bold opacity-70 uppercase text-[6px]">Emergency</span><br />{card.emergency_contact}</p>
          )}
          <p className="mb-1"><span className="font-bold opacity-70 uppercase text-[6px]">Address</span><br />{card.school.address}</p>
          <p className="mb-1"><span className="font-bold opacity-70 uppercase text-[6px]">Phone</span><br />{card.school.phone}</p>
          <p className="mb-1 truncate"><span className="font-bold opacity-70 uppercase text-[6px]">Email</span><br />{card.school.email}</p>
          <p className="mb-1 truncate"><span className="font-bold opacity-70 uppercase text-[6px]">Website</span><br />{card.school.website}</p>
          <p className="opacity-85 text-[6px]">Issued: {card.issue_date} · Exp: {card.expiry_date}</p>
          <p className="mt-1.5 rounded-md bg-black/15 p-1.5 text-[6px] italic leading-snug opacity-90">{card.back_note}</p>
        </div>
      </div>
    </CardShell>
  )
}

interface IdCardTemplateProps {
  card: IdCardViewData
  showBothSides?: boolean
  scale?: number
  className?: string
}

export function IdCardTemplate({ card, showBothSides = true, scale = 1, className }: IdCardTemplateProps) {
  if (!showBothSides) {
    return <IdCardFront card={card} scale={scale} className={className} />
  }

  return (
    <div className={`flex flex-wrap items-start justify-center gap-4 ${className ?? ''}`}>
      <IdCardFront card={card} scale={scale} />
      <IdCardBack card={card} scale={scale} />
    </div>
  )
}
