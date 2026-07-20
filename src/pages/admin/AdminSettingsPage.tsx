import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'
import {
  Building2, Bell, CreditCard, Globe, Save, ExternalLink, ChevronRight, Send, RotateCcw, Radio,
  Home, BookOpen, Images, Phone, Mail, MessageCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHero, AdminPanel, AdminBtn, AdminPageShell } from '@/components/admin/AdminUi'
import { AdminBgCard } from '@/components/admin/AdminStats'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormGrid } from '@/components/ui/Form'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { ImageCropUpload } from '@/components/ui/ImageCropUpload'
import { ProfileMrBlock, ProfileMrInput, ProfileMrTextarea } from '@/components/admin/ProfileMrFields'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { adminImages } from '@/config/adminCatalog'
import { mediaUrl } from '@/utils/mediaUrl'
import { invalidateAllPublicSettings } from '@/hooks/useSchoolBranding'
import { apiErrorMessage } from '@/api/client'
import {
  dashboardApi,
  settingsApi,
  type SettingsIntegrations,
  type SettingsNotification,
  type SettingsPayments,
  type SettingsProfile,
} from '@/api/services'
import { SETTINGS_TAB_IMAGES, WEBSITE_PAGE_TABS, type ProfileImageKey, type WebsitePageTabId } from '@/config/pageImages'
import { ensureEcho, resetEchoConfig } from '@/realtime/echo'

type TabId =
  | 'branding' | 'homepage' | 'about' | 'contact' | WebsitePageTabId | 'website'
  | 'email' | 'whatsapp' | 'broadcast' | 'notifications' | 'payments'

interface SettingsTab {
  id: TabId
  label: string
  icon: LucideIcon
  desc: string
}

interface TabGroup {
  label: string
  tabs: SettingsTab[]
}

const pageSettingTabs: SettingsTab[] = WEBSITE_PAGE_TABS.map((page) => ({
  id: page.id,
  label: page.label,
  icon: Images,
  desc: page.desc,
}))

const tabGroups: TabGroup[] = [
  {
    label: 'School website',
    tabs: [
      { id: 'branding', label: 'Branding', icon: Building2, desc: 'Name, logo, favicon, cover & SEO meta' },
      { id: 'homepage', label: 'Homepage', icon: Home, desc: 'Sections, CTA & photos' },
      { id: 'about', label: 'About', icon: BookOpen, desc: 'Text, values & photos' },
      { id: 'contact', label: 'Contact', icon: Phone, desc: 'Top bar, page & hero photo' },
      ...pageSettingTabs,
      { id: 'website', label: 'CMS Content', icon: Globe, desc: 'Programs, events & blog' },
    ],
  },
  {
    label: 'Communication',
    tabs: [
      { id: 'email', label: 'Email (SMTP)', icon: Mail, desc: 'Outgoing mail server' },
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, desc: 'Twilio or Meta API' },
      { id: 'broadcast', label: 'Broadcast', icon: Radio, desc: 'Realtime / Reverb' },
      { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Event alerts' },
    ],
  },
  {
    label: 'Payments',
    tabs: [
      { id: 'payments', label: 'Payment Gateway', icon: CreditCard, desc: 'Razorpay & methods' },
    ],
  },
]

const tabs = tabGroups.flatMap((g) => g.tabs)

const PROFILE_TABS: TabId[] = [
  'branding',
  'homepage',
  'about',
  'contact',
  ...WEBSITE_PAGE_TABS.map((p) => p.id),
]
const INTEGRATION_TABS: TabId[] = ['email', 'whatsapp', 'broadcast']

const defaultNotifications: SettingsNotification[] = [
  { key: 'new_admission', event: 'New admission applications', channel: 'Email + Push', enabled: true, desc: 'When a parent submits admission form', channels: { email: true, whatsapp: false, push: true } },
  { key: 'fee_payment', event: 'Fee payment received', channel: 'Email + WhatsApp + Push', enabled: true, desc: 'On successful online payments', channels: { email: true, whatsapp: true, push: true } },
  { key: 'attendance_summary', event: 'Daily attendance summary', channel: 'Email + Push', enabled: true, desc: 'End-of-day report for all classes', channels: { email: true, whatsapp: false, push: true } },
  { key: 'job_application', event: 'Job applications', channel: 'Email + Push', enabled: true, desc: 'When someone applies via careers page', channels: { email: true, whatsapp: false, push: true } },
  { key: 'contact_inquiry', event: 'Contact form inquiries', channel: 'Email + Push', enabled: true, desc: 'When someone submits the website contact form', channels: { email: true, whatsapp: false, push: true } },
]

const emptyProfile: SettingsProfile = {
  name: '',
  short_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  hours: '',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  twitter_url: '',
  linkedin_url: '',
  map_embed_url: '',
  latitude: '',
  longitude: '',
  meta_title: '',
  meta_description: '',
  meta_image: '',
  logo_image: adminImages.nursery,
  cover_image: adminImages.campus,
}

const emptyPayments: SettingsPayments = {
  enable_razorpay: false,
  razorpay_key_id: '',
  razorpay_webhook_secret: '',
  enable_online_payments: false,
  enable_cash: true,
  enable_upi_manual: true,
  enable_qr: true,
}

const emptyIntegrations: SettingsIntegrations = {
  email: {
    enabled: false,
    mailer: 'smtp',
    host: '',
    port: 587,
    username: '',
    encryption: 'tls',
    from_address: '',
    from_name: '',
  },
  whatsapp: {
    enabled: false,
    provider: 'twilio',
    account_sid: '',
    from_number: '',
    phone_number_id: '',
  },
  broadcast: {
    enabled: true,
    driver: 'reverb',
    app_id: '',
    key: '',
    cluster: 'mt1',
    host: 'localhost',
    port: 8080,
    scheme: 'http',
  },
}

