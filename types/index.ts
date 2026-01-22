import {User} from '@supabase/supabase-js'

export type PlanType = 'DEFAULT' | 'PLUS' | 'PRO'

export interface Profile {
    id: string
    display_name: string | null
    avatar_url: string | null
    plan: PlanType
    created_at: string
    updated_at: string
    profile_visible:boolean
}

export interface UserContextType {
    user: User | null
    profile: Profile | null
    isLoading: boolean
}