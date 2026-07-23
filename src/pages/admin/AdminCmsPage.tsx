import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Globe, Eye, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminBtn, AdminBadge, AdminTableActions, AdminModal } from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { CmsMetaFields } from '@/components/admin/CmsMetaFields'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormGrid, FormStack } from '@/components/ui/Form'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { VideoUpload } from '@/components/ui/VideoUpload'
import api from '@/api/client'
import type { AxiosError } from 'axios'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'
import { metaFromForm, metaToForm, CMS_PUBLIC_PATH } from '@/utils/cmsFormMeta'
import { getCmsFormLabels } from '@/config/cmsFormLabels'

interface CmsItem {
  id: number
  type: string
  slug: string | null
  title: string
  summary: string | null
  body: string | null
  image: string | null
  meta?: Record<string, unknown> | null
  status: string
  sort_order: number
}

const CMS_TYPES = [
  { key: 'banner', label: 'Hero Slides' },
  { key: 'notice', label: 'Notices' },
  { key: 'program', label: 'Programs' },
  { key: 'facility', label: 'Facilities' },
  { key: 'activity', label: 'Activities' },
  { key: 'event', label: 'Events' },
  { key: 'blog', label: 'Blog' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'video', label: 'Video Gallery' },
  { key: 'faq', label: 'FAQs' },
  { key: 'job', label: 'Jobs / Careers' },
  { key: 'page', label: 'Legal Pages' },
  { key: 'testimonial', label: 'Testimonials' },
  { key: 'staff', label: 'Staff' },
  { key: 'curriculum', label: 'Curriculum' },
] as const

const emptyForm = {
  type: 'program',
  slug: '',
  title: '',
  summary: '',
  body: '',
  image: '',
  status: 'published',
  sort_order: 0,
}

