import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import { LayoutGroup, motion } from 'framer-motion'
import { json, LoaderFunction, useLoaderData, useParams } from 'remix'

import Post from '~/components/Post'
import { prisma } from '~/db.server'
import { useMatchesData } from '~/utils'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
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
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.clubId, 'expected clubId')
  invariant(params.chapterId, 'expected chapterId')

  const userId = await requireUserId(request)

  const posts = await getPosts(params.clubId, params.chapterId, userId)

  return json<LoaderData>({
    posts,
  })
}

interface Chapter {
  id: string
  title: string
  order: number
}

function isChapter(chapter: Chapter | any): chapter is Chapter {
  return (
    (chapter as Chapter).id !== undefined &&
    (chapter as Chapter).title !== undefined &&
    (chapter as Chapter).order !== undefined
  )
}

export default function PostsPage() {
  const { clubId, chapterId } = useParams()
  const { posts } = useLoaderData() as LoaderData
  const data = useMatchesData(
    'routes/__app/clubs.$clubId/__club-home/chapters.$chapterId',
  )

  const chapter: Chapter | null = useMemo(() => {
    if (!data?.chapter) return null
    if (isChapter(data.chapter)) {
      return data.chapter
    } else {
      return null
    }
  }, [data])

  if (!clubId) throw new Error('Club Id Not Found')
  if (!chapterId) throw new Error('Chapter Id Not Found')

  return (
    <>
      {chapter && (
        <PostComposer defaultChapter={chapter} chapters={[chapter]} />
      )}
      <LayoutGroup>
        <motion.div
          layout
          className="grid gap-2 divide-y divide-background-tertiary border border-background-tertiary"
        >
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
            <motion.div layout className="p-4 pb-2" key={post.post.id}>
              <Post
                clubId={clubId}
                user={post.user}
                chapter={post.chapter}
                post={post.post}
              />
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>
    </>
  )
}

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
