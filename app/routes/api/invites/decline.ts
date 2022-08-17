import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { ActionArgs } from '@remix-run/node'

import { parseStringFormData } from '~/utils'
import { requireUserId } from '~/session.server'
import { deleteInvite } from '~/models/invites.server'

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request)

  const formData = await parseStringFormData(request)

  invariant(formData.inviterId, 'expected inviter id')
  invariant(formData.clubId, 'expected club id')

  await deleteInvite({
    inviteeId: userId,
    inviterId: formData.inviterId,
    clubId: formData.clubId,
  })

  return json({
    ok: true,
  })
}

export const loader = () => new Response('Invalid method', { status: 405 })
