import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, studentPortalConfig } from '@/config/erpPortals'
import { portalApi } from '@/api/services'

interface RewardRow {
  title: string
  stars: number
  desc: string
}

export default function StudentRewardsPage() {
  const [rewards, setRewards] = useState<RewardRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.studentRewards()
      const data = res.data.data as { total?: number; rewards?: RewardRow[] }
      setTotal(data.total ?? 0)
      setRewards(data.rewards ?? [])
    } catch {
      toast.error('Could not load rewards')
      setRewards([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Star Rewards"
        subtitle={`You have ${total} stars — keep shining!`}
        breadcrumbs={portalBreadcrumbs(studentPortalConfig.portalLabel, studentPortalConfig.homePath, 'Rewards')}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rewards.map((r) => (
            <AdminPanel key={r.title} noPadding>
              <div className="p-5">
                <p className="text-2xl">⭐ {r.stars}</p>
                <p className="font-display font-bold text-ink mt-2">{r.title}</p>
                <p className="text-sm text-slate-500">{r.desc}</p>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}
