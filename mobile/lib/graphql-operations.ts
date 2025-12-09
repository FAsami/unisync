import { gql } from '@apollo/client'

export const GET_USER_SESSIONS = gql`
  query GetUserSessions {
    user_session {
      id
      user_id
      revoked
      ip_address
      device_info
      user_agent
      last_used_at
      created_at
      updated_at
      access_token_expires_at
      refresh_token_expires_at
    }
  }
`

export const SUBSCRIBE_TO_SESSION_CHANGES = gql`
  subscription SubscribeToSessionChanges {
    user_session {
      id
      user_id
      revoked
      ip_address
      last_used_at
      created_at
      updated_at
    }
  }
`

export interface UserSession {
  id: string
  user_id?: number
  revoked: boolean
  ip_address: string
  device_info?: any
  user_agent: string
  last_used_at: string
  created_at: string
  updated_at: string
  access_token_expires_at?: string
  refresh_token_expires_at?: string
}

export interface GetUserSessionsData {
  user_session: UserSession[]
}

export const GET_EVENT_ROUTINES = gql`
  query GetEventRoutines {
    event_routine(where: { is_active: { _eq: true } }) {
      id
      name
      day_of_week
      start_time
      end_time
      event_type
      effective_from
      effective_to
      is_active
      metadata
      course_offering {
        id
        section {
          id
          name
          batch {
            name
          }
        }
        course {
          id
          name
          code
        }
      }
    }
  }
`

export interface EventRoutine {
  id: string
  name: string
  day_of_week: number
  start_time: string
  end_time: string
  event_type: string
  effective_from: string
  effective_to: string
  is_active: boolean
  metadata?: any
  course_offering?: {
    id: string
    section?: {
      id: string
      name: string
      batch?: {
        name: string
      }
    }
    course?: {
      id: string
      name: string
      code: string
    }
  }
}

export interface GetEventRoutinesData {
  event_routine: EventRoutine[]
}
