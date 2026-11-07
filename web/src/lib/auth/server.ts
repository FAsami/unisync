import { cookies } from 'next/headers'
import { isJwtExpired } from '@/lib/jwt'

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token || isJwtExpired(token, 0)) return null
  return token
}

export async function isServerAuthenticated(): Promise<boolean> {
  const token = await getServerSession()
  return !!token
}
