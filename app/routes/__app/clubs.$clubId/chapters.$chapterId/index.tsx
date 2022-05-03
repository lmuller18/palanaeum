import clsx from 'clsx'
import { DateTime } from 'luxon'
import invariant from 'tiny-invariant'
import { json, LoaderFunction, useLoaderData, useParams } from 'remix'

import { prisma } from '~/db.server'
import Post from '~/components/Post'
import Chart from '~/components/Chart'
import Text from '~/elements/Typography/Text'
import { toLuxonDate, useUser } from '~/utils'
import { requireUserId } from '~/session.server'
import DiscussionSummary from '~/components/DiscussionSummary'

interface LoaderData {
  counts: {
    remaining: number
    completed: number
    readsByDay: {
      name: string
      y: number | null
      prediction?: number | null
    }[]
  }
  chapter: {
    id: string
    title: string
    order: number
    status: 'complete' | 'not_started' | 'incomplete'
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
  invariant(params.chapterId, 'expected chapterId')
  const userId = await requireUserId(request)

  const [counts, chapter, topPost] = await Promise.all([
    getCompletedMembersCount(params.chapterId, userId),
    getChapter(params.chapterId, userId),
    getTopPost(params.chapterId),
  ])

  if (!counts) throw new Response('Club not found', { status: 404 })
  if (!chapter) throw new Response('Chapter not found', { status: 404 })

  return json<LoaderData>({ counts, chapter, topPost })
}

export default function ChapterHome() {
  const user = useUser()
  const { clubId } = useParams()
  const { counts, chapter, topPost } = useLoaderData() as LoaderData

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      {/* Chart Block */}
      <div className="mb-6 border-b border-t-2 border-indigo-500 border-b-background-tertiary bg-gradient-to-b from-indigo-400/10 via-transparent">
        <div
          className="relative h-full w-full p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%231e222a' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="absolute inset-0 z-10 h-full w-full p-4">
            <Text variant="title2" as="h3" className="mb-3">
              Reading Trajectory
            </Text>
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <Text variant="title1">{counts.completed}</Text>{' '}
                <Text variant="subtitle1">Members Completed</Text>
              </div>
              <div>
                <Text variant="caption">{counts.remaining} Remaining</Text>
              </div>
            </div>
          </div>
          <div className="h-64">
            <Chart
              data={counts.readsByDay}
              disabled={!counts.readsByDay || counts.readsByDay.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Top Post Block */}
      <div className="mb-6 border-b border-t-2 border-sky-400 border-b-background-tertiary bg-gradient-to-b from-sky-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Top Post
        </Text>
        <div className="relative">
          {topPost ? (
            <>
              <div className={clsx(chapter.status !== 'complete' && 'blur-sm')}>
                <Post
                  clubId={clubId}
                  user={topPost.user}
                  chapter={topPost.chapter}
                  post={topPost.post}
                />
              </div>
              {chapter.status !== 'complete' && (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center">
                  <Text variant="title2">Post Unavailable</Text>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center">
              <Text variant="title2" as="p" className="-mt-6">
                No Posts Yet.
              </Text>
            </div>
          )}
        </div>
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

async function getCompletedMembersCount(chapterId: string, userId: string) {
  const [dbProgress, dbClub] = await Promise.all([
    prisma.progress.findMany({
      where: { chapterId },
    }),
    prisma.club.findFirst({
      where: {
        chapters: { some: { id: chapterId } },
        members: { some: { userId } },
      },
      select: { createdAt: true, _count: { select: { members: true } } },
    }),
  ])

  if (!dbClub) return null

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

  const { counts, total } = Object.keys(progress)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .reduce(
      (acc, cur) => {
        return {
          total: acc.total + progress[cur],
          counts: [
            ...acc.counts,
            {
              name: cur,
              y: acc.total + progress[cur],
            },
          ],
        }
      },
      { counts: [], total: 0 } as {
        counts: { name: string; y: number }[]
        total: number
      },
    )

  if (total === dbClub._count.members) {
    const readsByDay = [
      {
        name: toLuxonDate(dbClub.createdAt).toISODate(),
        y: 0,
      },
    ]
    let i = 0
    while (i < counts.length) {
      const cur = counts[i]
      const curDate = toLuxonDate(cur.name)
      const prev = readsByDay[readsByDay.length - 1]
      const prevDate = toLuxonDate(prev.name)
      const nextDate = prevDate.plus({ days: 2 })

      if (nextDate.startOf('day') >= curDate.startOf('day')) {
        readsByDay.push(cur)
        i += 1
      } else {
        readsByDay.push({
          name: nextDate.toISODate(),
          y: prev.y,
        })
      }
    }

    return {
      remaining: 0,
      completed: total,
      readsByDay,
    }
  } else if (total === 0) {
    return {
      remaining: dbClub._count.members,
      completed: 0,
      readsByDay: [],
    }
  } else {
    const readsByDay = [
      {
        name: toLuxonDate(dbClub.createdAt).toISODate(),
        y: 0,
      },
    ]
    let i = 0
    while (i < counts.length) {
      const cur = counts[i]
      const curDate = toLuxonDate(cur.name)
      const prev = readsByDay[readsByDay.length - 1]
      const prevDate = toLuxonDate(prev.name)
      const nextDate = prevDate.plus({ days: 2 })

      if (nextDate.startOf('day') >= curDate.startOf('day')) {
        readsByDay.push(cur)
        i += 1
      } else {
        readsByDay.push({
          name: nextDate.toISODate(),
          y: prev.y,
        })
      }
    }

    return {
      remaining: dbClub._count.members - total,
      completed: total,
      readsByDay: [
        ...readsByDay.slice(0, readsByDay.length - 1),
        {
          ...readsByDay[readsByDay.length - 1],
          prediction: readsByDay[readsByDay.length - 1].y,
        },
        {
          name: DateTime.now().plus({ days: 2 }).toISODate(),
          y: null,
          prediction: dbClub._count.members,
        },
      ],
    }
  }
}

async function getChapter(chapterId: string, userId: string) {
  const [dbChapter, dbClub] = await Promise.all([
    prisma.chapter.findFirst({
      where: { id: chapterId, club: { members: { some: { userId } } } },
      select: {
        id: true,
        order: true,
        title: true,
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
    }),
    prisma.club.findFirst({
      where: { chapters: { some: { id: chapterId } } },
      select: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    }),
  ])

  if (!dbClub || !dbChapter) return null

  const userComplete = dbChapter.progress.some(p => p.member.userId === userId)
  const status: 'complete' | 'not_started' | 'incomplete' = userComplete
    ? 'complete'
    : dbChapter.progress.length === 0
    ? 'not_started'
    : 'incomplete'

  return {
    id: dbChapter.id,
    title: dbChapter.title,
    order: dbChapter.order,
    status,
  }
}

async function getTopPost(chapterId: string) {
  const dbPost = await prisma.post.findFirst({
    where: { chapterId, parentId: null },
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
