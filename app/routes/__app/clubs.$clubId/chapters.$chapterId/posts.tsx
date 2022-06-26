import invariant from 'tiny-invariant'
import { json, LoaderFunction } from '@remix-run/node'
import { useLoaderData, useParams } from '@remix-run/react'

import Post from '~/components/Post'
import { prisma } from '~/db.server'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import PostComposer from '~/components/PostComposer'

interface LoaderData {
  posts: {
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
  }[]
  chapter: {
    id: string
    title: string
    order: number
    status: 'complete' | 'not_started' | 'incomplete'
  }
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.clubId, 'expected clubId')
  invariant(params.chapterId, 'expected chapterId')

  const userId = await requireUserId(request)

  const [posts, chapter] = await Promise.all([
    getPosts(params.clubId, params.chapterId, userId),
    getChapter(params.chapterId, userId),
  ])

  if (!chapter) throw new Response('Chapter not found', { status: 404 })
  if (!posts) throw new Response('Problem finding posts', { status: 500 })

  return json<LoaderData>({
    posts,
    chapter,
  })
}

export default function PostsPage() {
  const { clubId, chapterId } = useParams()
  const { posts, chapter } = useLoaderData() as LoaderData

  if (!clubId) throw new Error('Club Id Not Found')
  if (!chapterId) throw new Error('Chapter Id Not Found')

  return (
    <div>
      <Header size="h4" font="serif" className="mb-4">
        Posts
      </Header>
      <PostComposer defaultChapter={chapter} chapters={[chapter]} />
      <div className="grid gap-2 border border-background-tertiary">
        {!posts.length && (
          <div className="p-4">
            <Text variant="body1" as="p" className="mb-2">
              No posts yet for this chapter.
            </Text>
            <Text variant="body2" as="p">
              Start contributing to the conversation above.
            </Text>
          </div>
        )}
        {posts.map(post => (
          <div
            className="border-b border-background-tertiary p-4 pb-2"
            key={post.post.id}
          >
            <Post
              clubId={clubId}
              user={post.user}
              chapter={post.chapter}
              post={post.post}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const handle = {
  backNavigation: () => '.',
}

export { default as CatchBoundary } from '~/components/CatchBoundary'

async function getPosts(clubId: string, chapterId: string, userId: string) {
  const dbPosts = await prisma.post.findMany({
    where: {
      parentId: null,
      chapterId,
      chapter: {
        clubId,
        club: {
          members: { some: { userId } },
        },
      },
    },
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
    orderBy: {
      createdAt: 'desc',
    },
  })

  const posts = dbPosts.map(dbPost => ({
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
  }))

  return posts
}

async function getChapter(chapterId: string, userId: string) {
  const dbChapter = await prisma.chapter.findFirst({
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
    order: dbChapter.order,
    status,
  }
}
