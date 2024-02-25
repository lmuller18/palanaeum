import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import type { LoaderFunctionArgs } from '@remix-run/node'

import { requireUserId } from '~/jwt.server'
import { getTopPostByChapter } from '~/models/posts.server'
import { getChapterDetails } from '~/models/chapters.server'
import { getTopDiscussionByChapter } from '~/models/discussions.server'
import { getCompletedMembersByChapter } from '~/models/members.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.clubId, 'expected clubId')
  invariant(params.chapterId, 'expected chapterId')
  const userId = await requireUserId(request)

  const [members, chapter, topPost, topDiscussion] = await Promise.all([
    getCompletedMembersByChapter(params.clubId, params.chapterId),
    getChapterDetails(params.chapterId, userId),
    getTopPostByChapter(params.chapterId),
    getTopDiscussionByChapter(params.chapterId),
  ])

  if (!chapter) throw new Response('Chapter not found', { status: 404 })

  return json({ members, chapter, topPost, topDiscussion })
}
