import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

import Button from '~/elements/Button'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import ChapterPagination from '~/components/ChapterPagination'
import { getPaginatedChapterList } from '~/models/chapters.server'

const PAGE_SIZE = 10

interface LoaderData {
  chapters: FuncType<typeof getPaginatedChapterList>['chapters']
  page: number
  totalPages: number
}

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)

  const searchParams = new URL(request.url).searchParams
  const pageStr = searchParams.get('page')
  const pageNum = pageStr ? Number(pageStr) : 1

  // const page = paginate(CHAPTERS, PAGE_SIZE, pageNum)

  const page = await getPaginatedChapterList(
    params.clubId,
    userId,
    pageNum - 1,
    PAGE_SIZE,
  )

  if (!page) throw new Response('Problem finding chapters', { status: 500 })

  return json<LoaderData>({
    chapters: page.chapters,
    page: pageNum,
    totalPages: page.totalPages,
  })
}

export default function ChaptersPage() {
  const { chapters, page, totalPages } = useLoaderData() as LoaderData
  const fetcher = useFetcher()
  const navigate = useNavigate()

  return (
    <>
      <div className="grid gap-4 p-2">
        {chapters.map(chapter => (
          <div
            key={chapter.id}
            className="overflow-hidden rounded-md bg-background-secondary p-4 shadow-md"
          >
            <div>
              <TextLink
                to={chapter.id}
                variant="title3"
                className={clsx(
                  'mb-2 block w-fit border-b-2',
                  chapter.status === 'complete' && 'border-emerald-400',
                  chapter.status === 'incomplete' && 'border-amber-400',
                  chapter.status === 'not_started' && 'border-red-400',
                )}
              >
                {chapter.title}
              </TextLink>
              <span className="block text-xs text-red-500">
                Not Final Appearance
              </span>

              <Text variant="body2">Completed by 3 other members.</Text>
              {/* <Text variant="body2">Completed by all other members.</Text> */}
              {/* <Text variant="body2">Not completed by any other members.</Text> */}

              <div className="mt-3 flex items-center gap-4">
                <Text variant="caption">
                  <Text variant="subtitle2">3</Text> Discussions
                </Text>
                <Text variant="caption">
                  <Text variant="subtitle2">12</Text> Posts
                </Text>
              </div>

              <fetcher.Form
                action={`/api/chapters/${chapter.id}/read`}
                method="post"
                className="mt-2 grid gap-2"
              >
                {chapter.status === 'complete' ? (
                  <Button
                    variant="warning"
                    name="_action"
                    value="MARK_UNREAD"
                    disabled={fetcher.state !== 'idle'}
                  >
                    Mark Unread
                  </Button>
                ) : (
                  <Button
                    name="_action"
                    value="MARK_PREVIOUS"
                    disabled={fetcher.state !== 'idle'}
                  >
                    Mark Read
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => navigate(chapter.id)}
                  variant="secondary"
                >
                  View Chapter
                </Button>
              </fetcher.Form>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <ChapterPagination currentPage={page} lastPage={totalPages} />
      )}
    </>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
