import { IndianRupee } from 'lucide-react'
import type { ProgramPrices } from '@/utils/programPricing'

interface ProgramPricingProps {
  prices: ProgramPrices
  labels: { monthly: string; sixMonth: string; yearly: string }
  compact?: boolean
}

export function ProgramPricing({ prices, labels, compact = true }: ProgramPricingProps) {
  const rows = [
    prices.monthly ? { label: labels.monthly, value: prices.monthly } : null,
    prices.sixMonth ? { label: labels.sixMonth, value: prices.sixMonth } : null,
    prices.yearly ? { label: labels.yearly, value: prices.yearly } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row))

  if (!rows.length) return null

  if (rows.length === 1) {
    return (
      <span className="home-program-meta-item home-program-meta-item--price">
        <IndianRupee className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
        {rows[0]!.value}
      </span>
    )
  }

  return (
    <div className={compact ? 'home-program-pricing' : 'home-program-pricing home-program-pricing--full'}>
      {rows.map((row) => (
        <div key={row.label} className="home-program-pricing-row">
          <span className="home-program-pricing-label">{row.label}</span>
          <span className="home-program-pricing-value">
            <IndianRupee className="h-3 w-3 shrink-0" strokeWidth={2.25} />
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}
