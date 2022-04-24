import invariant from 'tiny-invariant'
import { json, LoaderFunction, useLoaderData, useParams } from 'remix'

import Post from '~/components/Post'
import { prisma } from '~/db.server'
import { requireUserId } from '~/session.server'

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
    }
  }[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)
  const searchParams = new URL(request.url).searchParams
  const chapterId = searchParams.get('chapterId')

  const [posts] = await Promise.all([
    getPosts(params.clubId, userId, chapterId),
  ])

  return json<LoaderData>({
    posts,
  })
}

export default function PostsPage() {
  const { clubId } = useParams()
  const { posts } = useLoaderData() as LoaderData

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <div className="grid gap-2 divide-y divide-background-tertiary bg-background-secondary">
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
  )
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
      chapter: { clubId },
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
          chapterId: { in: readChapters.map(c => c.id) },
          parentId: null,
          chapter: { clubId },
        }
      : {
          parentId: null,
          chapter: { clubId },
        }
  }

  const dbPosts = await prisma.post.findMany({
    where,
    select: {
      id: true,
      content: true,
      image: true,
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
    },
  }))

  return posts
}
