import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { requireUserId } from '~/jwt.server'
import { getChapter } from '~/models/chapters.server'
import { getClubByChapterId } from '~/models/clubs.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.chapterId, 'expected chapterId')
  const userId = await requireUserId(request)

  const [chapter, club] = await Promise.all([
    getChapter(params.chapterId, userId),
    getClubByChapterId(params.chapterId, userId),
  ])

  if (!club) throw new Response('Club not found', { status: 404 })
  if (!chapter) throw new Response('Chapter not found', { status: 404 })

  return json({
    club: {
      id: club.id,
      title: club.title,
      image: club.image,
    },
    chapter: {
      id: chapter.id,
      title: chapter.title,
    },
  })
}
