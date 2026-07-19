import { useCallback, useState } from 'react'
import type { CanvasJson, TemplateField } from '@/types/templateDesigner'

const MAX_HISTORY = 40

export function useTemplateEditor(initial: CanvasJson) {
  const [canvas, setCanvas] = useState<CanvasJson>(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(0.7)
  const pastRef = { current: [] as CanvasJson[] }

  const commit = useCallback((next: CanvasJson) => {
    pastRef.current = [...pastRef.current.slice(-MAX_HISTORY + 1), canvas]
    setCanvas(next)
  }, [canvas])

  const objects = canvas.objects

  const updateObjects = useCallback((fn: (objs: TemplateField[]) => TemplateField[]) => {
    commit({ ...canvas, objects: fn(canvas.objects) })
  }, [canvas, commit])

  const addField = useCallback((field: TemplateField) => {
    updateObjects((objs) => [...objs, field])
    setSelectedId(field.id)
  }, [updateObjects])

  const updateField = useCallback((id: string, patch: Partial<TemplateField>) => {
    updateObjects((objs) => objs.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }, [updateObjects])

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    updateObjects((objs) => objs.filter((o) => o.id !== selectedId))
    setSelectedId(null)
  }, [selectedId, updateObjects])

  const duplicateSelected = useCallback(() => {
    const src = objects.find((o) => o.id === selectedId)
    if (!src) return
    const copy = { ...src, id: `fld_${Date.now().toString(36)}`, x: src.x + 5, y: src.y + 5 }
    updateObjects((objs) => [...objs, copy])
    setSelectedId(copy.id)
  }, [objects, selectedId, updateObjects])

  const selected = objects.find((o) => o.id === selectedId) ?? null

  const setShowGrid = (show: boolean) => commit({ ...canvas, settings: { ...canvas.settings, showGrid: show } })
  const setSnapToGrid = (snap: boolean) => commit({ ...canvas, settings: { ...canvas.settings, snapToGrid: snap } })

  const fitZoom = (containerW: number, pageW: number) => {
    const scale = (containerW - 48) / (pageW * 3.78)
    setZoom(Math.min(1.2, Math.max(0.35, scale)))
  }

  return {
    canvas,
    setCanvas,
    objects,
    selected,
    selectedId,
    setSelectedId,
    zoom,
    setZoom,
    addField,
    updateField,
    deleteSelected,
    duplicateSelected,
    setShowGrid,
    setSnapToGrid,
    fitZoom,
  }
}
