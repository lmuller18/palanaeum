import invariant from 'tiny-invariant'

import {
  json,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node'

import { getErrorMessage } from '~/utils'
import { requireUserId } from '~/session.server'
import { createPost } from '~/models/posts.server'
import { getMemberIdFromUserByChapter } from '~/models/users.server'
import { notifyNewPost, notifyPostReply } from '~/models/notifications.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'post':
      try {
        const formData = await parseMultipartFormData(
          request,
          composeUploadHandlers(createMemoryUploadHandler()),
        )

        const content = formData.get('content')
        const chapterId = formData.get('chapterId')
        const context = formData.get('context')
        const parentId = formData.get('parentId')
        const rootId = formData.get('rootId')
        const image = formData.get('image')

        // required fields
        invariant(
          content != null && typeof content === 'string',
          'content required',
        )
        invariant(
          chapterId != null && typeof chapterId === 'string',
          'chapterId required',
        )

        // optional fields
        invariant(
          context == null || (context != null && typeof context === 'string'),
          'incorrect context type',
        )
        invariant(
          parentId == null ||
            (parentId != null && typeof parentId === 'string'),
          'incorrect parentId type',
        )
        invariant(
          rootId == null || (rootId != null && typeof rootId === 'string'),
          'incorrect rootId type',
        )
        invariant(
          image == null || (image != null && image instanceof File),
          'incorrect image type',
        )

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
        if (post.parent && post.parent.member.user.id !== userId) {
          await notifyPostReply(
            post,
            post.parent.member.user.id,
            `/posts/${post.parent.id}`,
          )
        } else {
          await notifyNewPost(post, `/posts/${post.id}`)
        }

        return json({ ok: true, post })
      } catch (error) {
        console.error(error)
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

export const loader = () => new Response('Invalid method', { status: 405 })
