import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { jwtSignIn } from '~/jwt.server'

export async function action({ request }: ActionFunctionArgs) {
  const payload = await request.json()
  if (!payload.email || !payload.password)
    throw new Response('Bad request', { status: 400 })

  const token = await jwtSignIn(payload.email, payload.password)

  if (!token) throw new Response('Not authorized', { status: 401 })

  return json({ token })
}
