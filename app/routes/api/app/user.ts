import type { LoaderFunctionArgs } from '@remix-run/node'

import { requireUserId } from '~/jwt.server'
import { getUserById } from '~/models/users.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const user = await getUserById(userId)
  if (!user) throw new Response('No user', { status: 404 })
  return user
}
