import { User } from '@supabase/supabase-js'

export type PlanType = 'DEFAULT' | 'PLUS' | 'PRO'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  plan: PlanType
  created_at: string
  updated_at: string
  profile_visible: boolean
}

export interface UserContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
}

export interface Game {
  id: string
  name: string
  image_url: string | null
  more_props: any
  created_at: string
}

export interface Car {
  id: string
  internal_name: string
  display_name: string
  car_image: string | null
  more_props: any
  created_at: string
}

export interface Track {
  id: string
  internal_name: string
  display_name: string
  track_flag: string | null
  created_at: string
  sectors: any
  sections: any
  drs_zones: any
}

export interface Session {
  id: string
  user_id: string
  game_id: string
  car_id: string
  track_id: string
  best_lap_time: number
  gap_to_pb: number
  total_laps: number
  weather_data: any // Using any for jsonb as structure isn't defined yet
  created_at: string
  bookmarked: boolean
  game?: Game
  car?: Car
  track?: Track
}
