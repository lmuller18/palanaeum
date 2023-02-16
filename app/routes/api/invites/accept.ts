import invariant from 'tiny-invariant'

import { redirect } from '@remix-run/node'
import type { ActionArgs } from '@remix-run/node'

import { parseStringFormData } from '~/utils'
import { requireUserId } from '~/session.server'
import { addUserToClub } from '~/models/clubs.server'
import { deleteInvite } from '~/models/invites.server'

export const action = async ({ request }: ActionArgs) => {
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

export const loader = () => new Response('Invalid method', { status: 405 })
