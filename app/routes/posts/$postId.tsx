import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { ChevronLeft } from 'react-feather'
import { useEffect, useRef, useState } from 'react'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react'

import Post from '~/components/Post'
import { prisma } from '~/db.server'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import PostDetails from '~/components/PostDetails'
import ReplyComposer from '~/components/ReplyComposer'
import SecondaryPost from '~/components/SecondaryPost'
import usePostReferrer from '~/hooks/use-post-referrer'

interface PostDetailsType {
  user: {
    id: string
    avatar: string
    username: string
  }
  chapter: {
    id: string
    title: string
    clubId: string
  }
  post: {
    id: string
    rootId: string | null
    parentId: string | null
    content: string
    image: string | null
    context: string | null
    replies: number
    createdAt: Date
  }
}

interface LoaderData {
  posts: PostDetailsType[]
  primaryPost: PostDetailsType
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.postId, 'expected postId')
  const userId = await requireUserId(request)
  const postDetails = await getPosts(params.postId, userId)

  if (!postDetails) throw new Response('Post not found', { status: 404 })

  return json<LoaderData>({
    posts: postDetails.posts,
    primaryPost: postDetails.primaryPost,
  })
}

export default function PostPage() {
  const key = useLocation().key
  const navigate = useNavigate()
  const data = useLoaderData() as LoaderData
  const { currentPostReferrer } = usePostReferrer()

  const listRef = useRef<HTMLDivElement>(null)
  const [lastPostHeight, setLastPostHeight] = useState(0)

  useEffect(() => {
    if (!listRef.current) return

    const list = listRef.current
    const nodes = list.querySelectorAll(':scope > div')
    if (nodes.length > 1) {
      const last = nodes[nodes.length - 1]
      setLastPostHeight(last.getBoundingClientRect().height)

      const primaryPost = list.querySelector('#primary-post')
      if (primaryPost) {
        primaryPost.scrollIntoView()
      }
    }
  }, [listRef, data.primaryPost])

  const goBack = () => {
    navigate(currentPostReferrer.path)
  }

  return (
    <div>
      <div className="sticky top-0 z-50 flex w-full items-center gap-2 border-b border-background-tertiary bg-background-primary px-4 py-2">
        <button type="button" onClick={goBack}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <Text variant="title3">Thread</Text>
      </div>
      <div>
        <div className="grid gap-2" ref={listRef}>
          {data.posts.map(post => (
            <div
              key={`${post.post.id}-${key}`}
              id={
                post.post.id === data.primaryPost.post.id
                  ? 'primary-post'
                  : 'secondary-post'
              }
              className={clsx(
                'scroll-m-16',
                post.post.parentId === data.primaryPost.post.id
                  ? 'px-4 py-2'
                  : 'p-4 pb-2',
                (post.post.id === data.primaryPost.post.id ||
                  post.post.parentId === data.primaryPost.post.id) &&
                  'border-b border-background-tertiary',
              )}
            >
              {post.post.id === data.primaryPost.post.id ? (
                <PostDetails {...post} />
              ) : post.post.parentId === data.primaryPost.post.id ? (
                <Post {...post} clubId={post.chapter.clubId} />
              ) : (
                <SecondaryPost {...post} />
              )}
            </div>
          ))}
        </div>
        {data.posts.length > 1 && (
          <div style={{ height: `calc(100vh - ${lastPostHeight + 49}px)` }} />
        )}
      </div>

      <ReplyComposer
        chapterId={data.primaryPost.chapter.id}
        parentId={data.primaryPost.post.id}
        rootId={data.primaryPost.post.rootId ?? data.primaryPost.post.id}
      />
    </div>
  )
}

// stolen from the mind of https://github.com/NoahWil5on
function getPostArray(array: PostDetailsType[], id: string) {
  let newArray: PostDetailsType[] = []
  let newParentId: string | null = id
  let lastParentId: string | null = id
  let parentId: string | null = id
  let isFirstRound = true
  while (true) {
    for (let i = 0; i < array.length; i++) {
      const a = array[i]
      if (
        (a.post.parentId === parentId && isFirstRound) ||
        (lastParentId === a.post.id && !isFirstRound)
      ) {
        newArray = [a, ...newArray]
      } else if (a.post.id === parentId) {
        newParentId = a.post.parentId
      }
    }
    if (parentId !== newParentId) {
      lastParentId = parentId
      parentId = newParentId
    } else {
      break
    }
    isFirstRound = false
  }
  return newArray
}

async function getPosts(postId: string, userId: string) {
  const dbPost = await prisma.post.findFirst({
    where: {
      id: postId,
      chapter: { club: { members: { some: { userId, removed: false } } } },
    },
    select: {
      id: true,
      rootId: true,
      chapter: {
        select: {
          clubId: true,
        },
      },
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
        ? { OR: [{ id: dbPost.rootId }, { rootId: dbPost.rootId }] }
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
          clubId: true,
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

  const posts = dbPosts.map(p => ({
    user: {
      id: p.member.user.id,
      avatar: p.member.user.avatar,
      username: p.member.user.username,
    },
    chapter: {
      id: p.chapter.id,
      title: p.chapter.title,
      clubId: p.chapter.clubId,
    },
    post: {
      id: p.id,
      content: p.content,
      image: p.image,
      context: p.context,
      replies: p._count.replies,
      createdAt: p.createdAt,
      parentId: p.parentId,
      rootId: dbPost.rootId,
    },
  }))

  const prunedPosts = getPostArray(posts, dbPost.id)
  // const prunedPosts = getPostThread(posts, dbPost.id)

  const primaryPost = posts.find(p => p.post.id === dbPost.id)

  if (!primaryPost) return null

  return { posts: prunedPosts, primaryPost }
}
