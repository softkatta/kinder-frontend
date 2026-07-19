import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Grid3X3, Maximize2, Save, ZoomIn, ZoomOut } from 'lucide-react'
import { templateDesignerApi, fileApi, idCardApi } from '@/api/services'
import { useTemplateEditor } from '@/hooks/useTemplateEditor'
import { TemplateCanvas } from '@/components/template-designer/TemplateCanvas'
import { FieldPropertiesPanel } from '@/components/template-designer/FieldPropertiesPanel'
import { AdminBtn } from '@/components/admin/AdminUi'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import type { CanvasJson, TemplateCategory, TemplateDetail, TemplateVariable, PaperSize, Orientation } from '@/types/templateDesigner'
import { emptyCanvas, newField, newAssetField, newLineField, newGridField, TEMPLATE_ASSET_PRESETS, CERTIFICATE_LAYOUT_FIELDS, CATEGORY_FIELD_GUIDES, isCertificateCategory } from '@/types/templateDesigner'
import { mediaUrl } from '@/utils/mediaUrl'
import { compressImageForUpload } from '@/utils/compressImage'

export default function TemplateDesignerEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const canvasWrap = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingAsset, setUploadingAsset] = useState(false)
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [variableSearch, setVariableSearch] = useState('')
  const [sampleData, setSampleData] = useState<Record<string, string>>({})
  const [students, setStudents] = useState<{ id: number; full_name: string; meta?: Record<string, unknown> }[]>([])
  const [previewStudentId, setPreviewStudentId] = useState('')
  const [meta, setMeta] = useState<{
    name: string
    category_id: string
    paper_size: PaperSize
    orientation: Orientation
    description: string
    is_active: boolean
    background_image?: string
    background_url?: string
  }>({
    name: '',
    category_id: '',
    paper_size: 'a4_portrait',
    orientation: 'portrait',
    description: '',
    is_active: true,
    background_image: '',
    background_url: '',
  })

  const initial = emptyCanvas()
  const editor = useTemplateEditor(initial)
  const {
    canvas, setCanvas, objects, selected, selectedId, setSelectedId,
    zoom, setZoom, addField, updateField, deleteSelected, duplicateSelected,
    setShowGrid, setSnapToGrid, fitZoom,
  } = editor
  const templateId = isNew ? null : Number(id)

  const loadVariables = useCallback(async (categorySlug?: string) => {
    const vRes = await templateDesignerApi.variables.list(categorySlug)
    setVariables(vRes.data.data ?? [])
  }, [])

  const backgroundInputRef = useRef<HTMLInputElement>(null)

  const loadPreviewData = useCallback(async (studentId?: number, categoryId?: string) => {
    const params: { student_id?: number; template_id?: number; category?: string } = {}
    if (studentId) params.student_id = studentId
    if (templateId) params.template_id = templateId
    else {
      const catId = categoryId ?? meta.category_id
      const cat = categories.find((c) => String(c.id) === catId)
      if (cat?.slug) params.category = cat.slug
    }
    const sRes = await templateDesignerApi.variables.sample(
      Object.keys(params).length ? params : undefined,
    )
    setSampleData(sRes.data.data ?? {})
  }, [templateId, categories, meta.category_id])

  const loadMeta = useCallback(async () => {
    const [cRes, stuRes] = await Promise.all([
      templateDesignerApi.categories.list(),
      idCardApi.list({ type: 'student', status: 'active' }),
    ])
    setCategories(cRes.data.data ?? [])
    const list = (stuRes.data.data ?? []) as { id: number; full_name: string; meta?: Record<string, unknown> }[]
    setStudents(list)
    const firstId = list[0]?.id
    if (firstId) setPreviewStudentId(String(firstId))
  }, [])

  const isCertLike = (slug?: string | null) =>
    !!slug && (isCertificateCategory(slug) || slug === 'bonafide' || slug === 'leaving_certificate')

  const onCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => String(c.id) === categoryId)
    const next = { ...meta, category_id: categoryId }

    if (isNew && cat && isCertLike(cat.slug)) {
      next.paper_size = 'a4_landscape'
      next.orientation = 'landscape'
      setCanvas({
        ...canvas,
        settings: { ...settings, width: 297, height: 210 },
      } as CanvasJson)

      if (!meta.background_image && cat.default_background_image && cat.default_background_url) {
        next.background_image = cat.default_background_image
        next.background_url = cat.default_background_url
      }
    }

    setMeta(next)
    void loadPreviewData(previewStudentId ? Number(previewStudentId) : undefined)
  }
  const selectedCategory = categories.find((c) => String(c.id) === meta.category_id)
  const filteredVariables = variables.filter((v) => {
    const q = variableSearch.trim().toLowerCase()
    if (!q) return true
    return v.key.includes(q) || v.label.toLowerCase().includes(q) || v.tag.toLowerCase().includes(q)
  })

  const loadTemplate = useCallback(async () => {
    if (!templateId) return
    setLoading(true)
    try {
      const res = await templateDesignerApi.templates.get(templateId)
      const t = res.data.data as TemplateDetail
      setMeta({
        name: t.name,
        category_id: String(t.category_id),
        paper_size: t.paper_size,
        orientation: t.orientation,
        description: t.description ?? '',
        is_active: t.is_active,
        background_image: t.background_image,
        background_url: t.background_url,
      })
      if (t.canvas_json) setCanvas(t.canvas_json)
    } catch {
      toast.error('Template not found')
      navigate('/admin/template-designer')
    } finally {
      setLoading(false)
    }
  }, [templateId, navigate, setCanvas])

  useEffect(() => {
    void loadMeta()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [])

  useEffect(() => {
    if (!previewStudentId && students.length === 0) return
    void loadPreviewData(previewStudentId ? Number(previewStudentId) : undefined)
  }, [previewStudentId, meta.category_id, templateId, students.length, loadPreviewData])
  useEffect(() => {
    const slug = selectedCategory?.slug
    if (slug) loadVariables(slug)
    else loadVariables()
  }, [selectedCategory?.slug, loadVariables])
  useEffect(() => { if (!isNew) loadTemplate() }, [isNew, loadTemplate])

  useEffect(() => {
    if (canvasWrap.current) fitZoom(canvasWrap.current.clientWidth, canvas.settings.width)
  }, [canvas.settings.width, fitZoom])

  const onPreviewStudentChange = async (studentId: string) => {
    setPreviewStudentId(studentId)
    await loadPreviewData(studentId ? Number(studentId) : undefined)
  }

  const previewParams = previewStudentId ? { student_id: Number(previewStudentId) } : undefined

  const persist = async () => {
    if (!meta.name || !meta.category_id) {
      toast.error('Name and category required')
      return
    }
    setSaving(true)
    const payload = {
      ...meta,
      category_id: Number(meta.category_id),
      background_image: meta.background_image || null,
      canvas_json: canvas,
    }
    try {
      if (templateId) {
        await templateDesignerApi.templates.update(templateId, payload)
        toast.success('Saved')
      } else {
        const res = await templateDesignerApi.templates.create(payload)
        const created = res.data.data as TemplateDetail
        toast.success('Created')
        navigate(`/admin/template-designer/${created.id}/edit`, { replace: true })
      }
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onBackgroundUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setMeta((m) => ({ ...m, background_image: '', background_url: previewUrl }))
    setUploading(true)
    try {
      const uploadFile = await compressImageForUpload(file)
      const fd = new FormData()
      fd.append('file', uploadFile)
      const res = await fileApi.uploadTemplateBackground(fd)
      const { path, url } = res.data.data as { path: string; url: string }
      URL.revokeObjectURL(previewUrl)
      setMeta((m) => ({ ...m, background_image: path, background_url: url }))
      toast.success(uploadFile.size < file.size ? 'Background uploaded (compressed for server)' : 'Background uploaded')
    } catch (err: unknown) {
      URL.revokeObjectURL(previewUrl)
      setMeta((m) => ({ ...m, background_image: '', background_url: '' }))
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Upload failed — use PNG, JPEG, or WebP (max 10 MB)'
      toast.error(msg)
    } finally {
      setUploading(false)
      if (backgroundInputRef.current) backgroundInputRef.current.value = ''
    }
  }

  const uploadAsset = async (file: File, targetId?: string) => {
    setUploadingAsset(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fileApi.uploadTemplateAsset(fd)
      const { path, url } = res.data.data as { path: string; url: string }
      if (targetId) {
        updateField(targetId, { imagePath: path, imageUrl: url, label: file.name.replace(/\.[^.]+$/, '') })
        toast.success('Icon updated')
      } else {
        addField(newAssetField(path, url, file.name.replace(/\.[^.]+$/, '')))
        toast.success('Icon added to canvas')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Icon upload failed'
      toast.error(msg)
    } finally {
      setUploadingAsset(false)
    }
  }

  const marksheetHeaders = ['Subject', 'Max', 'Obtained', 'Grade']
  const isMarksheet = selectedCategory?.slug === 'marksheet'

  const preview = async () => {
    if (!templateId) { toast.error('Save first'); return }
    try {
      const res = await templateDesignerApi.templates.preview(templateId, previewParams)
      const { html, css } = res.data.data as { html: string; css: string }
      const w = window.open('', '_blank')
      if (w) {
        const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || window.location.origin
        const landscape = meta.paper_size === 'a4_landscape'
        const pageW = landscape ? '297mm' : '210mm'
        const pageH = landscape ? '210mm' : '297mm'
        const pageCss = `html,body{margin:0;padding:0}.td-page{width:${pageW}!important;height:${pageH}!important;margin:0!important;overflow:hidden;position:relative}${css}`
        w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><base href="${apiOrigin}/"><style>${pageCss}</style></head><body style="margin:0;padding:16px;background:#e2e8f0;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${html}</body></html>`)
        w.document.close()
      }
    } catch {
      toast.error('Preview failed')
    }
  }

  if (loading) return <p className="p-8 text-slate-500">Loading editor...</p>

  const { settings } = canvas

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] -mx-4 lg:-mx-6">
      <div className="flex flex-wrap items-center gap-2 border-b bg-white dark:bg-slate-950 px-4 py-2">
        <Link to="/admin/template-designer" className="text-slate-500 hover:text-violet-600"><ArrowLeft className="h-5 w-5" /></Link>
        <Input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} placeholder="Template name" className="max-w-[180px]" />
        <Select value={meta.category_id} onChange={(e) => onCategoryChange(e.target.value)} className="max-w-[150px]">
          <option value="">Category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={meta.paper_size} onChange={(e) => {
          const ps = e.target.value as 'a4_portrait' | 'a4_landscape'
          const dims = ps === 'a4_landscape' ? [297, 210] : [210, 297]
          setMeta({ ...meta, paper_size: ps, orientation: ps === 'a4_landscape' ? 'landscape' : 'portrait' })
          setCanvas({ ...canvas, settings: { ...settings, width: dims[0], height: dims[1] } } as CanvasJson)
        }} className="max-w-[140px]">
          <option value="a4_portrait">A4 Portrait</option>
          <option value="a4_landscape">A4 Landscape</option>
        </Select>
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input type="checkbox" checked={meta.is_active} onChange={(e) => setMeta({ ...meta, is_active: e.target.checked })} />
          Active
        </label>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} className="p-2 rounded hover:bg-slate-100"><ZoomOut className="h-4 w-4" /></button>
          <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="p-2 rounded hover:bg-slate-100"><ZoomIn className="h-4 w-4" /></button>
          <button type="button" onClick={() => canvasWrap.current && fitZoom(canvasWrap.current.clientWidth, settings.width)} className="p-2 rounded hover:bg-slate-100" title="Fit"><Maximize2 className="h-4 w-4" /></button>
          <button type="button" onClick={() => setShowGrid(!settings.showGrid)} className={`p-2 rounded ${settings.showGrid ? 'bg-violet-100' : 'hover:bg-slate-100'}`} title="Grid"><Grid3X3 className="h-4 w-4" /></button>
          <AdminBtn variant="secondary" onClick={preview}>Preview</AdminBtn>
          <AdminBtn onClick={persist} disabled={saving}><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</AdminBtn>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <aside className="w-56 shrink-0 border-r bg-white dark:bg-slate-950 p-3 overflow-y-auto">
          <p className="text-xs font-bold text-violet-600 mb-2">Background</p>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="text-xs w-full"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && onBackgroundUpload(e.target.files[0])}
          />
          {meta.background_url && (
            <img src={mediaUrl(meta.background_url)} alt="" className="mt-2 w-full rounded border object-cover max-h-24" />
          )}
          {meta.background_url && (
            <button type="button" className="mt-2 text-xs text-red-600" onClick={() => setMeta({ ...meta, background_image: '', background_url: '' })}>Remove background</button>
          )}
          <p className="text-xs font-bold text-violet-600 mt-4 mb-1">Preview Data</p>
          <Select
            value={previewStudentId}
            onChange={(e) => onPreviewStudentChange(e.target.value)}
            className="w-full text-xs mb-3"
          >
            <option value="">First student (auto)</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </Select>
          <p className="text-[10px] text-slate-500 mb-3">Canvas shows real student & school data</p>

          <p className="text-xs font-bold text-violet-600 mt-2 mb-1">Design Elements</p>
          <p className="text-[10px] text-slate-500 mb-2">Icons, lines & tables for certificate / marksheet</p>
          <label className="block text-[11px] mb-2">
            <span className="font-medium">Upload Icon / Image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="w-full text-xs mt-1"
              disabled={uploadingAsset}
              onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0])}
            />
          </label>
          <div className="space-y-1 mb-2">
            {TEMPLATE_ASSET_PRESETS.map((preset) => (
              <button
                key={preset.path}
                type="button"
                onClick={() => addField(newAssetField(preset.path, preset.url, preset.label))}
                className="w-full text-left text-[11px] rounded px-2 py-1.5 border border-amber-200 hover:border-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
              >
                🏅 {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <button type="button" onClick={() => addField(newLineField('horizontal'))} className="text-[11px] rounded px-2 py-1.5 border hover:border-violet-400">— Line</button>
            <button type="button" onClick={() => addField(newLineField('vertical'))} className="text-[11px] rounded px-2 py-1.5 border hover:border-violet-400">| Line</button>
            <button
              type="button"
              onClick={() => addField(newGridField(isMarksheet ? 6 : 4, isMarksheet ? 4 : 3, isMarksheet ? marksheetHeaders : ['Col 1', 'Col 2', 'Col 3']))}
              className="col-span-2 text-[11px] rounded px-2 py-1.5 border hover:border-violet-400"
            >
              ▦ Add Table
            </button>
          </div>

          {(isCertificateCategory(selectedCategory?.slug) || selectedCategory?.slug === 'bonafide' || selectedCategory?.slug === 'leaving_certificate') && (
            <div className="mb-3 rounded border border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 p-2">
              <p className="text-[10px] font-bold text-blue-700 mb-1">{selectedCategory?.name} fields</p>
              {selectedCategory?.slug && CATEGORY_FIELD_GUIDES[selectedCategory.slug] ? (
                <>
                  <p className="text-[9px] font-semibold text-slate-600 mt-1">Common</p>
                  <ul className="text-[9px] text-slate-600 space-y-0.5 max-h-20 overflow-y-auto">
                    {CATEGORY_FIELD_GUIDES[selectedCategory.slug].common.map((k) => (
                      <li key={k}>• {`{{${k}}}`}</li>
                    ))}
                  </ul>
                  <p className="text-[9px] font-semibold text-slate-600 mt-1">Specific</p>
                  <ul className="text-[9px] text-slate-600 space-y-0.5 max-h-20 overflow-y-auto">
                    {CATEGORY_FIELD_GUIDES[selectedCategory.slug].specific.map((k) => (
                      <li key={k}>• {`{{${k}}}`}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <ul className="text-[9px] text-slate-600 space-y-0.5 max-h-24 overflow-y-auto">
                  {CERTIFICATE_LAYOUT_FIELDS.map((f) => (
                    <li key={f.key}>• {f.label}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="text-xs font-bold text-violet-600 mt-2 mb-1">Variables</p>
          {selectedCategory && (
            <p className="text-[10px] text-slate-500 mb-2">{selectedCategory.name} fields only</p>
          )}
          <input
            type="search"
            placeholder="Search..."
            value={variableSearch}
            className="w-full text-xs border rounded px-2 py-1 mb-2 dark:bg-slate-900"
            onChange={(e) => setVariableSearch(e.target.value)}
          />
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {filteredVariables.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => addField(newField(v))}
                className="w-full text-left text-[11px] rounded px-2 py-1.5 border border-slate-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                title={v.label}
              >
                <span className="font-mono">{v.tag}</span>
                <span className="block text-[10px] text-slate-500 truncate">{v.label}</span>
              </button>
            ))}
            {filteredVariables.length === 0 && (
              <p className="text-[10px] text-slate-500 px-1">Select a category to see document fields.</p>
            )}
          </div>
          <div className="mt-3 space-y-2">
            <Checkbox label="Snap to grid" checked={settings.snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
          </div>
        </aside>

        <div ref={canvasWrap} className="flex-1 overflow-auto p-6 bg-slate-100 dark:bg-slate-900 flex justify-center items-start">
          <TemplateCanvas
            widthMm={settings.width}
            heightMm={settings.height}
            backgroundUrl={meta.background_url}
            objects={objects}
            variables={variables}
            sampleData={sampleData}
            selectedId={selectedId}
            zoom={zoom}
            showGrid={settings.showGrid}
            snapGrid={settings.gridSize}
            snapEnabled={settings.snapToGrid}
            onSelect={setSelectedId}
            onMove={(fid, x, y) => updateField(fid, { x, y })}
            onResize={(fid, width, height) => updateField(fid, { width, height })}
          />
        </div>

        <aside className="w-64 shrink-0 border-l bg-white dark:bg-slate-950 overflow-y-auto">
          <FieldPropertiesPanel
            field={selected}
            onChange={(patch) => selected && updateField(selected.id, patch)}
            onDelete={deleteSelected}
            onDuplicate={duplicateSelected}
            onReplaceAsset={selected && (selected.objectType === 'asset' || selected.dataType === 'asset')
              ? (file) => uploadAsset(file, selected.id)
              : undefined}
          />
        </aside>
      </div>
    </div>
  )
}
