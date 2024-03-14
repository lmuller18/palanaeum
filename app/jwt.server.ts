import jwt from 'jsonwebtoken'
import invariant from 'tiny-invariant'
import { verifyLogin } from '~/models/users.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export async function jwtSignIn(email: string, password: string) {
  const user = await verifyLogin(email, password)
  if (!user) return null
  return sign(user.id)
}

export function sign(userId: string) {
  return jwt.sign({ userId }, process.env.SESSION_SECRET as string, {
    expiresIn: '1yr',
  })
}

export async function verify(bearerHeader: string): Promise<string | null> {
  var parts = bearerHeader.split(' ')
  let token
  if (parts.length === 2) {
    var scheme = parts[0]
    var credentials = parts[1]

    if (/^Bearer$/i.test(scheme)) {
      token = credentials
    }
  }

  if (!token) return null

  try {
    const verified = jwt.verify(token, process.env.SESSION_SECRET as string)
    if (typeof verified == 'string') return null
    if (!verified.userId || typeof verified.userId != 'string') return null
    return verified.userId
  } catch (e) {
    console.error('error decoding: ', e)
    return null
  }
}

export async function requireUserId(request: Request) {
  const bearerHeader = request.headers.get('Authorization')
  if (!bearerHeader) throw new Response('No bearer', { status: 401 })

  const userId = await verify(bearerHeader)

  if (!userId) throw new Response('Invalid user', { status: 403 })

  return userId
}
