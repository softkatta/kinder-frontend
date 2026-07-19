import { createContext, useContext, type ReactNode } from 'react'

const SchoolProfileContext = createContext<Record<string, string> | null>(null)

export function SchoolProfileProvider({
  profile,
  children,
}: {
  profile: Record<string, string> | null
  children: ReactNode
}) {
  return (
    <SchoolProfileContext.Provider value={profile}>
      {children}
    </SchoolProfileContext.Provider>
  )
}

export function useSchoolProfile() {
  return useContext(SchoolProfileContext)
}
