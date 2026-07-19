import { AdminStatGrid, type AdminStatItem } from '@/components/admin/AdminStats'
import { AdminPanel } from '@/components/admin/AdminUi'
import { adminImages } from '@/config/adminCatalog'

interface StatItem {
  label: string
  value: string | number
  change?: string
}

interface StatGridProps {
  stats: StatItem[]
}

const statImages = [adminImages.classroom, adminImages.nursery, adminImages.playground, adminImages.about]
const statTones: NonNullable<AdminStatItem['tone']>[] = ['violet', 'sky', 'emerald', 'amber']

export function StatGrid({ stats }: StatGridProps) {
  const enriched: AdminStatItem[] = stats.map((stat, i) => ({
    ...stat,
    image: statImages[i % statImages.length],
    tone: statTones[i % statTones.length],
  }))
  return <AdminStatGrid stats={enriched} />
}

interface ListCardProps {
  title: string
  items: { title: string; meta?: string }[]
}

export function ListCard({ title, items }: ListCardProps) {
  return (
    <AdminPanel title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No items yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
              <span className="font-medium text-ink">{item.title}</span>
              {item.meta && <span className="shrink-0 text-xs text-slate-500">{item.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  )
}
