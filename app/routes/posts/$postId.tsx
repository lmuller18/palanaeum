import { json, LoaderFunction, useLoaderData } from 'remix'

import { prisma } from '~/db.server'
import invariant from 'tiny-invariant'
import { requireUserId } from '~/session.server'

interface Post {
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

  parent?: Post
  replies: Post[]
}

interface LoaderData {
  rootPost: Post
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.postId, 'expected postId')
  const userId = await requireUserId(request)
  const rootPost = await getPosts(params.postId, userId)

  if (!rootPost) throw new Response('Post not found', { status: 404 })

  return json<LoaderData>({ rootPost })
}

export default function PostPage() {
  const data = useLoaderData() as LoaderData

  return (
    <div>
      Post
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>
        {JSON.stringify(
          { x: { x: { x: { x: { x: { x: { x: 1 } } } } } } },
          null,
          2,
        )}
      </pre>
    </div>
  )
}

type FlatPost = Omit<Post, 'parent' | 'replies'> & {
  post: { parentId: string | null }
}

function createDataset(dataset: FlatPost[]): Post {
  const hashTable = Object.create(null)
  dataset.forEach(
    aData => (hashTable[aData.post.id] = { ...aData, replies: [] }),
  )
  const dataTree: Post[] = []
  dataset.forEach(aData => {
    if (aData.post.parentId)
      hashTable[aData.post.parentId].replies.push(hashTable[aData.post.id])
    else dataTree.push(hashTable[aData.post.id])
  })
  return dataTree[0]
}

async function getPosts(postId: string, userId: string) {
  const dbPost = await prisma.post.findFirst({
    where: {
      id: postId,
      chapter: { club: { members: { some: { userId } } } },
    },
    select: {
      id: true,
      rootId: true,
    },
  })

  if (!dbPost) return null

  /**
   * if root id is null
   * it is the root
   * get where id = p.id
   * and rootId = p.id
   *
   * else
   * get where rootId = p.rootId
   */
  const dbPosts = await prisma.post.findMany({
    where: {
      ...(dbPost.rootId
        ? { rootId: dbPost.rootId }
        : {
            OR: [{ id: dbPost.id }, { rootId: dbPost.id }],
          }),
    },
    select: {
      id: true,
      content: true,
      image: true,
      context: true,
      createdAt: true,
      parentId: true,
      rootId: true,
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
      parentId: dbPost.parentId,
    },
  }))

  const postTree = createDataset(posts)
  return postTree
}
