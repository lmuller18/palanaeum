import invariant from 'tiny-invariant'
import { redirect } from '@remix-run/node'
import type { ActionFunction } from '@remix-run/node'

import { prisma } from '~/db.server'
import { parseStringFormData } from '~/utils'
import { requireUserId } from '~/session.server'

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const formData = await parseStringFormData(request)

  invariant(formData.inviterId, 'expected inviter id')
  invariant(formData.clubId, 'expected club id')

  await addUserToClub(formData.clubId, userId)

  await deleteInvite({
    inviteeId: userId,
    inviterId: formData.inviterId,
    clubId: formData.clubId,
  })

  return redirect(`/clubs/${formData.clubId}`)
}

async function addUserToClub(clubId: string, userId: string) {
  return prisma.member.create({
    data: {
      clubId,
      userId,
    },
  })
}

async function deleteInvite({
  inviteeId,
  inviterId,
  clubId,
}: {
  inviteeId: string
  inviterId: string
  clubId: string
}) {
  return prisma.clubInvite
    .delete({
      where: {
        inviterId_inviteeId_clubId: {
          clubId,
          inviteeId,
          inviterId,
        },
      },
    })
    .catch(e => console.log('invite not found'))
}
