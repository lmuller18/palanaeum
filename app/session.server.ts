import invariant from 'tiny-invariant'
import { unauthorized } from 'remix-utils'

import { json, redirect, createCookieSessionStorage } from '@remix-run/node'

import type { User } from '~/models/users.server'
import { getUserById } from '~/models/users.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 * 52,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

export const USER_SESSION_KEY = 'userId'

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request)
  const userId = session.get(USER_SESSION_KEY)
  return userId
}

export async function getUser(request: Request): Promise<null | User> {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  const user = await getUserById(userId)
  if (user) return user

  throw await logout(request)
}

function getIsNativeApp(request: Request) {
  const header = request.headers.get('X-Palanaeum-Client')
  return header === 'native'
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
): Promise<string> {
  const userId = await getUserId(request)
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    if (getIsNativeApp(request)) {
      throw unauthorized({ message: 'not authorized' })
    }
    throw redirect(`/login?${searchParams}`)
  }
  return userId
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request)

  const user = await getUserById(userId)
  if (user) return user

  throw await logout(request)
}

export async function createUserSession({
  request,
  userId,
  redirectTo,
}: {
  request: Request
  userId: string
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  const headers = {
    'Set-Cookie': await sessionStorage.commitSession(session),
  }
  if (getIsNativeApp(request)) return json({ success: true }, { headers })
  return redirect(redirectTo, { headers })
}

export async function prepareUserSession({
  request,
  userId,
}: {
  request: Request
  userId: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  return new Headers({
    'Set-Cookie': await sessionStorage.commitSession(session),
  })
}

export async function logout(request: Request) {
  const session = await getSession(request)
  const headers = {
    'Set-Cookie': await sessionStorage.destroySession(session),
  }
  if (getIsNativeApp(request)) return json({ success: true }, { headers })
  return redirect('/', { headers })
}
