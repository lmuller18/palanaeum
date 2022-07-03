import clsx from 'clsx'
import invariant from 'tiny-invariant'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, useParams } from '@remix-run/react'

import { prisma } from '~/db.server'
import Post from '~/components/Post'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import PieChart from '~/components/Chart/PieChart'
import DiscussionSummary from '~/components/DiscussionSummary'

interface LoaderData {
  counts: {
    remaining: number
    completed: number
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
      context: string | null
      replies: number
      createdAt: Date
    }
  } | null
  topDiscussion: {
    user: {
      id: string
      avatar: string
      username: string
    }
    chapter: {
      id: string
      title: string
    }
    discussion: {
      id: string
      title: string
    }
  } | null
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.chapterId, 'expected chapterId')
  const userId = await requireUserId(request)

  const [counts, chapter, topPost, topDiscussion] = await Promise.all([
    getCompletedMembersCount(params.chapterId, userId),
    getChapter(params.chapterId, userId),
    getTopPost(params.chapterId),
    getTopDiscussion(params.chapterId),
  ])

  if (!counts) throw new Response('Club not found', { status: 404 })
  if (!chapter) throw new Response('Chapter not found', { status: 404 })

  return json<LoaderData>({ counts, chapter, topPost, topDiscussion })
}

export default function ChapterHome() {
  const { clubId } = useParams()
  const { counts, chapter, topPost, topDiscussion } =
    useLoaderData() as LoaderData

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      <Header size="h4" font="serif" className="my-4">
        Chapter Overview
      </Header>

      {/* Chart Block */}
      <div className="mb-6 border-b border-t-2 border-indigo-500 border-b-background-tertiary bg-gradient-to-b from-indigo-400/10 via-transparent">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%231e222a' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="-mb-11 px-4 pt-4">
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
          <div className="h-52">
            <PieChart
              data={[
                { name: 'Completed', value: counts.completed },
                { name: 'Remaining', value: counts.remaining },
              ]}
            />
          </div>
        </div>
      </div>

      {/* TODO: Spoilers for top post and hottest discussion */}

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
                <div className="absolute inset-0 flex h-full w-full items-center justify-center text-center">
                  <Text variant="title2">
                    Spoilers! Catch up to your friends to view this post.
                  </Text>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <Text variant="title2" as="p" className="-mt-6" serif>
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
        <div className="relative">
          {topDiscussion ? (
            <>
              <div className={clsx(chapter.status !== 'complete' && 'blur-sm')}>
                <DiscussionSummary
                  user={topDiscussion?.user}
                  chapter={topDiscussion?.chapter}
                  discussion={topDiscussion?.discussion}
                />
              </div>
              {chapter.status !== 'complete' && (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center text-center">
                  <Text variant="title2" serif>
                    Spoilers! Catch up to your friends to view this discussion.
                  </Text>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <Text variant="title2" as="p" className="-mt-6" serif>
                No Discussions Yet.
              </Text>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export const handle = {
  backNavigation: () => '..',
}

export { default as CatchBoundary } from '~/components/CatchBoundary'

async function getCompletedMembersCount(chapterId: string, userId: string) {
  const [dbProgress, dbClub] = await Promise.all([
    prisma.progress.findMany({
      where: { chapterId },
    }),
    prisma.club.findFirst({
      where: {
        chapters: { some: { id: chapterId } },
        members: { some: { userId, removed: false } },
      },
      select: { createdAt: true, _count: { select: { members: true } } },
    }),
  ])

  if (!dbClub) return null

  const total = dbProgress.length

  return {
    completed: total,
    remaining: dbClub._count.members - total,
  }
}

async function getChapter(chapterId: string, userId: string) {
  const [dbChapter, dbClub] = await Promise.all([
    prisma.chapter.findFirst({
      where: {
        id: chapterId,
        club: { members: { some: { userId, removed: false } } },
      },
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

async function getTopDiscussion(chapterId: string) {
  const dbDiscussion = await prisma.discussion.findFirst({
    where: { chapterId },
    select: {
      id: true,
      title: true,
      member: {
        select: {
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
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

  if (!dbDiscussion) return null

  return {
    user: dbDiscussion.member.user,
    chapter: dbDiscussion.chapter,
    discussion: {
      id: dbDiscussion.id,
      title: dbDiscussion.title,
    },
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
      context: true,
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
