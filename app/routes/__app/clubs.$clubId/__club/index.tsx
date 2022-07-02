import invariant from 'tiny-invariant'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, useParams } from '@remix-run/react'
import {
  add,
  isSameDay,
  parseISO,
  startOfDay,
  startOfToday,
  eachDayOfInterval,
} from 'date-fns'

import { useUser } from '~/utils'
import Post from '~/components/Post'
import { prisma } from '~/db.server'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
// import NextChapter from '~/components/NextChapter'
import AreaChart from '~/components/Chart/AreaChart'
import DiscussionSummary from '~/components/DiscussionSummary'
import NextChapterSection from '~/components/NextChapterSection_Old'
import { InformationCircleIcon } from '@heroicons/react/solid'
import TextLink from '~/elements/TextLink'

interface LoaderData {
  club: {
    id: string
    title: string
  }
  nextChapter: {
    id: string
    title: string
    membersCompleted: number
    status: 'incomplete' | 'not_started'
  } | null
  counts: {
    read: number
    remaining: number
    countsByDay: {
      name: string
      date: Date
      y: number
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
      context: string | null
      replies: number
      createdAt: Date
    }
  } | null
  isOwner: boolean
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
    isOwner: club.ownerId === userId,
  })
}

export default function ClubPage() {
  const user = useUser()
  const { clubId } = useParams()
  const { nextChapter, counts, club, topPost, isOwner } =
    useLoaderData() as LoaderData

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      {/* Owner Actions */}
      {isOwner && (
        <div className="mb-6 rounded-md bg-background-secondary p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon
                className="mt-[2px] h-5 w-5 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium text-blue-400">Admin Actions</p>
              <p className="mt-3 flex items-center gap-4 text-sm">
                <TextLink to="." color="default">
                  Edit Club
                </TextLink>
                <TextLink to="members/manage" color="default">
                  Manage Members
                </TextLink>
                <div className="flex flex-grow items-center justify-end">
                  <TextLink to="." color="rose">
                    Delete Club
                  </TextLink>
                </div>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Chapter Block */}
      {/* <div
        className="mb-6 border-b border-t-2 border-teal-400 border-b-background-tertiary bg-gradient-to-b from-teal-400/10 via-transparent p-4"
      >
        <div>
          <Text variant="title2" className="mb-4" as="h3">
            Next Chapter: Not Started
          </Text>

          <NextChapter
            chapter={{ ...nextChapter, status: 'not_started' }}
            club={club}
          />
        </div>
      </div>*/}

      <NextChapterSection
        chapter={nextChapter}
        club={club}
        recentDiscussion={null}
      />

      {/* Chart Block */}
      <div className="mb-6 border-b border-t-2 border-indigo-500 border-b-background-tertiary bg-gradient-to-b from-indigo-400/10 via-transparent">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%231e222a' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="px-4 pt-4">
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
          <div className="h-52">
            <AreaChart
              data={counts.countsByDay}
              disabled={
                !counts.countsByDay ||
                counts.countsByDay.length === 0 ||
                counts.read === 0
              }
            />
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
            {/* {topPost.chapter.status !== 'complete' && (
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
      _count: {
        select: {
          progress: true,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  if (!dbChapter) return null

  const status: 'not_started' | 'incomplete' =
    dbChapter._count.progress === 0 ? 'not_started' : 'incomplete'

  return {
    id: dbChapter.id,
    title: dbChapter.title,
    membersCompleted: dbChapter._count.progress,
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
    const key = startOfDay(cur.completedAt).toISOString()

    if (acc[key]) {
      return {
        ...acc,
        [key]: acc[key] + 1,
      }
    } else {
      return {
        ...acc,
        [key]: 1,
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
              date: parseISO(cur),
              y: acc.remaining - progress[cur],
            },
          ],
        }
      },
      { counts: [], remaining: dbClub._count.chapters } as {
        counts: { name: string; date: Date; y: number }[]
        remaining: number
      },
    )

  const startDate = add(dbClub.createdAt, { days: -1 })

  let current = {
    name: startDate.toISOString(),
    date: startDate,
    y: dbClub._count.chapters,
  }

  const range = eachDayOfInterval({
    start: startDate,
    end: startOfToday(),
  })

  const countsByDay: Array<{ name: string; date: Date; y: number }> = [current]

  range.forEach(date => {
    const foundDate = counts.find(d => isSameDay(date, d.date))
    if (foundDate) {
      countsByDay.push(foundDate)
      current = foundDate
    } else {
      countsByDay.push(current)
    }
  })

  return {
    read: dbProgress.length,
    remaining: remaining,
    countsByDay,
  }
}

async function getClub(clubId: string, userId: string) {
  const club = await prisma.club.findFirst({
    where: { id: clubId, members: { some: { userId } } },
    select: { id: true, title: true, ownerId: true },
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
      context: true,
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
      context: dbPost.context,
      replies: dbPost._count.replies,
      createdAt: dbPost.createdAt,
    },
  }

  return post
}
