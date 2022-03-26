import invariant from 'tiny-invariant'
import { ActionFunction, json } from 'remix'

import { requireUserId } from '~/session.server'
import { getErrorMessage } from '~/utils/errors.utils'
import { markRead, markUnread } from '~/models/chapter.server'

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)
  invariant(params.clubId, 'clubId not found')

  const formData = await request.formData()
  const action = formData.get('_action')
  invariant(action, 'missing action')

  const chapterId = formData.get('chapterId')

  switch (action) {
    case 'MARK_READ':
      if (typeof chapterId !== 'string' || chapterId.length === 0) {
        return json({ error: 'Chapter ID is required' }, { status: 400 })
      }

      try {
        await markRead(chapterId, userId)
        return json({
          success: true,
        })
      } catch (e) {
        return json(
          { error: getErrorMessage(e, 'Failed to mark chapter read') },
          { status: 500 },
        )
      }

    case 'MARK_UNREAD':
      if (typeof chapterId !== 'string' || chapterId.length === 0) {
        return json({ error: 'Chapter ID is required' }, { status: 400 })
      }

      try {
        await markUnread(chapterId, userId)
        return json({
          success: true,
        })
      } catch (e) {
        return json(
          { error: getErrorMessage(e, 'Failed to mark chapter unread') },
          { status: 500 },
        )
      }

    default:
      throw new Response('Invalid action', { status: 400 })
  }
}
