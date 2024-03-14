import invariant from 'tiny-invariant'

import { json } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node'

import { requireUserId } from '~/session.server'
import { createComment } from '~/models/comments.server'
import { getErrorMessage, parseStringFormData } from '~/utils'
import { getMemberIdFromUserByDiscussion } from '~/models/users.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'post':
      try {
        const { rootId, parentId, discussionId, content } =
          await parseStringFormData(request)
        invariant(content, 'content required')
        invariant(discussionId, 'chapterId required')
        const memberId = await getMemberIdFromUserByDiscussion(
          userId,
          discussionId,
        )
        const comment = await createComment({
          rootId,
          content,
          memberId,
          parentId,
          discussionId,
        })
        return json({ ok: true, comment })
      } catch (error) {
        return json({ error: getErrorMessage(error) }, { status: 500 })
      }

    default:
      throw new Response('Invalid method', { status: 405 })
  }
}

export const loader = () => new Response('Invalid method', { status: 405 })
