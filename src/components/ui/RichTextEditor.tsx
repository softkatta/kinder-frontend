import { useEffect, useRef } from 'react'
import {
  Bold, Italic, Underline, List, ListOrdered, Undo2, Redo2,
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface RichTextEditorProps {
  label?: string
  value: string
  onChange: (html: string) => void
  hint?: string
  className?: string
  minHeight?: number
}

function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value)
}

export function RichTextEditor({
  label,
  value,
  onChange,
  hint,
  className,
  minHeight = 160,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const lastExternal = useRef(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement === el) return
    if (value !== lastExternal.current || el.innerHTML !== (value || '')) {
      el.innerHTML = value || ''
      lastExternal.current = value
    }
  }, [value])

  const emit = () => {
    const html = ref.current?.innerHTML ?? ''
    const normalized = html === '<br>' || html === '<div><br></div>' ? '' : html
    lastExternal.current = normalized
    onChange(normalized)
  }

  return (
    <div className={cn('rich-editor', className)}>
      {label ? <label className="rich-editor-label">{label}</label> : null}
      <div className="rich-editor-shell">
        <div className="rich-editor-toolbar" role="toolbar">
          <button type="button" className="rich-editor-btn" title="Bold" onMouseDown={(e) => { e.preventDefault(); exec('bold') }}>
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rich-editor-btn" title="Italic" onMouseDown={(e) => { e.preventDefault(); exec('italic') }}>
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rich-editor-btn" title="Underline" onMouseDown={(e) => { e.preventDefault(); exec('underline') }}>
            <Underline className="h-3.5 w-3.5" />
          </button>
          <span className="rich-editor-sep" />
          <button type="button" className="rich-editor-btn" title="Bullet list" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }}>
            <List className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rich-editor-btn" title="Numbered list" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList') }}>
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <span className="rich-editor-sep" />
          <button type="button" className="rich-editor-btn" title="Undo" onMouseDown={(e) => { e.preventDefault(); exec('undo') }}>
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rich-editor-btn" title="Redo" onMouseDown={(e) => { e.preventDefault(); exec('redo') }}>
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div
          ref={ref}
          className="rich-editor-surface"
          style={{ minHeight }}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          aria-label={label}
          onInput={emit}
          onBlur={emit}
        />
      </div>
      {hint ? <p className="rich-editor-hint">{hint}</p> : null}
    </div>
  )
}

/** Allow basic formatting tags only for safe public HTML rendering. */
export function sanitizeBasicHtml(input: string): string {
  if (!input) return ''
  if (typeof window === 'undefined') {
    return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  }

  const doc = new DOMParser().parseFromString(input, 'text/html')
  const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'DIV', 'SPAN'])

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes)
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (!allowed.has(el.tagName)) {
          el.replaceWith(...Array.from(el.childNodes))
          continue
        }
        for (const attr of Array.from(el.attributes)) {
          el.removeAttribute(attr.name)
        }
        walk(el)
      } else if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child)
      }
    }
  }

  walk(doc.body)
  return doc.body.innerHTML
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}
