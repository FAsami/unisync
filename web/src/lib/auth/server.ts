import { cookies } from 'next/headers'

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return token || null
}

export async function isServerAuthenticated(): Promise<boolean> {
  const token = await getServerSession()
  return !!token
}