export default function AdminCmsPage() {
  const [searchParams] = useSearchParams()
  const initialType = (() => {
    const q = searchParams.get('type')
    if (q === 'hero') return 'banner'
    return q || 'program'
  })()
  const [type, setType] = useState<string>(initialType)
  const [items, setItems] = useState<CmsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CmsItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formMeta, setFormMeta] = useState<Record<string, string | boolean>>({})

  useEffect(() => {
    const q = searchParams.get('type')
    if (q) setType(q === 'hero' ? 'banner' : q)
  }, [searchParams])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/cms/items', { params: { type } })
      setItems(res.data.data ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { load() }, [load])

  const nextSortOrder = () => {
    if (items.length === 0) return 1
    return Math.max(...items.map((i) => Number(i.sort_order) || 0)) + 1
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, type, sort_order: nextSortOrder() })
    setFormMeta(metaToForm(type, {}))
    setModalOpen(true)
  }

  const openEdit = (item: CmsItem) => {
    setEditing(item)
    setForm({
      type: item.type,
      slug: item.slug ?? '',
      title: item.title,
      summary: item.summary ?? '',
      body: item.body ?? '',
      image: item.image ?? '',
      status: item.status,
      sort_order: item.sort_order,
    })
    setFormMeta(metaToForm(item.type, item.meta ?? {}))
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        summary: form.summary || null,
        body: form.body || null,
        image: form.image || null,
        meta: metaFromForm(form.type, formMeta),
      }
      if (editing) {
        await api.put(`/cms/items/${editing.id}`, payload)
        toast.success('Updated')
      } else {
        await api.post('/cms/items', payload)
        toast.success('Created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      const ax = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>
      const errors = ax.response?.data?.errors
      const first = errors ? Object.values(errors).flat()[0] : undefined
      toast.error(first || ax.response?.data?.message || 'Save failed')
    }
  }

  const { selection, bulkDelete, dropFromSelection, bulkDeleting } = useTableBulkDelete<CmsItem>({
    deleteOne: async (id) => { await api.delete(`/cms/items/${id}`) },
    onDone: load,
    confirmMany: (ids) => {
      const hasEvent = items.some((i) => ids.includes(i.id) && i.type === 'event')
      return hasEvent
        ? `Permanently delete ${ids.length} item(s)?\n\nEvents will also remove linked live streams and cameras. This cannot be undone.`
        : `Permanently delete ${ids.length} item(s)?\n\nThey will be removed from the website. This cannot be undone.`
    },
  })

  const remove = async (id: number) => {
    const item = items.find((r) => r.id === id)
    const isEvent = item?.type === 'event'
    const msg = isEvent
      ? 'Permanently delete this event?\n\nThe linked live stream and all cameras will also be removed from the website. This cannot be undone.'
      : 'Permanently delete this item?\n\nIt will be removed from the website. This cannot be undone.'
    if (!confirm(msg)) return
    try {
      await api.delete(`/cms/items/${id}`)
      dropFromSelection(id)
      toast.success('Permanently deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const viewPublic = (item: CmsItem) => {
    const slug = item.slug
    if (!slug) {
      toast.error('No slug set')
      return
    }
    const build = CMS_PUBLIC_PATH[item.type]
    if (!build) {
      toast('No public page for this type')
      return
    }
    window.open(build(slug), '_blank', 'noopener,noreferrer')
  }

  const publicHref = (item: CmsItem) => {
    if (!item.slug) return undefined
    const build = CMS_PUBLIC_PATH[item.type]
    return build ? build(item.slug) : undefined
  }

  const typeLabel = CMS_TYPES.find((t) => t.key === type)?.label ?? type
  const formLabels = getCmsFormLabels(form.type)

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Website CMS"
        subtitle="Manage all public website content â€” programs, events, jobs, blog, and more."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Website CMS' }]}
        actions={
          <div className="flex flex-wrap gap-2">
            {type === 'job' && (
              <AdminBtn variant="secondary" to="/admin/job-applications">
                <ClipboardList className="h-4 w-4" /> Applications
              </AdminBtn>
            )}
            <AdminBtn variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add {typeLabel.slice(0, -1)}
            </AdminBtn>
          </div>
        }
      />

      <div className="admin-cms-layout">
        <aside className="admin-cms-sidebar">
          <p className="admin-sidebar-label px-3">Content Types</p>
          <nav className="space-y-1 p-2">
            {CMS_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                className={`admin-cms-type-btn ${type === t.key ? 'admin-cms-type-btn--active' : ''}`}
              >
                <Globe className="h-4 w-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          {type === 'banner' && (
            <p className="mb-4 rounded-xl border border-sky-100 bg-primary-50/50 px-4 py-3 text-sm text-slate-600">
              Each slide below is one carousel image + heading. Use <strong>Sort Order</strong> 1, 2, 3 for sequence. Upload a wide photo (1920Ã—1080 recommended).
            </p>
          )}
          {loading ? (
            <p className="text-slate-400 text-sm py-12 text-center">Loading...</p>
          ) : (
            <AdminDataTable<CmsItem>
              key={type}
              data={items}
              rowKey={(row) => row.id}
              onRefresh={load}
              title={typeLabel}
              subtitle={`${items.length} items`}
              searchPlaceholder="Search title, slug..."
              searchKeys={['title', 'slug', 'summary']}
              pageSize={8}
              selection={selection}
              onBulkDelete={bulkDelete}
              bulkDeleting={bulkDeleting}
              initialSort={{ key: 'sort_order', dir: 'asc' }}
              getSortValue={(row, key) => {
                if (key === 'sort_order') return Number(row.sort_order) || 0
                if (key === 'title') return row.title
                if (key === 'slug') return row.slug ?? ''
                return ''
              }}
              columns={[
                {
                  key: 'sort_order',
                  header: 'Order',
                  sortable: true,
                  className: 'font-mono text-xs text-slate-600 w-16',
                  cell: (r) => r.sort_order,
                },
                { key: 'title', header: 'Title', sortable: true, cell: (r) => <span className="font-semibold text-ink">{r.title}</span> },
                { key: 'slug', header: 'Slug', sortable: true, className: 'font-mono text-xs text-slate-500', cell: (r) => r.slug ?? 'â€”' },
                { key: 'status', header: 'Status', cell: (r) => <AdminBadge tone={r.status === 'published' ? 'success' : 'warning'}>{r.status}</AdminBadge> },
                {
                  key: 'actions',
                  header: 'Actions',
                  headerClassName: 'text-right',
                  className: 'text-right',
                  cell: (r) => (
                    <AdminTableActions
                      actions={[
                        publicHref(r)
                          ? { label: 'View', icon: Eye, href: publicHref(r), external: true }
                          : { label: 'View', icon: Eye, onClick: () => viewPublic(r) },
                        { label: 'Edit', icon: Pencil, onClick: () => openEdit(r) },
                        { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => remove(r.id) },
                      ]}
                    />
                  ),
                },
              ]}
            />
          )}
        </div>
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editing ? 'Edit' : 'Add'} ${typeLabel.slice(0, -1)}`}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={save}>Save</AdminBtn>
          </>
        }
      >
        <FormStack>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label={`${formLabels.title} (English)`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input
              label={`${formLabels.title} (मराठी)`}
              value={String(formMeta.title_mr ?? '')}
              onChange={(e) => setFormMeta({ ...formMeta, title_mr: e.target.value })}
            />
          </div>
          <Input label={formLabels.slug} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="font-mono text-sm" />
          {form.type !== 'banner' && form.type !== 'notice' && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Textarea label={`${formLabels.summary} (English)`} rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
                <Textarea
                  label={`${formLabels.summary} (मराठी)`}
                  rows={3}
                  value={String(formMeta.summary_mr ?? '')}
                  onChange={(e) => setFormMeta({ ...formMeta, summary_mr: e.target.value })}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Textarea label={`${formLabels.body} (English)`} rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                <Textarea
                  label={`${formLabels.body} (मराठी)`}
                  rows={4}
                  value={String(formMeta.body_mr ?? '')}
                  onChange={(e) => setFormMeta({ ...formMeta, body_mr: e.target.value })}
                />
              </div>
            </>
          )}
          {form.type === 'banner' && (
            <div className="grid gap-3 md:grid-cols-2">
              <Textarea label={`${formLabels.summary} (English)`} rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              <Textarea
                label={`${formLabels.summary} (मराठी)`}
                rows={2}
                value={String(formMeta.summary_mr ?? '')}
                onChange={(e) => setFormMeta({ ...formMeta, summary_mr: e.target.value })}
              />
            </div>
          )}
          {form.type !== 'notice' && (
            <ImageUpload
              label={formLabels.image}
              value={form.image}
              onChange={(path) => setForm({ ...form, image: path })}
            />
          )}
          {form.type === 'video' && (
            <VideoUpload
              value={String(formMeta.video_url ?? '')}
              onChange={(path) => setFormMeta({ ...formMeta, video_url: path })}
            />
          )}
          <CmsMetaFields
            type={form.type}
            meta={formMeta}
            onChange={(key, value) => setFormMeta({ ...formMeta, [key]: value })}
          />
          <FormGrid cols={2}>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
            <Input
              label="Sort Order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              hint={form.type === 'banner' ? 'Homepage carousel sequence: 1, 2, 3â€¦' : 'Lower numbers appear first'}
            />
          </FormGrid>
        </FormStack>
      </AdminModal>
    </AdminPageShell>
  )
}

