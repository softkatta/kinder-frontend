import type { Dispatch, SetStateAction, ReactNode } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import type { SettingsProfile } from '@/api/services'
import { cn } from '@/utils/cn'

type ProfileSetter = Dispatch<SetStateAction<SettingsProfile>>

function setField(setProfile: ProfileSetter, key: string, value: string) {
  setProfile((p) => ({ ...p, [key]: value }))
}

function read(profile: SettingsProfile, key: string): string {
  return String((profile as Record<string, string | null | undefined>)[key] ?? '')
}

interface BilingualProps {
  profile: SettingsProfile
  setProfile: ProfileSetter
  field: string
  label: string
  placeholder?: string
  hint?: string
  className?: string
}

/** English + Marathi inputs side by side */
export function BilingualInput({
  profile,
  setProfile,
  field,
  label,
  placeholder,
  hint,
  className,
}: BilingualProps) {
  const mrKey = `${field}_mr`
  return (
    <div className={cn('span-2 grid gap-3 md:grid-cols-2', className)}>
      <Input
        label={`${label} (English)`}
        value={read(profile, field)}
        onChange={(e) => setField(setProfile, field, e.target.value)}
        placeholder={placeholder}
        hint={hint}
      />
      <Input
        label={`${label} (मराठी)`}
        value={read(profile, mrKey)}
        onChange={(e) => setField(setProfile, mrKey, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

interface BilingualTextareaProps extends BilingualProps {
  rows?: number
}

export function BilingualTextarea({
  profile,
  setProfile,
  field,
  label,
  placeholder,
  hint,
  rows = 3,
  className,
}: BilingualTextareaProps) {
  const mrKey = `${field}_mr`
  return (
    <div className={cn('span-2 grid gap-3 md:grid-cols-2', className)}>
      <Textarea
        label={`${label} (English)`}
        rows={rows}
        value={read(profile, field)}
        onChange={(e) => setField(setProfile, field, e.target.value)}
        placeholder={placeholder}
        hint={hint}
      />
      <Textarea
        label={`${label} (मराठी)`}
        rows={rows}
        value={read(profile, mrKey)}
        onChange={(e) => setField(setProfile, mrKey, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

interface BilingualRichProps extends BilingualProps {
  minHeight?: number
}

export function BilingualRichText({
  profile,
  setProfile,
  field,
  label,
  hint,
  minHeight = 160,
  className,
}: BilingualRichProps) {
  const mrKey = `${field}_mr`
  return (
    <div className={cn('span-2 grid gap-3 md:grid-cols-2', className)}>
      <RichTextEditor
        label={`${label} (English)`}
        value={read(profile, field)}
        onChange={(v) => setField(setProfile, field, v)}
        hint={hint}
        minHeight={minHeight}
      />
      <RichTextEditor
        label={`${label} (मराठी)`}
        value={read(profile, mrKey)}
        onChange={(v) => setField(setProfile, mrKey, v)}
        minHeight={minHeight}
      />
    </div>
  )
}

export function AboutSection({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="admin-settings-form-section border-t border-slate-100 pt-6 first:border-0 first:pt-0">
      <h3 className="admin-settings-form-section-title">{title}</h3>
      {desc ? <p className="admin-settings-form-section-desc">{desc}</p> : null}
      <FormGridLike>{children}</FormGridLike>
    </div>
  )
}

function FormGridLike({ children }: { children: ReactNode }) {
  return <div className="grid gap-4">{children}</div>
}

/** @deprecated Prefer BilingualInput — kept for gradual migration */
export function ProfileMrInput(props: BilingualProps) {
  return (
    <Input
      label={`${props.label} (मराठी)`}
      value={read(props.profile, `${props.field}_mr`)}
      onChange={(e) => setField(props.setProfile, `${props.field}_mr`, e.target.value)}
      placeholder={props.placeholder}
      hint={props.hint}
    />
  )
}

/** @deprecated Prefer BilingualTextarea */
export function ProfileMrTextarea(props: BilingualTextareaProps) {
  return (
    <Textarea
      label={`${props.label} (मराठी)`}
      rows={props.rows ?? 3}
      value={read(props.profile, `${props.field}_mr`)}
      onChange={(e) => setField(props.setProfile, `${props.field}_mr`, e.target.value)}
      placeholder={props.placeholder}
      hint={props.hint}
    />
  )
}

/** @deprecated Prefer side-by-side bilingual fields */
export function ProfileMrBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="span-2 rounded-xl border border-orange-100 bg-orange-50/50 p-3 space-y-3">
      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-orange-700">मराठी (website language)</p>
      {children}
    </div>
  )
}
