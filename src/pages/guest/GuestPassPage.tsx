import { useEffect, useState } from 'react'
import { guestApi } from '@/api/services'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBadge, AdminRecordFields } from '@/components/admin/AdminUi'
import { AdminAvatar } from '@/components/admin/AdminStats'
import { portalBreadcrumbs, guestPortalConfig } from '@/config/erpPortals'
import type { GuestViewData } from '@/components/guest/GuestVerifyPanel'

export default function GuestPassPage() {
  const [profile, setProfile] = useState<GuestViewData | null>(null)

  useEffect(() => {
    guestApi.portalProfile()
      .then((res) => setProfile(res.data.data as GuestViewData))
      .catch(() => setProfile(null))
  }, [])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="My Guest Pass"
        subtitle="Show this QR code at the school gate for quick entry."
        breadcrumbs={portalBreadcrumbs(guestPortalConfig.portalLabel, guestPortalConfig.homePath, 'My Pass')}
      />

      {!profile ? (
        <p className="text-sm text-slate-500">Loading pass...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminPanel title="QR Pass">
            <div className="flex flex-col items-center gap-4 py-4">
              {profile.qr_data_uri ? (
                <img
                  src={profile.qr_data_uri}
                  alt="Guest QR pass"
                  className="h-52 w-52 rounded-2xl border-2 border-violet-100 shadow-md"
                />
              ) : (
                <p className="text-sm text-slate-500">QR not available</p>
              )}
              <AdminBadge tone={profile.is_scannable ? 'success' : 'neutral'}>
                {profile.is_scannable ? 'Valid for scan' : 'Pass not active'}
              </AdminBadge>
            </div>
          </AdminPanel>

          <AdminPanel title="Guest Details">
            <div className="flex items-center gap-4 mb-4">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="" className="h-16 w-16 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <AdminAvatar name={profile.full_name} size="lg" />
              )}
              <div>
                <p className="font-display text-lg font-bold text-ink">{profile.full_name}</p>
                <p className="text-sm text-slate-500">{profile.event_name}</p>
              </div>
            </div>
            <AdminRecordFields
              fields={[
                { label: 'Event Date', value: profile.event_date ?? '—' },
                { label: 'Location', value: profile.event_location ?? '—' },
                { label: 'Valid From', value: profile.valid_from },
                { label: 'Valid Until', value: profile.valid_until },
                { label: 'Companions', value: String(profile.companions.length) },
              ]}
            />
          </AdminPanel>
        </div>
      )}
    </AdminPageShell>
  )
}
