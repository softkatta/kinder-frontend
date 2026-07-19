import type { TemplateField } from '@/types/templateDesigner'
import { fieldDisplayName } from '@/types/templateDesigner'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { mediaUrl } from '@/utils/mediaUrl'

const FONTS = ['DejaVu Sans', 'DejaVu Serif', 'Georgia', 'Arial', 'Times New Roman']

interface Props {
  field: TemplateField | null
  onChange: (patch: Partial<TemplateField>) => void
  onDelete: () => void
  onDuplicate: () => void
  onReplaceAsset?: (file: File) => void
}

export function FieldPropertiesPanel({ field, onChange, onDelete, onDuplicate, onReplaceAsset }: Props) {
  if (!field) {
    return <p className="text-sm text-slate-500 p-4">Select an element on the canvas</p>
  }

  const isText = field.objectType === 'variable' && field.dataType === 'text'
  const isAsset = field.objectType === 'asset' || field.dataType === 'asset'
  const isLine = field.objectType === 'line' || field.dataType === 'line'
  const isGrid = field.objectType === 'grid' || field.dataType === 'grid'

  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-violet-700 truncate">{fieldDisplayName(field)}</span>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={onDuplicate} className="text-xs px-2 py-1 border rounded">Copy</button>
          <button type="button" onClick={onDelete} className="text-xs px-2 py-1 border rounded text-red-600">Delete</button>
        </div>
      </div>

      {isAsset && field.imageUrl && (
        <img src={mediaUrl(field.imageUrl)} alt="" className="w-full max-h-24 object-contain border rounded bg-slate-50" />
      )}

      {isAsset && onReplaceAsset && (
        <label className="block text-xs text-slate-500">
          Replace image
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="mt-1 w-full text-xs" onChange={(e) => e.target.files?.[0] && onReplaceAsset(e.target.files[0])} />
        </label>
      )}

      {isAsset && (
        <Input label="Label" value={field.label ?? ''} onChange={(e) => onChange({ label: e.target.value })} />
      )}

      <div className="grid grid-cols-2 gap-2">
        <Input label="X (mm)" type="number" value={field.x} onChange={(e) => onChange({ x: Number(e.target.value) })} />
        <Input label="Y (mm)" type="number" value={field.y} onChange={(e) => onChange({ y: Number(e.target.value) })} />
        <Input label="Width" type="number" value={field.width} onChange={(e) => onChange({ width: Number(e.target.value) })} />
        <Input label="Height" type="number" value={field.height} onChange={(e) => onChange({ height: Number(e.target.value) })} />
        <Input label="Rotation" type="number" value={field.rotation} onChange={(e) => onChange({ rotation: Number(e.target.value) })} />
      </div>

      {isLine && (
        <>
          <Select label="Direction" value={field.lineDirection ?? 'horizontal'} onChange={(e) => onChange({ lineDirection: e.target.value as TemplateField['lineDirection'] })}>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </Select>
          <Input label="Thickness (mm)" type="number" step="0.1" value={field.lineThickness ?? 0.4} onChange={(e) => onChange({ lineThickness: Number(e.target.value) })} />
          <Select label="Style" value={field.lineStyle ?? 'solid'} onChange={(e) => onChange({ lineStyle: e.target.value as TemplateField['lineStyle'] })}>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </Select>
          <label className="block text-xs text-slate-500">Color<input type="color" value={field.color ?? '#111111'} onChange={(e) => onChange({ color: e.target.value })} className="mt-1 w-full h-9" /></label>
        </>
      )}

      {isGrid && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Rows" type="number" min={1} value={field.gridRows ?? 4} onChange={(e) => onChange({ gridRows: Number(e.target.value) })} />
            <Input label="Columns" type="number" min={1} value={field.gridCols ?? 4} onChange={(e) => onChange({ gridCols: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={field.gridShowHeader ?? true} onChange={(e) => onChange({ gridShowHeader: e.target.checked })} />
            Show header row
          </label>
          <Input
            label="Headers (comma separated)"
            value={(field.gridHeaders ?? []).join(', ')}
            onChange={(e) => onChange({ gridHeaders: e.target.value.split(',').map((s) => s.trim()) })}
          />
          <Input label="Cell font size" type="number" value={field.cellFontSize ?? 9} onChange={(e) => onChange({ cellFontSize: Number(e.target.value) })} />
          <Input label="Border width (mm)" type="number" step="0.1" value={field.borderWidth ?? 0.3} onChange={(e) => onChange({ borderWidth: Number(e.target.value) })} />
          <label className="block text-xs text-slate-500">Border color<input type="color" value={field.borderColor ?? '#94a3b8'} onChange={(e) => onChange({ borderColor: e.target.value })} className="mt-1 w-full h-9" /></label>
        </>
      )}

      {isText && (
        <>
          <Select label="Font" value={field.fontFamily ?? 'DejaVu Sans'} onChange={(e) => onChange({ fontFamily: e.target.value })}>
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
          <Input label="Font size" type="number" value={field.fontSize ?? 14} onChange={(e) => {
            const fontSize = Number(e.target.value)
            const minH = Math.max(field.height, Math.ceil(fontSize * 0.4))
            onChange({ fontSize, height: minH })
          }} />
          <label className="block text-xs text-slate-500">Color<input type="color" value={field.color ?? '#111111'} onChange={(e) => onChange({ color: e.target.value })} className="mt-1 w-full h-9" /></label>
          <Select label="Align" value={field.textAlign ?? 'left'} onChange={(e) => onChange({ textAlign: e.target.value as TemplateField['textAlign'] })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </Select>
          <div className="flex flex-wrap gap-2">
            {(['bold', 'italic', 'underline'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ [k]: !field[k] })}
                className={`px-2 py-1 rounded border text-xs capitalize ${field[k] ? 'border-violet-500 bg-violet-50' : ''}`}
              >
                {k}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
