import { useRef } from 'react'
import type { TemplateField, TemplateVariable } from '@/types/templateDesigner'
import { mediaUrl } from '@/utils/mediaUrl'

const MM = 3.78

function snap(v: number, grid: number, enabled: boolean) {
  return enabled && grid > 0 ? Math.round(v / grid) * grid : v
}

interface Props {
  widthMm: number
  heightMm: number
  backgroundUrl?: string
  objects: TemplateField[]
  variables: TemplateVariable[]
  sampleData: Record<string, string>
  selectedId: string | null
  zoom: number
  showGrid: boolean
  snapGrid: number
  snapEnabled: boolean
  onSelect: (id: string | null) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, width: number, height: number) => void
}

function label(field: TemplateField, sample: Record<string, string>, variables: TemplateVariable[]) {
  if (field.objectType === 'asset' || field.dataType === 'asset') return field.label ?? 'Icon'
  if (field.objectType === 'line' || field.dataType === 'line') return field.label ?? 'Line'
  if (field.objectType === 'grid' || field.dataType === 'grid') return '▦ ' + (field.label ?? 'Table')

  const v = variables.find((x) => x.key === field.variableKey)
  if (field.dataType === 'table') return '▦ ' + (v?.label ?? field.variableKey)
  if (field.dataType === 'image' || field.dataType === 'signature') return '🖼 ' + (v?.label ?? field.variableKey)
  return sample[field.variableKey ?? ''] ?? `{{${field.variableKey}}}`
}

function gridPreview(field: TemplateField) {
  const rows = field.gridRows ?? 4
  const cols = field.gridCols ?? 4
  const headers = field.gridHeaders ?? []
  const showHeader = field.gridShowHeader ?? true
  const border = `${field.borderWidth ?? 0.3}mm solid ${field.borderColor ?? '#94a3b8'}`
  const fontSize = (field.cellFontSize ?? 9) * 0.85

  let html = `<table style="width:100%;border-collapse:collapse;font-size:${fontSize}pt;">`
  if (showHeader) {
    html += '<tr>'
    for (let c = 0; c < cols; c++) {
      html += `<th style="border:${border};padding:2px;background:#f1f5f9;">${headers[c] ?? `Col ${c + 1}`}</th>`
    }
    html += '</tr>'
  }
  const bodyRows = showHeader ? Math.max(1, rows - 1) : rows
  for (let r = 0; r < bodyRows; r++) {
    html += '<tr>'
    for (let c = 0; c < cols; c++) html += `<td style="border:${border};padding:2px;">&nbsp;</td>`
    html += '</tr>'
  }
  return html + '</table>'
}

