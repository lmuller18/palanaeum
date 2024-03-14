import invariant from 'tiny-invariant'

import { json } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node'

import { prisma } from '~/db.server'
import { parseStringFormData } from '~/utils'
import { requireUserId } from '~/session.server'
import { deleteInvite } from '~/models/invites.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'delete': {
      const { inviterId, inviteeId, clubId } = await parseStringFormData(
        request,
      )
      invariant(inviterId, 'expected inviterId')
      invariant(inviteeId, 'expected inviteeId')
      invariant(clubId, 'expected clubId')

      const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: {
          ownerId: true,
        },
      })

      if (!club) throw new Response(null, { status: 404, statusText: 'Club not found'} )
      if (club.ownerId !== userId)
        throw new Response(null, {status: 403, statusText: "Not allowed to delete invite"})

      await deleteInvite({ clubId, inviteeId, inviterId })

      return json({
        ok: true,
      })
    }
    default:
      return new Response('Invalid method', { status: 405 })
  }
}

export const loader = () => new Response('Invalid method', { status: 405 })
