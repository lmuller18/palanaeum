import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { CheckCircle, XCircle } from 'react-feather'
import { Link, useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

import { pluralize } from '~/utils'
import Button from '~/elements/Button'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import ChapterPagination from '~/components/ChapterPagination'
import { getPaginatedChapterList } from '~/models/chapters.server'

const PAGE_SIZE = 10

export const loader = async ({ request, params }: LoaderArgs) => {
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

export default function ChaptersPage() {
  const { chapters, page, totalPages } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const navigate = useNavigate()

  // no one completed                           ALL_INCOMPLETE
  // user completed with some others            USER_COMPLETE_SOME_OTHERS
  // some others completed, user incomplete     USER_INCOMPLETE_SOME_OTHERS
  // all complete                               ALL_COMPLETE
  const getStatus = (
    chapter: typeof chapters[number],
  ):
    | 'all-incomplete'
    | 'user-complete-some-others'
    | 'user-incomplete-some-others'
    | 'all-complete' => {
    if (chapter.clubStatus === 'complete') return 'all-complete'
    if (chapter.clubStatus === 'not_started') return 'all-incomplete'

    if (chapter.userStatus === 'complete') return 'user-complete-some-others'
    if (chapter.userStatus === 'incomplete')
      return 'user-incomplete-some-others'

    return 'user-incomplete-some-others'
  }

  const getSpoilerStatusMessaging = (
    status: ReturnType<typeof getStatus>,
    count: typeof chapters[number]['completedCount'],
  ) => {
    switch (status) {
      case 'all-complete':
        return (
          <Text variant="subtitle2" className="mb-3 font-normal" as="p">
            All members have{' '}
            <span className="bg-gradient-to-l from-teal-300 to-green-400 bg-clip-text font-bold text-transparent">
              completed this chapter
            </span>
            .
          </Text>
        )
      case 'all-incomplete':
        return (
          <Text variant="subtitle2" className="mb-3 font-normal" as="p">
            You{' '}
            <span className="bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text font-bold text-transparent">
              could be first
            </span>{' '}
            to read this chapter.
          </Text>
        )
      case 'user-complete-some-others':
        return (
          <Text variant="subtitle2" className="mb-3 font-normal" as="p">
            <span className="bg-gradient-to-l from-red-300 to-pink-500 bg-clip-text font-bold text-transparent">
              Spoiler Warning:{' '}
            </span>
            Not all members have read this chapter yet.
          </Text>
        )
      case 'user-incomplete-some-others':
      default:
        return (
          <Text variant="subtitle2" className="mb-3 font-normal" as="p">
            <span className="bg-gradient-to-l from-red-300 to-pink-500 bg-clip-text font-bold text-transparent">
              Spoiler Warning:{' '}
            </span>
            {count.others} other{' '}
            {pluralize('member has', 'members have', count.others)} already read
            this chapter.
          </Text>
        )
    }
  }

  return (
    <>
      <div className="grid gap-4 p-2">
        {chapters.map(chapter => (
          <div
            key={chapter.id}
            className="overflow-hidden rounded-md bg-background-secondary p-4 shadow-md"
          >
            <div>
              <div className="relative mb-2 flex items-baseline gap-2">
                <div className="relative h-5 w-5">
                  {chapter.userStatus === 'complete' ? (
                    <CheckCircle className="absolute top-[2px] h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="absolute top-[2px] h-5 w-5 text-red-400" />
                  )}{' '}
                </div>

                <Link
                  to={chapter.id}
                  className={clsx(
                    'block w-fit text-2xl font-bold line-clamp-2',
                  )}
                >
                  {chapter.title}
                </Link>
              </div>

              {getSpoilerStatusMessaging(
                getStatus(chapter),
                chapter.completedCount,
              )}

              <div className="flex items-center gap-2 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                <span className="text-lg font-bold">
                  {chapter.postCount}{' '}
                  <span className="text-base font-medium text-white">
                    {pluralize('Post', 'Posts', chapter.postCount)}
                  </span>
                </span>

                <span className="text-lg font-bold">
                  {chapter.discussionCount}{' '}
                  <span className="text-base font-medium text-white">
                    {pluralize(
                      'Discussion',
                      'Discussions',
                      chapter.discussionCount,
                    )}
                  </span>
                </span>
              </div>

              <fetcher.Form
                action={`/api/chapters/${chapter.id}/read`}
                method="post"
                className="mt-4 grid grid-cols-2 gap-2"
              >
                <Button
                  type="button"
                  onClick={() => navigate(chapter.id)}
                  variant="secondary"
                >
                  View Chapter
                </Button>
                {chapter.userStatus === 'complete' ? (
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
