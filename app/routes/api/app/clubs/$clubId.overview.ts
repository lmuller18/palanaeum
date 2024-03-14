import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'

import {
  getReadChapters,
  getChaptersReadByDay,
  getNextChapterDetails,
} from '~/models/chapters.server'
import { requireUserId } from '~/jwt.server'
import { getClub } from '~/models/clubs.server'
import { getTopPostByClub } from '~/models/posts.server'
import { getTopDiscussionByClub } from '~/models/discussions.server'
import { getMembersWithProgressByClub } from '~/models/members.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)

  const [
    nextChapter,
    counts,
    club,
    topPost,
    topDiscussion,
    readChapters,
    members,
  ] = await Promise.all([
    getNextChapterDetails(userId, params.clubId),
    getChaptersReadByDay(userId, params.clubId),
    getClub(params.clubId, userId),
    getTopPostByClub(params.clubId),
    getTopDiscussionByClub(params.clubId),
    getReadChapters(userId, params.clubId),
    getMembersWithProgressByClub(params.clubId),
  ])

  if (!club) throw new Response('Club not found', { status: 404 })
  if (!counts) throw new Response('Club not found', { status: 404 })

  return json({
    counts,
    topPost,
    members,
    nextChapter,
    readChapters,
    topDiscussion,
    isOwner: club.ownerId === userId,
  })
}