function mergeIntegrations(raw?: Partial<SettingsIntegrations> | null): SettingsIntegrations {
  return {
    email: { ...emptyIntegrations.email, ...raw?.email },
    whatsapp: { ...emptyIntegrations.whatsapp, ...raw?.whatsapp },
    broadcast: { ...emptyIntegrations.broadcast, ...raw?.broadcast },
  }
}

interface CmsSectionSummary {
  title: string
  type: string
  count: number
  published: number
  status: string
}

function SettingsImageFields({
  tabId,
  profile,
  setProfile,
  title = 'Page images',
  desc = 'Photos shown on the public website for this section.',
  solo = false,
}: {
  tabId: string
  profile: SettingsProfile
  setProfile: Dispatch<SetStateAction<SettingsProfile>>
  title?: string
  desc?: string
  solo?: boolean
}) {
  const fields = SETTINGS_TAB_IMAGES[tabId]
  if (!fields?.length) return null

  return (
    <div className={`admin-settings-form-section${solo ? '' : ' border-t border-slate-100'}`}>
      <h3 className="admin-settings-form-section-title">{title}</h3>
      <p className="admin-settings-form-section-desc">{desc}</p>
      <FormGrid>
        {fields.map((field) => (
          <div key={field.key} className="span-2 sm:span-1">
            <ImageUpload
              label={field.label}
              value={profile[field.key as ProfileImageKey] || ''}
              onChange={(path) => setProfile((p) => ({ ...p, [field.key]: path }))}
            />
          </div>
        ))}
      </FormGrid>
    </div>
  )
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<TabId>('branding')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [profile, setProfile] = useState<SettingsProfile>(emptyProfile)
  const [integrations, setIntegrations] = useState<SettingsIntegrations>(emptyIntegrations)
  const [notifications, setNotifications] = useState<SettingsNotification[]>(defaultNotifications)
  const [payments, setPayments] = useState<SettingsPayments>(emptyPayments)
  const [testEmailTo, setTestEmailTo] = useState('')
  const [testWhatsappTo, setTestWhatsappTo] = useState('')
  const [cmsSections, setCmsSections] = useState<CmsSectionSummary[]>([])
  const [cmsLoading, setCmsLoading] = useState(false)
  const activeTab = tabs.find((t) => t.id === tab)!

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await settingsApi.get()
      const data = res.data.data
      setProfile({
        ...emptyProfile,
        ...data.profile,
        logo_image: data.profile.logo_image || adminImages.nursery,
        cover_image: data.profile.cover_image || adminImages.campus,
      })
      setIntegrations(mergeIntegrations(data.integrations))
      setNotifications(data.notifications?.length ? data.notifications : defaultNotifications)
      setPayments({ ...emptyPayments, ...data.payments })
    } catch {
      toast.error('Settings load failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCmsSummary = useCallback(async () => {
    setCmsLoading(true)
    try {
      const res = await dashboardApi.cmsSummary()
      setCmsSections(res.data.data ?? [])
    } catch {
      setCmsSections([])
    } finally {
      setCmsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSettings()
    void loadCmsSummary()
  }, [loadSettings, loadCmsSummary])

  const saveSettings = async () => {
    if (tab === 'website') {
      toast('Website content is managed in CMS', { icon: 'ℹ️' })
      return
    }

    setSaving(true)
    try {
      const placeholderUrls = new Set(
        Object.values(adminImages).flatMap((value) => (Array.isArray(value) ? value : [value])),
      )
      const profileForSave = { ...profile }
      if (profileForSave.logo_image && placeholderUrls.has(profileForSave.logo_image)) {
        delete profileForSave.logo_image
      }
      if (profileForSave.cover_image && placeholderUrls.has(profileForSave.cover_image)) {
        delete profileForSave.cover_image
      }

      const payload = PROFILE_TABS.includes(tab)
        ? { profile: profileForSave }
        : INTEGRATION_TABS.includes(tab)
          ? {
              integrations: {
                email: {
                  ...integrations.email,
                  password: integrations.email.password || undefined,
                },
                whatsapp: {
                  ...integrations.whatsapp,
                  auth_token: integrations.whatsapp.auth_token || undefined,
                  access_token: integrations.whatsapp.access_token || undefined,
                },
                broadcast: {
                  ...integrations.broadcast,
                  secret: integrations.broadcast.secret || undefined,
                },
              },
            }
          : tab === 'notifications'
            ? {
                notifications: notifications.map((row) => ({
                  event: row.event,
                  enabled: row.enabled,
                  channels: row.channels,
                })),
              }
            : {
                payments: {
                  razorpay_key_id: payments.razorpay_key_id,
                  razorpay_webhook_secret: payments.razorpay_webhook_secret || undefined,
                  enable_online_payments: payments.enable_online_payments,
                  enable_cash: payments.enable_cash,
                  enable_upi_manual: payments.enable_upi_manual,
                  enable_qr: payments.enable_qr,
                },
              }

      const res = await settingsApi.update(payload)
      const data = res.data.data
      setProfile({
        ...emptyProfile,
        ...data.profile,
        logo_image: data.profile.logo_image || adminImages.nursery,
        cover_image: data.profile.cover_image || adminImages.campus,
      })
      const mergedIntegrations = mergeIntegrations(data.integrations)
      setIntegrations({
        ...mergedIntegrations,
        email: { ...mergedIntegrations.email, password: '' },
        whatsapp: { ...mergedIntegrations.whatsapp, auth_token: '', access_token: '' },
        broadcast: { ...mergedIntegrations.broadcast, secret: '' },
      })
      setNotifications(data.notifications?.length ? data.notifications : defaultNotifications)
      setPayments({ ...emptyPayments, ...data.payments, razorpay_webhook_secret: '' })
      if (INTEGRATION_TABS.includes(tab)) {
        resetEchoConfig()
      }
      invalidateAllPublicSettings(queryClient)
      toast.success('Settings saved')
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const testIntegration = async (type: 'email' | 'whatsapp' | 'broadcast') => {
    setTesting(type)
    try {
      if (type === 'broadcast') {
        await ensureEcho()
      }
      const res = await settingsApi.testIntegration({
        type,
        to: type === 'email' ? testEmailTo || undefined : type === 'whatsapp' ? testWhatsappTo || undefined : undefined,
      })
      toast.success(res.data.message || 'Test sent')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Test failed')
    } finally {
      setTesting(null)
    }
  }

  const toggleNotification = (event: string, enabled: boolean) => {
    setNotifications((rows) => rows.map((row) => (row.event === event ? { ...row, enabled } : row)))
  }

  const toggleNotificationChannel = (event: string, channel: 'email' | 'whatsapp' | 'push', enabled: boolean) => {
    setNotifications((rows) => rows.map((row) => (
      row.event === event
        ? { ...row, channels: { ...row.channels, [channel]: enabled } }
        : row
    )))
  }

  const resetSettings = () => {
    void loadSettings()
    toast.success('Form reset to last saved values')
  }

  return (
    <AdminPageShell className="space-y-5">
      <AdminPageHero
        badge="Configuration"
        title="Platform Settings"
        subtitle="Manage platform configuration, integrations, and security"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Settings' }]}
        image={adminImages.campus}
        actions={
          tab !== 'website' ? (
            <>
              <AdminBtn variant="primary" onClick={() => void saveSettings()} disabled={loading || saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </AdminBtn>
              <AdminBtn variant="secondary" onClick={resetSettings} disabled={loading || saving}>
                <RotateCcw className="h-4 w-4" />
                Reset Settings
              </AdminBtn>
            </>
          ) : (
            <Link to="/admin/cms" className="admin-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white">
              Open CMS <ExternalLink className="h-4 w-4" />
            </Link>
          )
        }
      />

      <div className="admin-settings-layout">
        <aside className="admin-settings-nav">
          {tabGroups.map((group) => (
            <div key={group.label}>
              <p className="admin-settings-nav-label">{group.label}</p>
              {group.tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`admin-settings-tab ${tab === t.id ? 'admin-settings-tab--active' : ''}`}
                >
                  <t.icon className="h-5 w-5 shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-[11px] text-slate-500 truncate">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <div className="admin-settings-content space-y-6">
          <div className="admin-settings-tab-header">
            <activeTab.icon className="h-6 w-6 text-primary-600 shrink-0" />
            <div>
              <h2 className="font-display text-xl font-bold text-ink">{activeTab.label}</h2>
              <p className="text-sm text-slate-500">{activeTab.desc}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading settings...</p>
          ) : (
            <>
              {tab === 'branding' && (
                <>
                  <AdminBgCard
                    image={mediaUrl(profile.cover_image) || adminImages.campus}
                    overlay="sky"
                    className="admin-settings-hero min-h-[180px]"
                    contentClassName="flex h-full min-h-[180px] flex-col justify-end p-6"
                  >
                    <div
                      className="absolute bottom-4 left-6 h-16 w-16 rounded-2xl ring-4 ring-white shadow-xl bg-cover bg-center z-20"
                      style={{ backgroundImage: `url(${mediaUrl(profile.logo_image) || adminImages.nursery})` }}
                    />
                    <div className="pl-20">
                      <p className="font-display text-xl font-bold text-white">{profile.name}</p>
                      <p className="text-sm text-white/80">School profile & branding</p>
                    </div>
                  </AdminBgCard>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <ImageUpload label="Cover Photo" value={profile.cover_image || ''} onChange={(cover_image) => setProfile((p) => ({ ...p, cover_image }))} />
                    <ImageCropUpload
                      label="School Logo"
                      hint="Wide crop (3:1) — fits navbar best"
                      cropTitle="Crop school logo"
                      aspect={3}
                      outputWidth={900}
                      outputHeight={300}
                      previewMode="wide"
                      value={profile.logo_image || ''}
                      onChange={(logo_image) => setProfile((p) => ({ ...p, logo_image }))}
                    />
                    <ImageCropUpload
                      label="Favicon"
                      hint="Square crop — browser tab icon"
                      cropTitle="Crop favicon"
                      aspect={1}
                      outputWidth={192}
                      outputHeight={192}
                      previewMode="square"
                      value={profile.favicon_image || ''}
                      onChange={(favicon_image) => setProfile((p) => ({ ...p, favicon_image }))}
                    />
                  </div>

                  <div className="admin-settings-form-card">
                    <div className="admin-settings-form-section">
                      <h3 className="admin-settings-form-section-title">School Identity</h3>
                      <p className="admin-settings-form-section-desc">Navbar brand, footer, and public pages</p>
                      <FormGrid>
                        <Input label="Full school name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                        <Input label="Short name (navbar)" value={profile.short_name || ''} onChange={(e) => setProfile((p) => ({ ...p, short_name: e.target.value }))} placeholder="e.g. Little Stars" />
                        <ProfileMrBlock>
                          <Input
                            label="Full school name (मराठी)"
                            value={profile.name_mr || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, name_mr: e.target.value }))}
                            placeholder="उदा. लिटल स्टार्स किंडरगार्टन"
                          />
                          <ProfileMrInput profile={profile} setProfile={setProfile} field="short_name" label="Short name" placeholder="उदा. लिटल स्टार्स" />
                        </ProfileMrBlock>
                      </FormGrid>
                    </div>
                  </div>

                  <div className="admin-settings-form-card">
                    <div className="admin-settings-form-section">
                      <h3 className="admin-settings-form-section-title">SEO / Meta details</h3>
                      <p className="admin-settings-form-section-desc">
                        Browser tab title, Google snippet, and WhatsApp / Facebook link preview. Meta image works best at about 1200×630.
                      </p>
                      <FormGrid>
                        <div className="span-2">
                          <Input
                            label="Meta title"
                            value={profile.meta_title || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, meta_title: e.target.value }))}
                            placeholder={profile.name || 'Little Stars Kindergarten'}
                            hint="Leave blank to use the school name"
                          />
                        </div>
                        <div className="span-2">
                          <Textarea
                            label="Meta description"
                            rows={3}
                            value={profile.meta_description || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, meta_description: e.target.value }))}
                            placeholder="Short description for search results and social sharing (about 150–160 characters)."
                          />
                        </div>
                        <ProfileMrBlock>
                          <ProfileMrInput profile={profile} setProfile={setProfile} field="meta_title" label="Meta title" />
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="meta_description" label="Meta description" rows={3} />
                        </ProfileMrBlock>
                        <div className="span-2">
                          <ImageUpload
                            label="Meta / social preview image"
                            value={profile.meta_image || ''}
                            onChange={(meta_image) => setProfile((p) => ({ ...p, meta_image }))}
                          />
                          <p className="mt-1.5 text-xs text-slate-400">
                            If empty, cover photo is used for link previews.
                          </p>
                        </div>
                      </FormGrid>
                    </div>
                  </div>
                </>
              )}

              {tab === 'contact' && (
                <div className="admin-settings-form-card">
                  <div className="admin-settings-form-section">
                    <h3 className="admin-settings-form-section-title">Contact details</h3>
                    <p className="admin-settings-form-section-desc">Top bar on every public page and contact page info</p>
                    <FormGrid>
                      <Input label="Phone" value={profile.phone || ''} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                      <Input label="Email" type="email" value={profile.email || ''} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                      <Input label="Area / street address" value={profile.address || ''} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} placeholder="e.g. talni" />
                      <Input label="City" value={profile.city || ''} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} placeholder="e.g. Pune" />
                      <div className="span-2">
                        <Input label="Operating hours" value={profile.hours || ''} onChange={(e) => setProfile((p) => ({ ...p, hours: e.target.value }))} placeholder="Mon – Sat: 8:00 AM – 4:00 PM" />
                      </div>
                      <ProfileMrBlock>
                        <ProfileMrInput profile={profile} setProfile={setProfile} field="address" label="Address" placeholder="उदा. तालनी" />
                        <ProfileMrInput profile={profile} setProfile={setProfile} field="city" label="City" placeholder="उदा. हडगाव" />
                        <ProfileMrInput profile={profile} setProfile={setProfile} field="hours" label="Operating hours" placeholder="सोम – शनि: सकाळी ८ – संध्या ४" />
                      </ProfileMrBlock>
                    </FormGrid>
                  </div>

                  <div className="admin-settings-form-section">
                    <h3 className="admin-settings-form-section-title">Social media</h3>
                    <p className="admin-settings-form-section-desc">Shown in the website footer under contact details. Leave blank to hide an icon.</p>
                    <FormGrid>
                      <Input label="Facebook URL" value={profile.facebook_url || ''} onChange={(e) => setProfile((p) => ({ ...p, facebook_url: e.target.value }))} placeholder="https://facebook.com/yourpage" />
                      <Input label="Instagram URL" value={profile.instagram_url || ''} onChange={(e) => setProfile((p) => ({ ...p, instagram_url: e.target.value }))} placeholder="https://instagram.com/yourpage" />
                      <Input label="YouTube URL" value={profile.youtube_url || ''} onChange={(e) => setProfile((p) => ({ ...p, youtube_url: e.target.value }))} placeholder="https://youtube.com/@yourchannel" />
                      <Input label="X (Twitter) URL" value={profile.twitter_url || ''} onChange={(e) => setProfile((p) => ({ ...p, twitter_url: e.target.value }))} placeholder="https://x.com/yourhandle" />
                      <div className="span-2">
                        <Input label="LinkedIn URL" value={profile.linkedin_url || ''} onChange={(e) => setProfile((p) => ({ ...p, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/company/yourschool" />
                      </div>
                    </FormGrid>
                  </div>

                  <div className="admin-settings-form-section">
                    <h3 className="admin-settings-form-section-title">Map</h3>
                    <p className="admin-settings-form-section-desc">Footer and contact page map. Address is used by default; optional lat/lng or embed URL for precise pin.</p>
                    <FormGrid>
                      <Input label="Latitude" value={profile.latitude || ''} onChange={(e) => setProfile((p) => ({ ...p, latitude: e.target.value }))} placeholder="19.4950" />
                      <Input label="Longitude" value={profile.longitude || ''} onChange={(e) => setProfile((p) => ({ ...p, longitude: e.target.value }))} placeholder="77.2080" />
                      <div className="span-2">
                        <Input
                          label="Map embed URL (optional)"
                          value={profile.map_embed_url || ''}
                          onChange={(e) => setProfile((p) => ({ ...p, map_embed_url: e.target.value }))}
                          placeholder="https://www.google.com/maps/embed?pb=..."
                        />
                      </div>
                    </FormGrid>
                  </div>

                  <SettingsImageFields tabId="contact" profile={profile} setProfile={setProfile} title="Contact page photo" desc="Hero banner on /contact" />
                </div>
              )}

              {tab === 'homepage' && (
                <div className="admin-settings-form-card">
                  <div className="admin-settings-form-section">
                    <h3 className="admin-settings-form-section-title">Homepage sections</h3>
                      <p className="admin-settings-form-section-desc">
                        About, Why Choose Us, Learning, Enroll steps &amp; CTA. Use one line per paragraph; for lists use{' '}
                        <code className="text-xs bg-slate-100 px-1 rounded">title|description</code> per line.
                        Learning items: <code className="text-xs bg-slate-100 px-1 rounded">key|title|description</code>.
                      </p>
                      <FormGrid>
                        <Input label="About — label" value={profile.home_about_label || ''} onChange={(e) => setProfile((p) => ({ ...p, home_about_label: e.target.value }))} />
                        <Input label="About — title" value={profile.home_about_title || ''} onChange={(e) => setProfile((p) => ({ ...p, home_about_title: e.target.value }))} />
                        <div className="span-2">
                          <Textarea
                            label="About — paragraphs"
                            hint="One paragraph per line"
                            rows={4}
                            value={profile.home_about_paragraphs || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, home_about_paragraphs: e.target.value }))}
                          />
                        </div>
                        <Input label="Why — label" value={profile.home_why_label || ''} onChange={(e) => setProfile((p) => ({ ...p, home_why_label: e.target.value }))} />
                        <Input label="Why — title" value={profile.home_why_title || ''} onChange={(e) => setProfile((p) => ({ ...p, home_why_title: e.target.value }))} />
                        <Input label="Why — panel title" value={profile.home_why_panel_title || ''} onChange={(e) => setProfile((p) => ({ ...p, home_why_panel_title: e.target.value }))} />
                        <Input label="Why — panel description" value={profile.home_why_panel_desc || ''} onChange={(e) => setProfile((p) => ({ ...p, home_why_panel_desc: e.target.value }))} />
                        <div className="span-2">
                          <Textarea
                            label="Why choose us items"
                            hint="One per line: Title|Description"
                            rows={5}
                            value={profile.home_why_choose || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, home_why_choose: e.target.value }))}
                          />
                        </div>
                        <Input label="Learning — label" value={profile.home_learning_label || ''} onChange={(e) => setProfile((p) => ({ ...p, home_learning_label: e.target.value }))} />
                        <Input label="Learning — title accent" value={profile.home_learning_title_accent || ''} onChange={(e) => setProfile((p) => ({ ...p, home_learning_title_accent: e.target.value }))} />
                        <Input label="Learning — title rest" value={profile.home_learning_title_rest || ''} onChange={(e) => setProfile((p) => ({ ...p, home_learning_title_rest: e.target.value }))} />
                        <div className="span-2">
                          <Textarea
                            label="Learning — paragraphs"
                            rows={3}
                            value={profile.home_learning_paragraphs || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, home_learning_paragraphs: e.target.value }))}
                          />
                        </div>
                        <div className="span-2">
                          <Textarea
                            label="Learning — activity items"
                            hint="One per line: key|title|description (e.g. art|Art|Colours and crafts)"
                            rows={5}
                            value={profile.home_learning_items || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, home_learning_items: e.target.value }))}
                          />
                        </div>
                        <div className="span-2">
                          <Textarea
                            label="Enroll steps"
                            hint="One per line: Step title|Description"
                            rows={4}
                            value={profile.home_enroll_steps || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, home_enroll_steps: e.target.value }))}
                          />
                        </div>
                        <Input label="CTA — title" value={profile.home_cta_title || ''} onChange={(e) => setProfile((p) => ({ ...p, home_cta_title: e.target.value }))} />
                        <Input label="CTA — subtitle" value={profile.home_cta_subtitle || ''} onChange={(e) => setProfile((p) => ({ ...p, home_cta_subtitle: e.target.value }))} />
                        <ProfileMrBlock>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_about_label" label="About — label" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_about_title" label="About — title" />
                          </div>
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="home_about_paragraphs" label="About — paragraphs" rows={4} hint="एक परिच्छेद प्रति ओळ" />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_why_label" label="Why — label" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_why_title" label="Why — title" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_why_panel_title" label="Why — panel title" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_why_panel_desc" label="Why — panel description" />
                          </div>
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="home_why_choose" label="Why choose us items" rows={5} hint="प्रति ओळ: शीर्षक|वर्णन" />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_learning_label" label="Learning — label" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_learning_title_accent" label="Learning — title accent" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_learning_title_rest" label="Learning — title rest" />
                          </div>
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="home_learning_paragraphs" label="Learning — paragraphs" rows={3} />
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="home_learning_items" label="Learning — activity items" rows={5} hint="प्रति ओळ: key|शीर्षक|वर्णन" />
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="home_enroll_steps" label="Enroll steps" rows={4} hint="प्रति ओळ: पायरी|वर्णन" />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_cta_title" label="CTA — title" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="home_cta_subtitle" label="CTA — subtitle" />
                          </div>
                        </ProfileMrBlock>
                      </FormGrid>
                  </div>
                  <SettingsImageFields tabId="homepage" profile={profile} setProfile={setProfile} title="Homepage section photos" desc="About Us and Why Choose Us blocks on the homepage" />
                </div>
              )}

              {tab === 'about' && (
                <div className="admin-settings-form-card">
                  <div className="admin-settings-form-section">
                    <h3 className="admin-settings-form-section-title">About page</h3>
                      <p className="admin-settings-form-section-desc">
                        Principal message, values &amp; timeline shown on <code className="text-xs bg-slate-100 px-1 rounded">/about</code>.
                        Values: <code className="text-xs bg-slate-100 px-1 rounded">title|description</code> per line.
                        Timeline: <code className="text-xs bg-slate-100 px-1 rounded">year|title|description</code> per line.
                      </p>
                      <FormGrid>
                        <Input label="Established year" value={profile.established_year || ''} onChange={(e) => setProfile((p) => ({ ...p, established_year: e.target.value }))} placeholder="2015" />
                        <Input label="Principal name" value={profile.principal_name || ''} onChange={(e) => setProfile((p) => ({ ...p, principal_name: e.target.value }))} />
                        <div className="span-2">
                          <RichTextEditor
                            label="Principal message"
                            value={profile.principal_message || ''}
                            onChange={(principal_message) => setProfile((p) => ({ ...p, principal_message }))}
                            hint="Use the toolbar for bold, lists, and paragraphs"
                            minHeight={180}
                          />
                        </div>
                        <div className="span-2">
                          <ImageCropUpload
                            label="Principal photo"
                            hint="Square crop — shown with principal message on /about"
                            cropTitle="Crop principal photo"
                            aspect={1}
                            outputWidth={600}
                            outputHeight={600}
                            previewMode="square"
                            value={profile.principal_image || ''}
                            onChange={(principal_image) => setProfile((p) => ({ ...p, principal_image }))}
                          />
                        </div>
                        <Input label="Values — label" value={profile.about_values_label || ''} onChange={(e) => setProfile((p) => ({ ...p, about_values_label: e.target.value }))} />
                        <Input label="Values — title" value={profile.about_values_title || ''} onChange={(e) => setProfile((p) => ({ ...p, about_values_title: e.target.value }))} />
                        <div className="span-2">
                          <Textarea
                            label="Values items"
                            hint="One per line: Title|Description"
                            rows={5}
                            value={profile.about_values || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, about_values: e.target.value }))}
                          />
                        </div>
                        <Input label="Journey — label" value={profile.about_journey_label || ''} onChange={(e) => setProfile((p) => ({ ...p, about_journey_label: e.target.value }))} />
                        <Input label="Journey — title" value={profile.about_journey_title || ''} onChange={(e) => setProfile((p) => ({ ...p, about_journey_title: e.target.value }))} />
                        <div className="span-2">
                          <Textarea
                            label="Timeline"
                            hint="One per line: Year|Title|Description"
                            rows={5}
                            value={profile.about_timeline || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, about_timeline: e.target.value }))}
                          />
                        </div>
                        <div className="span-2">
                          <Textarea label="Vision" rows={2} value={profile.vision || ''} onChange={(e) => setProfile((p) => ({ ...p, vision: e.target.value }))} />
                        </div>
                        <div className="span-2">
                          <Textarea label="Mission" rows={2} value={profile.mission || ''} onChange={(e) => setProfile((p) => ({ ...p, mission: e.target.value }))} />
                        </div>
                        <ProfileMrBlock>
                          <ProfileMrInput profile={profile} setProfile={setProfile} field="principal_name" label="Principal name" />
                          <RichTextEditor
                            label="Principal message (मराठी)"
                            value={profile.principal_message_mr || ''}
                            onChange={(principal_message_mr) => setProfile((p) => ({ ...p, principal_message_mr }))}
                            minHeight={160}
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="about_values_label" label="Values — label" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="about_values_title" label="Values — title" />
                          </div>
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="about_values" label="Values items" rows={5} hint="प्रति ओळ: शीर्षक|वर्णन" />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="about_journey_label" label="Journey — label" />
                            <ProfileMrInput profile={profile} setProfile={setProfile} field="about_journey_title" label="Journey — title" />
                          </div>
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="about_timeline" label="Timeline" rows={5} hint="प्रति ओळ: वर्ष|शीर्षक|वर्णन" />
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="vision" label="Vision" rows={2} />
                          <ProfileMrTextarea profile={profile} setProfile={setProfile} field="mission" label="Mission" rows={2} />
                        </ProfileMrBlock>
                      </FormGrid>
                  </div>
                  <SettingsImageFields tabId="about" profile={profile} setProfile={setProfile} title="About page photos" desc="Hero banner and story collage on /about" />
                </div>
              )}

              {WEBSITE_PAGE_TABS.map((page) =>
                tab === page.id ? (
                  <div key={page.id} className="admin-settings-form-card">
                    <SettingsImageFields
                      tabId={page.id}
                      profile={profile}
                      setProfile={setProfile}
                      title={`${page.label} page`}
                      desc={page.desc}
                      solo
                    />
                  </div>
                ) : null,
              )}

              {tab === 'email' && (
                <AdminPanel
                    title="Email (SMTP)"
                    subtitle="Send admission, payment, and admin alerts via email"
                    action={
                      <AdminBtn variant="secondary" onClick={() => void testIntegration('email')} disabled={testing === 'email'}>
                        <Send className="h-4 w-4" /> {testing === 'email' ? 'Sending...' : 'Test Email'}
                      </AdminBtn>
                    }
                  >
                    <div className="space-y-4">
                      <Checkbox
                        label="Enable email notifications"
                        checked={!!integrations.email.enabled}
                        onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, enabled: e.target.checked } }))}
                      />
                      <FormGrid>
                        <Select label="Mailer" value={integrations.email.mailer || 'smtp'} onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, mailer: e.target.value } }))}>
                          <option value="smtp">SMTP</option>
                          <option value="log">Log (dev only)</option>
                        </Select>
                        <Input label="SMTP Host" value={integrations.email.host || ''} onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, host: e.target.value } }))} placeholder="smtp.gmail.com" />
                        <Input label="Port" type="number" value={integrations.email.port ?? ''} onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, port: Number(e.target.value) } }))} />
                        <Select label="Encryption" value={integrations.email.encryption || 'tls'} onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, encryption: e.target.value } }))}>
                          <option value="tls">TLS</option>
                          <option value="ssl">SSL</option>
                          <option value="">None</option>
                        </Select>
                        <Input label="Username" value={integrations.email.username || ''} onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, username: e.target.value } }))} />
                        <Input
                          label="Password"
                          type="password"
                          placeholder={integrations.email.password_set ? '•••••••• (saved)' : 'SMTP password'}
                          value={integrations.email.password || ''}
                          onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, password: e.target.value } }))}
                        />
                        <Input label="From Email" type="email" value={integrations.email.from_address || ''} onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, from_address: e.target.value } }))} />
                        <Input label="From Name" value={integrations.email.from_name || ''} onChange={(e) => setIntegrations((i) => ({ ...i, email: { ...i.email, from_name: e.target.value } }))} />
                        <div className="span-2">
                          <Input label="Test recipient email" type="email" value={testEmailTo} onChange={(e) => setTestEmailTo(e.target.value)} placeholder="admin@school.com" hint="Save settings first, then send test" />
                        </div>
                      </FormGrid>
                    </div>
                  </AdminPanel>
              )}

              {tab === 'broadcast' && (
                  <AdminPanel
                    id="integration-broadcast"
                    title="Broadcast (Realtime)"
                    subtitle="Pusher / Laravel Reverb — live streams, admin alerts & realtime updates"
                    action={
                      <AdminBtn variant="secondary" onClick={() => void testIntegration('broadcast')} disabled={testing === 'broadcast'}>
                        <Send className="h-4 w-4" /> {testing === 'broadcast' ? 'Sending...' : 'Test Connection'}
                      </AdminBtn>
                    }
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
                        <Radio className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600">
                          Enable broadcast for live event switching and admin notifications. Local dev: run{' '}
                          <code className="bg-white px-1 rounded text-xs">php artisan reverb:start</code> and set{' '}
                          <code className="bg-white px-1 rounded text-xs">VITE_REVERB_ENABLED=true</code> in frontend env.
                        </p>
                      </div>
                      <Checkbox
                        label="Enable broadcast / realtime push"
                        checked={!!integrations.broadcast?.enabled}
                        onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, enabled: e.target.checked } }))}
                      />
                      <FormGrid>
                        <Select label="Driver" value={integrations.broadcast?.driver || 'reverb'} onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, driver: e.target.value as 'reverb' | 'pusher' | 'log' } }))}>
                          <option value="reverb">Laravel Reverb (self-hosted)</option>
                          <option value="pusher">Pusher Cloud</option>
                          <option value="log">Log only (dev)</option>
                        </Select>
                        <Input label="App ID" value={integrations.broadcast?.app_id || ''} onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, app_id: e.target.value } }))} />
                        <Input label="App Key" value={integrations.broadcast?.key || ''} onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, key: e.target.value } }))} className="font-mono text-sm" />
                        <Input
                          label="App Secret"
                          type="password"
                          placeholder={integrations.broadcast?.secret_set ? '•••••••• (saved)' : 'App secret'}
                          value={integrations.broadcast?.secret || ''}
                          onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, secret: e.target.value } }))}
                        />
                        <Input label="Host" value={integrations.broadcast?.host || ''} onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, host: e.target.value } }))} placeholder="localhost" />
                        <Input label="Port" type="number" value={integrations.broadcast?.port ?? ''} onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, port: Number(e.target.value) } }))} />
                        <Select label="Scheme" value={integrations.broadcast?.scheme || 'http'} onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, scheme: e.target.value } }))}>
                          <option value="http">HTTP (ws)</option>
                          <option value="https">HTTPS (wss)</option>
                        </Select>
                        {integrations.broadcast?.driver === 'pusher' && (
                          <Input label="Cluster" value={integrations.broadcast?.cluster || ''} onChange={(e) => setIntegrations((i) => ({ ...i, broadcast: { ...i.broadcast, cluster: e.target.value } }))} placeholder="ap2" />
                        )}
                      </FormGrid>
                    </div>
                  </AdminPanel>
              )}

              {tab === 'whatsapp' && (
                  <AdminPanel
                    title="WhatsApp"
                    subtitle="Twilio or Meta Cloud API for WhatsApp alerts"
                    action={
                      <AdminBtn variant="secondary" onClick={() => void testIntegration('whatsapp')} disabled={testing === 'whatsapp'}>
                        <Send className="h-4 w-4" /> {testing === 'whatsapp' ? 'Sending...' : 'Test WhatsApp'}
                      </AdminBtn>
                    }
                  >
                    <div className="space-y-4">
                      <Checkbox
                        label="Enable WhatsApp notifications"
                        checked={!!integrations.whatsapp.enabled}
                        onChange={(e) => setIntegrations((i) => ({ ...i, whatsapp: { ...i.whatsapp, enabled: e.target.checked } }))}
                      />
                      <FormGrid>
                        <Select label="Provider" value={integrations.whatsapp.provider || 'twilio'} onChange={(e) => setIntegrations((i) => ({ ...i, whatsapp: { ...i.whatsapp, provider: e.target.value as 'twilio' | 'meta' } }))}>
                          <option value="twilio">Twilio WhatsApp</option>
                          <option value="meta">Meta Cloud API</option>
                        </Select>
                        {integrations.whatsapp.provider === 'meta' ? (
                          <>
                            <Input label="Phone Number ID" value={integrations.whatsapp.phone_number_id || ''} onChange={(e) => setIntegrations((i) => ({ ...i, whatsapp: { ...i.whatsapp, phone_number_id: e.target.value } }))} />
                            <Input
                              label="Access Token"
                              type="password"
                              placeholder={integrations.whatsapp.access_token_set ? '•••••••• (saved)' : 'Permanent access token'}
                              value={integrations.whatsapp.access_token || ''}
                              onChange={(e) => setIntegrations((i) => ({ ...i, whatsapp: { ...i.whatsapp, access_token: e.target.value } }))}
                            />
                          </>
                        ) : (
                          <>
                            <Input label="Account SID" value={integrations.whatsapp.account_sid || ''} onChange={(e) => setIntegrations((i) => ({ ...i, whatsapp: { ...i.whatsapp, account_sid: e.target.value } }))} className="font-mono text-sm" />
                            <Input
                              label="Auth Token"
                              type="password"
                              placeholder={integrations.whatsapp.auth_token_set ? '•••••••• (saved)' : 'Twilio auth token'}
                              value={integrations.whatsapp.auth_token || ''}
                              onChange={(e) => setIntegrations((i) => ({ ...i, whatsapp: { ...i.whatsapp, auth_token: e.target.value } }))}
                            />
                            <div className="span-2">
                              <Input label="From Number" value={integrations.whatsapp.from_number || ''} onChange={(e) => setIntegrations((i) => ({ ...i, whatsapp: { ...i.whatsapp, from_number: e.target.value } }))} placeholder="whatsapp:+14155238886" hint="Twilio WhatsApp sender number" />
                            </div>
                          </>
                        )}
                        <div className="span-2">
                          <Input label="Test phone number" value={testWhatsappTo} onChange={(e) => setTestWhatsappTo(e.target.value)} placeholder="+91 98765 43210" hint="Include country code — save settings first" />
                        </div>
                      </FormGrid>
                    </div>
                  </AdminPanel>
              )}

              {tab === 'notifications' && (
                <AdminPanel title="Notification Preferences" subtitle="Choose events and delivery channels (Email, WhatsApp, Realtime)" noPadding>
                  <div className="divide-y divide-slate-100">
                    {notifications.map((row) => (
                      <div key={row.event} className="px-5 py-4 hover:bg-primary-50/30 space-y-3">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex-1 min-w-[200px]">
                            <p className="font-semibold text-ink">{row.event}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{row.desc}</p>
                          </div>
                          <Checkbox label="Enabled" checked={row.enabled} onChange={(e) => toggleNotification(row.event, e.target.checked)} />
                        </div>
                        <div className="flex flex-wrap gap-4 pl-0 sm:pl-1">
                          <Checkbox label="Email" checked={!!row.channels?.email} onChange={(e) => toggleNotificationChannel(row.event, 'email', e.target.checked)} />
                          <Checkbox label="WhatsApp" checked={!!row.channels?.whatsapp} onChange={(e) => toggleNotificationChannel(row.event, 'whatsapp', e.target.checked)} />
                          <Checkbox label="Realtime (Pusher)" checked={!!row.channels?.push} onChange={(e) => toggleNotificationChannel(row.event, 'push', e.target.checked)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </AdminPanel>
              )}

              {tab === 'payments' && (
                <>
                  <p className="admin-settings-sync-note">
                    Payment methods sync with <Link to="/admin/payments">Payments → UPI / QR / Cash Setup</Link>. Bank & UPI QR details are managed on the Payments page.
                  </p>
                  <AdminPanel title="Razorpay Integration" subtitle="Online fee collection via Razorpay gateway">
                    <FormGrid>
                      <Input label="Razorpay Key ID" placeholder="rzp_live_xxxxxxxx" className="font-mono text-sm" value={payments.razorpay_key_id || ''} onChange={(e) => setPayments((p) => ({ ...p, razorpay_key_id: e.target.value }))} />
                      <Input label="Webhook Secret" type="password" placeholder="••••••••••••" value={payments.razorpay_webhook_secret || ''} onChange={(e) => setPayments((p) => ({ ...p, razorpay_webhook_secret: e.target.value }))} />
                    </FormGrid>
                  </AdminPanel>
                  <AdminPanel title="Payment Methods" subtitle="Enable or disable payment channels for parents & admin">
                    <div className="space-y-3">
                      <Checkbox label="Razorpay online payments" checked={!!payments.enable_online_payments} onChange={(e) => setPayments((p) => ({ ...p, enable_online_payments: e.target.checked, enable_razorpay: e.target.checked }))} />
                      <Checkbox label="UPI manual verification" checked={!!payments.enable_upi_manual} onChange={(e) => setPayments((p) => ({ ...p, enable_upi_manual: e.target.checked }))} />
                      <Checkbox label="QR scan pay on website" checked={!!payments.enable_qr} onChange={(e) => setPayments((p) => ({ ...p, enable_qr: e.target.checked }))} />
                      <Checkbox label="Cash payment recording" checked={!!payments.enable_cash} onChange={(e) => setPayments((p) => ({ ...p, enable_cash: e.target.checked }))} />
                    </div>
                  </AdminPanel>
                </>
              )}

              {tab === 'website' && (
                <>
                  <div className="admin-settings-cms-banner">
                    <div>
                      <h3 className="font-display font-bold text-ink">Website Content Manager</h3>
                      <p className="text-sm text-slate-500 mt-1">Add, edit, or remove content on all public pages.</p>
                    </div>
                    <Link to="/admin/cms" className="admin-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white">
                      Open Full CMS <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {cmsLoading && cmsSections.length === 0 && (
                      <p className="text-sm text-slate-500 col-span-full py-4 text-center">Loading CMS summary...</p>
                    )}
                    {!cmsLoading && cmsSections.length === 0 && (
                      <p className="text-sm text-slate-500 col-span-full py-4 text-center">No CMS content in the database yet.</p>
                    )}
                    {cmsSections.map((section) => (
                      <Link key={section.type} to={`/admin/cms?type=${section.type}`} className="admin-settings-cms-card group">
                        <div>
                          <p className="font-display font-bold text-ink group-hover:text-primary-700 transition-colors">{section.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {section.count} items
                            {section.count > 0 ? ` · ${section.published} published · ${section.status}` : ''}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AdminPageShell>
  )
}