export function TemplateCanvas({
  widthMm, heightMm, backgroundUrl, objects, variables, sampleData, selectedId,
  zoom, showGrid, snapGrid, snapEnabled, onSelect, onMove, onResize,
}: Props) {
  const dragRef = useRef<{ id: string; mode: 'move' | 'resize'; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number } | null>(null)

  const w = widthMm * MM * zoom
  const h = heightMm * MM * zoom

  const onPointerDown = (e: React.PointerEvent, obj: TemplateField, mode: 'move' | 'resize') => {
    e.stopPropagation()
    onSelect(obj.id)
    dragRef.current = {
      id: obj.id, mode, sx: e.clientX, sy: e.clientY,
      ox: obj.x, oy: obj.y, ow: obj.width, oh: obj.height,
    }
    const onMoveEv = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      const scale = MM * zoom
      if (d.mode === 'move') {
        onMove(d.id, snap(d.ox + (ev.clientX - d.sx) / scale, snapGrid, snapEnabled), snap(d.oy + (ev.clientY - d.sy) / scale, snapGrid, snapEnabled))
      } else {
        onResize(d.id, Math.max(1, snap(d.ow + (ev.clientX - d.sx) / scale, snapGrid, snapEnabled)), Math.max(1, snap(d.oh + (ev.clientY - d.sy) / scale, snapGrid, snapEnabled)))
      }
    }
    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('pointermove', onMoveEv)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMoveEv)
    document.addEventListener('pointerup', onUp)
  }

  const gridBg = showGrid
    ? `repeating-linear-gradient(0deg, transparent, transparent ${snapGrid * MM * zoom - 1}px, #e2e8f0 ${snapGrid * MM * zoom}px), repeating-linear-gradient(90deg, transparent, transparent ${snapGrid * MM * zoom - 1}px, #e2e8f0 ${snapGrid * MM * zoom}px)`
    : undefined

  return (
    <div
      className="relative bg-white shadow-xl border border-slate-200"
      style={{ width: w, height: h, backgroundImage: gridBg }}
      onClick={() => onSelect(null)}
    >
      {backgroundUrl && (
        <img
          src={mediaUrl(backgroundUrl)}
          alt=""
          className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      )}
      {objects.map((obj) => {
        const sel = obj.id === selectedId
        const isAsset = obj.objectType === 'asset' || obj.dataType === 'asset'
        const isVarImg = obj.objectType !== 'asset' && (obj.dataType === 'image' || obj.dataType === 'signature')
        const isLine = obj.objectType === 'line' || obj.dataType === 'line'
        const isGrid = obj.objectType === 'grid' || obj.dataType === 'grid'
        const isDynTable = obj.dataType === 'table' && obj.objectType !== 'grid'
        const varImgSrc = isVarImg ? sampleData[obj.variableKey ?? ''] : null
        const assetSrc = isAsset ? obj.imageUrl : null

        return (
          <div
            key={obj.id}
            onPointerDown={(e) => onPointerDown(e, obj, 'move')}
            onClick={(e) => e.stopPropagation()}
            className={`absolute z-10 select-none ${sel ? 'ring-2 ring-violet-600' : 'hover:ring-1 hover:ring-violet-300'}`}
            style={{
              left: obj.x * MM * zoom,
              top: obj.y * MM * zoom,
              width: obj.width * MM * zoom,
              minHeight: obj.height * MM * zoom,
              transform: `rotate(${obj.rotation}deg)`,
              fontFamily: obj.fontFamily,
              fontSize: (obj.fontSize ?? 12) * zoom,
              color: obj.color,
              fontWeight: obj.bold ? 700 : 400,
              fontStyle: obj.italic ? 'italic' : 'normal',
              textDecoration: obj.underline ? 'underline' : 'none',
              textAlign: obj.textAlign,
              cursor: 'grab',
              overflow: 'hidden',
            }}
          >
            {isAsset && assetSrc ? (
              <img src={mediaUrl(assetSrc)} alt="" className="w-full h-full object-contain pointer-events-none" />
            ) : isVarImg && varImgSrc ? (
              <img src={mediaUrl(varImgSrc)} alt="" className="w-full h-full object-contain pointer-events-none" />
            ) : isLine ? (
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                {obj.lineDirection === 'vertical' ? (
                  <div style={{ width: 0, height: '100%', borderLeft: `${(obj.lineThickness ?? 0.4) * zoom}mm ${obj.lineStyle ?? 'solid'} ${obj.color ?? '#111'}` }} />
                ) : (
                  <div style={{ width: '100%', height: 0, borderTop: `${(obj.lineThickness ?? 0.4) * zoom}mm ${obj.lineStyle ?? 'solid'} ${obj.color ?? '#111'}` }} />
                )}
              </div>
            ) : isGrid ? (
              <div className="w-full h-full overflow-hidden pointer-events-none" dangerouslySetInnerHTML={{ __html: gridPreview(obj) }} />
            ) : isDynTable && sampleData[obj.variableKey ?? ''] ? (
              <div className="block px-0.5 leading-tight text-[8px] overflow-auto max-h-full" dangerouslySetInnerHTML={{ __html: sampleData[obj.variableKey ?? ''] }} />
            ) : (
              <span className="block px-0.5 leading-tight">{label(obj, sampleData, variables)}</span>
            )}
            {sel && (
              <span
                onPointerDown={(e) => onPointerDown(e, obj, 'resize')}
                className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-sm bg-violet-600 border border-white"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
