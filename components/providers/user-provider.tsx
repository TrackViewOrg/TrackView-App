'use client'

import { createContext, useContext, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile, UserContextType } from '@/types'

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: React.ReactNode
  initialUser: User | null
  initialProfile: Profile | null
}

export function UserProvider({
  children,
  initialUser,
  initialProfile,
}: UserProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)

  // Sync state with server props on navigation/redirects during render
  // to avoid cascading renders from useEffect
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser)
  const [prevInitialProfile, setPrevInitialProfile] = useState(initialProfile)

  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser)
    setUser(initialUser)
  }
  if (initialProfile !== prevInitialProfile) {
    setPrevInitialProfile(initialProfile)
    setProfile(initialProfile)
  }

  return (
    <UserContext.Provider value={{ user, profile, isLoading: false }}>
      {children}
    </UserContext.Provider>
  )
}

// Custom Hook for consumption
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
