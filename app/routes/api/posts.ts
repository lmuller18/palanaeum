import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'

import { requireUserId } from '~/session.server'
import { createPost } from '~/models/posts.server'
import { getErrorMessage, parseStringFormData } from '~/utils'
import { getMemberIdFromUserByChapter } from '~/models/users.server'

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'post':
      try {
        const { chapterId, content, image, context, parentId, rootId } =
          await parseStringFormData(request)
        invariant(content, 'content required')
        invariant(chapterId, 'chapterId required')
        const memberId = await getMemberIdFromUserByChapter(userId, chapterId)
        const post = await createPost({
          chapterId,
          content,
          image,
          context,
          parentId,
          rootId,
          memberId,
        })

        // localFetch(request, '/api/notifications/post')
        // TODO notifications
        // if(post.rootId == null) {
        // alert people who have read
        // } else {
        // alert people who are in comment chain
        // }

        return json({ ok: true, post })
      } catch (error) {
        return json(
          { error: getErrorMessage(error) },
          {
            status: 500,
          },
        )
      }

    default:
      throw new Response('Invalid method', { status: 405 })
  }
}

export const loader: LoaderFunction = () =>
  new Response('Invalid method', { status: 405 })
