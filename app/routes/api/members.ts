import invariant from 'tiny-invariant'

import { json } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node'

import { prisma } from '~/db.server'
import { parseStringFormData } from '~/utils'
import { requireUserId } from '~/session.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'delete': {
      const { memberId } = await parseStringFormData(request)
      invariant(memberId, 'expected memberId')

      const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: {
          id: true,
          userId: true,
          club: {
            select: {
              ownerId: true,
            },
          },
        },
      })

      if (!member) throw new Response(null, {status: 404, statusText: 'Member not found'})

      if (member.club.ownerId !== userId && member.userId !== userId)
        throw new Response(null, {status: 403, statusText: 'Not allowed to delete member'})

      await prisma.member
        .update({
          where: { id: member.id },
          data: {
            removed: true,
          },
        })
        .catch(e => console.log('member not found'))

      return json({
        ok: true,
      })
    }
    default:
      return new Response('Invalid method', { status: 405 })
  }
}

export const loader = () => new Response('Invalid method', { status: 405 })
