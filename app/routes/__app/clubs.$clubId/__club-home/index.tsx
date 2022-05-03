import { DateTime } from 'luxon'
import invariant from 'tiny-invariant'
import {
  json,
  Link,
  useParams,
  useFetcher,
  useLoaderData,
  LoaderFunction,
} from 'remix'

import Post from '~/components/Post'
import { prisma } from '~/db.server'
import Chart from '~/components/Chart'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { toLuxonDate, useUser } from '~/utils'
import { requireUserId } from '~/session.server'
import DiscussionSummary from '~/components/DiscussionSummary'

interface LoaderData {
  club: {
    id: string
    title: string
  }
  nextChapter: {
    id: string
    title: string
    membersCompleted: number
    status: 'complete' | 'incomplete' | 'not_started'
  } | null
  counts: {
    read: number
    remaining: number
    countsByDay: {
      name: string
      y: number | null
      prediction?: number | null
    }[]
  }
  topPost: {
    user: {
      id: string
      avatar: string
      username: string
    }
    chapter: {
      id: string
      title: string
    }
    post: {
      id: string
      content: string
      image: string | null
      replies: number
      createdAt: Date
    }
  } | null
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)

  const [nextChapter, counts, club, topPost] = await Promise.all([
    getNextChapter(userId, params.clubId),
    getChaptersReadByDay(userId, params.clubId),
    getClub(params.clubId, userId),
    getTopPost(params.clubId),
  ])

  if (!club) throw new Response('Club not found', { status: 404 })
  if (!counts) throw new Response('Club not found', { status: 404 })

  return json<LoaderData>({
    nextChapter,
    counts,
    club,
    topPost,
  })
}

