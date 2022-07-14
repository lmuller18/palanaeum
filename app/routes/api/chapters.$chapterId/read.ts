import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'

import { getErrorMessage } from '~/utils'
import { requireUserId } from '~/session.server'
import {
  markPreviousRead,
  markRead,
  markUnread,
} from '~/models/chapters.server'
import { getMemberIdFromUserByChapter } from '~/models/users.server'

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)
  invariant(params.chapterId, 'chapterId required')
  const chapterId = params.chapterId

  const formData = await request.formData()
  const action = formData.get('_action')
  invariant(action, 'missing action')

  switch (request.method.toLowerCase()) {
    case 'post':
      switch (action) {
        case 'MARK_READ': {
          try {
            const memberId = await getMemberIdFromUserByChapter(
              userId,
              chapterId,
            )
            const progress = await markRead(chapterId, memberId)
            return json({ ok: true, progress })
          } catch (error) {
            return json({ error: getErrorMessage(error) }, { status: 500 })
          }
        }
        case 'MARK_PREVIOUS': {
          try {
            const memberId = await getMemberIdFromUserByChapter(
              userId,
              chapterId,
            )
            const progress = await markPreviousRead(chapterId, memberId)
            return json({ ok: true, progress })
          } catch (error) {
            return json({ error: getErrorMessage(error) }, { status: 500 })
          }
        }
        case 'MARK_UNREAD': {
          try {
            const memberId = await getMemberIdFromUserByChapter(
              userId,
              chapterId,
            )
            const progress = await markUnread(chapterId, memberId)
            return json({ ok: true, progress })
          } catch (error) {
            return json({ error: getErrorMessage(error) }, { status: 500 })
          }
        }
        default:
          throw new Response('Invalid action', { status: 400 })
      }
    default:
      throw new Response('Invalid method', { status: 405 })
  }
}

export const loader: LoaderFunction = () =>
  new Response('Invalid method', { status: 405 })
