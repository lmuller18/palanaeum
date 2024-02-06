import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import type { ComponentProps } from 'react'

import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'

import { pluralize } from '~/utils'
import Container from '~/components/Container'
import { requireUserId } from '~/session.server'
import ChapterPagination from '~/components/ChapterPagination'
import { getPaginatedChapterList } from '~/models/chapters.server'

const PAGE_SIZE = 10

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold leading-7 text-slate-100">
          Chapters
        </h1>
        <div className="divide-y divide-slate-700 sm:mt-4 lg:mt-8 lg:border-t lg:border-slate-700">
          {chapters.map(chapter => (
            <ChapterEntry key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <ChapterPagination currentPage={page} lastPage={totalPages} />
      )}
    </>
  )
}

const ChapterEntry = ({
  chapter,
}: {
  chapter: FuncType<typeof getPaginatedChapterList>['chapters'][number]
}) => {
  const fetcher = useFetcher()

  const toggleChapterStatus = () => {
    fetcher.submit(
      {
        _action:
          chapter.userStatus === 'incomplete' ? 'MARK_PREVIOUS' : 'MARK_UNREAD',
      },
      {
        action: `/api/chapters/${chapter.id}/read`,
        method: 'post',
      },
    )
  }

  const status = useMemo(():
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
  }, [chapter.clubStatus, chapter.userStatus])

  const spoilerStatusMessaging = useMemo(() => {
    switch (status) {
      case 'all-complete':
        return 'All members have completed this chapter.'
      case 'all-incomplete':
        return 'You could be first to read this chapter.'
      case 'user-complete-some-others':
        return 'Spoiler Warning: Not all members have read this chapter yet.'
      case 'user-incomplete-some-others':
      default:
        return `Spoiler Warning: ${
          chapter.completedCount.others
        } other ${pluralize(
          'member has',
          'members have',
          chapter.completedCount.others,
        )} already read this chapter.`
    }
  }, [chapter.completedCount.others, status])

  return (
    <article
      aria-labelledby={`episode-${chapter.id}-title`}
      className="py-5 sm:py-6"
    >
      <Container>
        <div className="flex flex-col items-start">
          <h2
            id={`episode-${chapter.id}-title`}
            className="text-lg font-bold text-slate-100"
          >
            <Link to={chapter.id}>{chapter.title}</Link>
          </h2>

          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm font-bold leading-6">
              <span className="mr-1 text-pink-500">
                {chapter.discussionCount}
              </span>{' '}
              {pluralize('Discussion', 'Discussions', chapter.discussionCount)}
            </span>
            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              &#183;
            </span>
            <span className="text-sm font-bold leading-6">
              <span className="mr-1 text-pink-500">{chapter.postCount}</span>{' '}
              {pluralize('Post', 'Posts', chapter.postCount)}
            </span>
            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              &#183;
            </span>
            <span className="text-sm font-bold leading-6">
              <span className="mr-1 text-pink-500">
                {(chapter.completedCount.percent * 100)
                  .toFixed(2)
                  .replace(/[.,]00$/, '')}
                %
              </span>{' '}
              Complete
            </span>
          </div>

          <p className="mt-1 text-base leading-7 text-slate-50">
            {spoilerStatusMessaging}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={toggleChapterStatus}
              className="flex items-center text-sm font-bold leading-6 text-pink-500 hover:text-pink-400 active:text-pink-600"
              aria-label={`Mark ${
                chapter.userStatus === 'incomplete' ? 'read' : 'unread'
              } chapter ${chapter.title}`}
            >
              <PlayPauseIcon
                playing={chapter.userStatus === 'complete'}
                className="h-5 w-5 fill-current"
              />
              <span className="ml-1" aria-hidden="true">
                {chapter.userStatus === 'incomplete'
                  ? 'Mark Read'
                  : 'Mark Unread'}
              </span>
            </button>
            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              /
            </span>
            <Link
              to={chapter.id}
              className="flex items-center text-sm font-bold leading-6 text-pink-500 hover:text-pink-400 active:text-pink-600"
              aria-label={`Chapter homepage for chapter ${chapter.title}`}
            >
              View Chapter
            </Link>
          </div>
        </div>
      </Container>
    </article>
  )
}

function PlayPauseIcon({
  playing,
  ...props
}: { playing: boolean } & ComponentProps<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" {...props}>
      {playing ? (
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      ) : (
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      )}
    </svg>
  )
}
