import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'

import { requireUserId } from '~/jwt.server'
import { getPaginatedChapterList } from '~/models/chapters.server'

const PAGE_SIZE = 10

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)

  const searchParams = new URL(request.url).searchParams
  const pageStr = searchParams.get('page')
  const pageNum = pageStr ? Number(pageStr) : 1

  const page = await getPaginatedChapterList(
    params.clubId,
    userId,
    pageNum - 1,
    PAGE_SIZE,
  )

  if (!page) throw new Response('Problem finding chapters', { status: 500 })

  return json({
    chapters: page.chapters,
    page: pageNum,
    totalPages: page.totalPages,
  })
}