export default function ClubPage() {
  const { clubId } = useParams()
  const user = useUser()
  const { nextChapter, counts, club, topPost } = useLoaderData() as LoaderData
  const nextChapterFetcher = useFetcher()

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      {/* Next Chapter Block */}
      <div className="mb-6 border-b border-t-2 border-teal-400 border-b-background-tertiary bg-gradient-to-b from-teal-400/10 via-transparent p-4">
        <div>
          <Text variant="title2" className="mb-4" as="h3">
            Next Chapter
          </Text>

          {nextChapter ? (
            <div>
              <TextLink
                to={`chapters/${nextChapter.id}`}
                variant="title3"
                className="mb-2 block w-fit"
              >
                {nextChapter.title}
              </TextLink>

              {nextChapter.status === 'incomplete' && (
                <Text variant="body2">
                  Completed by {nextChapter.membersCompleted - 1} other members.
                </Text>
              )}
              {/* <Text variant="body2">Completed by all other members.</Text> */}
              {nextChapter.status === 'not_started' && (
                <Text variant="body2">Not completed by any other members.</Text>
              )}

              <div className="mt-3 flex items-center justify-around">
                <Link
                  to={`chapters/${nextChapter.id}`}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-background-tertiary px-4 py-2 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  View Chapter
                </Link>
                <nextChapterFetcher.Form
                  action={`/api/chapters/${nextChapter.id}/read`}
                  method="post"
                >
                  {nextChapter.status === 'complete' ? (
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
                </nextChapterFetcher.Form>
              </div>
            </div>
          ) : (
            <div>
              <Text as="p" variant="title3">
                You have finished {club.title}!
              </Text>
              <Text as="p" variant="body1">
                Remember to keep continuing in the conversations with other club
                members.
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Chart Block */}
      <div className="mb-6 border-b border-t-2 border-indigo-500 border-b-background-tertiary bg-gradient-to-b from-indigo-400/10 via-transparent">
        <div
          className="relative h-full w-full p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%231e222a' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="h-64">
            <Chart
              data={counts.countsByDay}
              disabled={counts.countsByDay.length === 0}
            />
          </div>
          <div className="absolute inset-0 h-full w-full p-4">
            <Text variant="title2" as="h3" className="mb-3">
              Reading Trajectory
            </Text>
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <Text variant="title1">{counts.read}</Text>{' '}
                <Text variant="subtitle1">Chapters</Text>
              </div>
              <div>
                <Text variant="caption">{counts.remaining} Remaining</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Post Block */}
      <div className="mb-6 border-b border-t-2 border-sky-400 border-b-background-tertiary bg-gradient-to-b from-sky-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Top Post
        </Text>
        {topPost ? (
          <>
            {/* <div className={clsx(chapter.status !== 'complete' && 'blur-sm')}> */}
            <Post
              clubId={clubId}
              user={topPost.user}
              chapter={topPost.chapter}
              post={topPost.post}
            />
            {/* </div> */}
            {/* {chapter.status !== 'complete' && (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center">
                <Text variant="title2">Post Unavailable</Text>
              </div>
            )} */}
          </>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center">
            <Text variant="title2" as="p" className="-mt-6">
              No Posts Yet.
            </Text>
          </div>
        )}
      </div>

      {/* Top Discussion Block */}
      <div className="mb-6 border-b border-t-2 border-emerald-400 border-b-background-tertiary bg-gradient-to-b from-emerald-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Hottest Discussion
        </Text>
        <DiscussionSummary
          user={user}
          chapter={{ id: '1', title: 'Chapter 5' }}
          discussion={{ id: '1', title: '3 Pure Tones and 3 Shards of Roshar' }}
        />
      </div>
    </>
  )
}

async function getNextChapter(userId: string, clubId: string) {
  const dbChapter = await prisma.chapter.findFirst({
    where: {
      clubId,
      progress: {
        none: { member: { userId } },
      },
      club: { members: { some: { userId } } },
    },
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
  })

  if (!dbChapter) return null

  const userComplete = dbChapter.progress.some(p => p.member.userId === userId)
  const status: 'complete' | 'not_started' | 'incomplete' = userComplete
    ? 'complete'
    : dbChapter.progress.length === 0
    ? 'not_started'
    : 'incomplete'

  return {
    id: dbChapter.id,
    title: dbChapter.title,
    membersCompleted: dbChapter.progress.length,
    status,
  }
}

async function getChaptersReadByDay(userId: string, clubId: string) {
  const [dbProgress, dbClub] = await Promise.all([
    prisma.progress.findMany({
      where: { chapter: { clubId }, member: { userId } },
    }),
    prisma.club.findFirst({
      where: { id: clubId, members: { some: { userId } } },
      select: { createdAt: true, _count: { select: { chapters: true } } },
    }),
  ])

  if (!dbClub) return null
  if (!dbProgress || dbProgress.length === 0)
    return {
      read: 0,
      remaining: dbClub._count.chapters,
      countsByDay: [],
    }

  const progress = dbProgress.reduce((acc, cur) => {
    const date = toLuxonDate(cur.completedAt).startOf('day').toISODate()

    if (acc[date]) {
      return {
        ...acc,
        [date]: acc[date] + 1,
      }
    } else {
      return {
        ...acc,
        [date]: 1,
      }
    }
  }, {} as { [key: string]: number })

  const { counts, remaining } = Object.keys(progress)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .reduce(
      (acc, cur) => {
        return {
          remaining: acc.remaining - progress[cur],
          counts: [
            ...acc.counts,
            {
              name: cur,
              y: acc.remaining - progress[cur],
            },
          ],
        }
      },
      { counts: [], remaining: dbClub._count.chapters } as {
        counts: { name: string; y: number }[]
        remaining: number
      },
    )

  if (remaining === 0) {
    const countsByDay = [
      {
        name: toLuxonDate(dbClub.createdAt).toISODate(),
        y: dbClub._count.chapters,
      },
    ]
    let i = 0
    while (i < counts.length) {
      const cur = counts[i]
      const curDate = toLuxonDate(cur.name)
      const prev = countsByDay[countsByDay.length - 1]
      const prevDate = toLuxonDate(prev.name)
      const nextDate = prevDate.plus({ days: 2 })

      if (nextDate.startOf('day') >= curDate.startOf('day')) {
        countsByDay.push(cur)
        i += 1
      } else {
        countsByDay.push({
          name: nextDate.toISODate(),
          y: prev.y,
        })
      }
    }

    return {
      read: dbProgress.length,
      remaining: remaining,
      countsByDay,
    }
  } else {
    const countsByDay = [
      {
        name: toLuxonDate(dbClub.createdAt).toISODate(),
        y: dbClub._count.chapters,
      },
    ]
    let i = 0
    while (i < counts.length) {
      const cur = counts[i]
      const curDate = toLuxonDate(cur.name)
      const prev = countsByDay[countsByDay.length - 1]
      const prevDate = toLuxonDate(prev.name)
      const nextDate = prevDate.plus({ days: 2 })

      if (nextDate.startOf('day') >= curDate.startOf('day')) {
        countsByDay.push(cur)
        i += 1
      } else {
        countsByDay.push({
          name: nextDate.toISODate(),
          y: prev.y,
        })
      }
    }

    const newCounts = {
      read: dbProgress.length,
      remaining: remaining,
      countsByDay: [
        ...countsByDay.slice(0, countsByDay.length - 1),
        {
          ...countsByDay[countsByDay.length - 1],
          prediction: countsByDay[countsByDay.length - 1].y,
        },
        {
          name: DateTime.now().plus({ days: 2 }).toISODate(),
          y: null,
          prediction: 0,
        },
      ],
    }

    return newCounts
  }
}

async function getClub(clubId: string, userId: string) {
  const club = await prisma.club.findFirst({
    where: { id: clubId, members: { some: { userId } } },
    select: { id: true, title: true },
  })

  return club
}

async function getTopPost(clubId: string) {
  const dbPost = await prisma.post.findFirst({
    where: { chapter: { clubId }, parentId: null },
    select: {
      id: true,
      content: true,
      image: true,
      createdAt: true,
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
      member: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    take: 1,
    orderBy: [
      {
        replies: {
          _count: 'desc',
        },
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  if (!dbPost) return null

  const post = {
    user: {
      id: dbPost.member.user.id,
      avatar: dbPost.member.user.avatar,
      username: dbPost.member.user.username,
    },
    chapter: {
      id: dbPost.chapter.id,
      title: dbPost.chapter.title,
    },
    post: {
      id: dbPost.id,
      content: dbPost.content,
      image: dbPost.image,
      replies: dbPost._count.replies,
      createdAt: dbPost.createdAt,
    },
  }

  return post
}
