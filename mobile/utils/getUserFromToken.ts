import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'

export interface DecodedToken {
  sessionId?: string
  userId?: string
  role?: string
  exp?: number
  iat?: number
}

export const getCurrentUserFromToken = async (): Promise<{
  id: string
  role: string
} | null> => {
  try {
    const token = await AsyncStorage.getItem('iam_access_token')
    if (!token) {
      return null
    }

    const decoded = jwtDecode<DecodedToken>(token)
    if (!decoded.userId || !decoded.role) {
      return null
    }

    return {
      id: decoded.userId,
      role: decoded.role,
    }
  } catch (error) {
    console.error('Error decoding user from token:', error)
    return null
  }
}
