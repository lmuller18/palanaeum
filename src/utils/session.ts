import { Route as AuthedRoute } from '@/routes/_authed'
import { useSession } from '@tanstack/react-start/server'

type SessionData = {
  id: string
  email: string
  username: string
  avatar: string
}

const maxAge = 60 * 60 * 24 * 7 * 52 // 1 year

export function useAppSession() {
  return useSession<SessionData>({
    name: '__session',
    password: process.env.SESSION_SECRET!,
    cookie: {
      httpOnly: true,
      maxAge,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
    maxAge,
  })
}

export function useUser() {
  const user = AuthedRoute.useRouteContext().user
  if (!user) throw new Error('useUser must be used in an authenticated route')
  return user
}
