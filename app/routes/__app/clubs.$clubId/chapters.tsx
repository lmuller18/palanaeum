import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { json, Link, LoaderFunction, useFetcher, useLoaderData } from 'remix'

import { prisma } from '~/db.server'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import ChapterPagination from '~/components/ChapterPagination'

const PAGE_SIZE = 5

interface LoaderData {
  chapters: {
    id: string
    title: string
    status: 'complete' | 'incomplete' | 'not_started'
  }[]
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

  const page = await getChapters(params.clubId, userId, pageNum - 1, PAGE_SIZE)

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

              <div className="mt-3 flex items-center justify-around">
                <Link
                  to={chapter.id}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-background-tertiary px-4 py-2 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  View Chapter
                </Link>
                <fetcher.Form
                  action={`/api/chapters/${chapter.id}/read`}
                  method="post"
                >
                  {chapter.status === 'complete' ? (
                    <button
                      name="_action"
                      value="MARK_UNREAD"
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-background-tertiary px-4 py-2 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      Mark Unread
                    </button>
                  ) : (
                    <button
                      name="_action"
                      value="MARK_READ"
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-background-tertiary px-4 py-2 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      Mark Read
                    </button>
                  )}
                </fetcher.Form>
              </div>
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

async function getChapters(
  clubId: string,
  userId: string,
  page: number,
  size: number,
) {
  const [dbChapters, dbClub] = await Promise.all([
    prisma.chapter.findMany({
      where: { clubId, club: { members: { some: { userId } } } },
      skip: page * size,
      take: size,
      select: {
        id: true,
        title: true,
        order: true,
        club: {
          include: {
            _count: {
              select: {
                members: true,
                chapters: true,
              },
            },
          },
        },
        progress: {
          select: {
            member: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    }),
    prisma.club.findFirst({
      where: { id: clubId, members: { some: { userId } } },
      select: {
        _count: {
          select: {
            chapters: true,
            members: true,
          },
        },
      },
    }),
  ])

  if (!dbClub) throw new Error('Club not found')

  const chapters = dbChapters.map(c => {
    const userComplete = c.progress.some(p => p.member.userId === userId)
    const status = userComplete
      ? 'complete'
      : c.progress.length === 0
      ? 'not_started'
      : 'incomplete'

    const chapter: LoaderData['chapters'][number] = {
      id: c.id,
      title: c.title,
      status,
    }

    return chapter
  })

  return {
    chapters,
    totalPages: Math.ceil(dbClub._count.chapters / size),
  }
}
