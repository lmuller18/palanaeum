import invariant from 'tiny-invariant'
import { json, LoaderFunction, useLoaderData, useParams } from 'remix'

import Post from '~/components/Post'
import { prisma } from '~/db.server'
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
      replies: number
      createdAt: Date
    }
  }[]
  nextChapter: { id: string; title: string; order: number } | null
  chapters: { id: string; title: string; order: number }[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)
  const searchParams = new URL(request.url).searchParams
  const chapterId = searchParams.get('chapterId')

  const [posts, nextChapter, chapters] = await Promise.all([
    getPosts(params.clubId, userId, chapterId),
    getNextChapter(userId, params.clubId),
    getChapterList(params.clubId, userId),
  ])

  return json<LoaderData>({
    posts,
    nextChapter,
    chapters,
  })
}

export default function PostsPage() {
  const { clubId } = useParams()
  const { posts, nextChapter, chapters } = useLoaderData() as LoaderData

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      <PostComposer
        defaultChapter={nextChapter ?? chapters[chapters.length - 1]}
        chapters={chapters}
      />
      <div className="grid gap-2 divide-y divide-background-tertiary border border-background-tertiary">
        {posts.map(post => (
          <div className="p-4" key={post.post.id}>
            <Post
              clubId={clubId}
              user={post.user}
              chapter={post.chapter}
              post={post.post}
            />
          </div>
        ))}
      </div>
    </>
  )
}

async function getChapterList(clubId: string, userId: string) {
  const dbChapters = await prisma.chapter.findMany({
    where: { clubId, club: { members: { some: { userId } } } },
    select: {
      id: true,
      title: true,
      order: true,
    },
    orderBy: {
      order: 'asc',
    },
  })

  return dbChapters
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
    },
    orderBy: {
      order: 'asc',
    },
  })

  if (!dbChapter) return null

  return {
    id: dbChapter.id,
    title: dbChapter.title,
    order: dbChapter.order,
  }
}

async function getPosts(
  clubId: string,
  userId: string,
  chapterId: string | null,
) {
  let where = {}

  if (chapterId) {
    where = {
      parentId: null,
      chapterId,
      chapter: {
        clubId,
        club: {
          members: { some: { userId } },
        },
      },
    }
  } else {
    const readChapters = await prisma.chapter.findMany({
      where: { clubId, progress: { some: { member: { userId } } } },
      select: {
        id: true,
      },
    })

    where = readChapters
      ? {
          OR: [
            { member: { userId } },
            { chapterId: { in: readChapters.map(c => c.id) } },
          ],
          parentId: null,
          chapter: { clubId },
        }
      : {
          parentId: null,
          chapter: {
            clubId,
            club: {
              members: { some: { userId } },
            },
          },
        }
  }

  const dbPosts = await prisma.post.findMany({
    where,
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
      replies: dbPost._count.replies,
      createdAt: dbPost.createdAt,
    },
  }))

  return posts
}
