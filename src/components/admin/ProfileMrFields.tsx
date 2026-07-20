import type { Dispatch, SetStateAction } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { SettingsProfile } from '@/api/services'

type ProfileSetter = Dispatch<SetStateAction<SettingsProfile>>

function setField(setProfile: ProfileSetter, key: string, value: string) {
  setProfile((p) => ({ ...p, [key]: value }))
}

function read(profile: SettingsProfile, key: string): string {
  return String((profile as Record<string, string | null | undefined>)[key] ?? '')
}

interface ProfileMrInputProps {
  profile: SettingsProfile
  setProfile: ProfileSetter
  field: string
  label: string
  placeholder?: string
  hint?: string
}

/** Marathi text input paired under an English settings field */
export function ProfileMrInput({ profile, setProfile, field, label, placeholder, hint }: ProfileMrInputProps) {
  const mrKey = `${field}_mr`
  return (
    <Input
      label={`${label} (मराठी)`}
      value={read(profile, mrKey)}
      onChange={(e) => setField(setProfile, mrKey, e.target.value)}
      placeholder={placeholder}
      hint={hint}
    />
  )
}

interface ProfileMrTextareaProps extends ProfileMrInputProps {
  rows?: number
}

export function ProfileMrTextarea({
  profile,
  setProfile,
  field,
  label,
  placeholder,
  hint,
  rows = 3,
}: ProfileMrTextareaProps) {
  const mrKey = `${field}_mr`
  return (
    <Textarea
      label={`${label} (मराठी)`}
      rows={rows}
      value={read(profile, mrKey)}
      onChange={(e) => setField(setProfile, mrKey, e.target.value)}
      placeholder={placeholder}
      hint={hint}
    />
  )
}

export function ProfileMrBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="span-2 rounded-xl border border-orange-100 bg-orange-50/50 p-3 space-y-3">
      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-orange-700">मराठी (website language)</p>
      {children}
    </div>
  )
}
