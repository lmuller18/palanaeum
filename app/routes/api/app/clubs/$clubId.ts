import invariant from 'tiny-invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'

import { requireUserId } from '~/jwt.server'
import { getClub } from '~/models/clubs.server'

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)

  const club = await getClub(params.clubId, userId)

  if (!club) throw new Response('Club not found', { status: 404 })

  return json({
    club: {
      id: club.id,
      title: club.title,
      author: club.author,
      image: club.image,
    },
  })
}
