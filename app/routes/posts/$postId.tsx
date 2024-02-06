import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { ChevronLeft } from 'react-feather'
import { useRef, useState, useEffect } from 'react'

import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { ExclamationIcon } from '@heroicons/react/outline'
import { useLocation, useNavigate, useLoaderData } from '@remix-run/react'

import { useUser } from '~/utils'
import { prisma } from '~/db.server'
import ReplyPost from '~/components/Post'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import PrimaryPost from '~/components/PostDetails'
import ParentPost from '~/components/SecondaryPost'
import ReplyComposer from '~/components/ReplyComposer'
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
    userComplete: boolean
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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.postId, 'expected postId')
  const userId = await requireUserId(request)
  const postDetails = await getPosts(params.postId, userId)

  if (!postDetails) throw new Response('Post not found', { status: 404 })

  return json({
    posts: postDetails.posts,
    primaryPost: postDetails.primaryPost,
    hiddenReplies: postDetails.hiddenReplies,
  })
}

export default function PostPage() {
  const key = useLocation().key
  const navigate = useNavigate()
  const data = useLoaderData<typeof loader>()
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
      <div
        className="sticky top-0 z-50 flex w-full items-center gap-2 border-b border-background-tertiary bg-background-primary px-4 py-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
        }}
      >
        <button type="button" onClick={goBack}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <Text variant="title3">Thread</Text>
      </div>
      <div>
        <div className="grid gap-2" ref={listRef}>
          {data.posts.map(post => (
            <FeedPost
              key={`${post.post.id}-${key}`}
              primaryPost={data.primaryPost}
              post={post}
              hiddenReplies={data.hiddenReplies}
            />
          ))}
        </div>
        <div
          style={{
            height:
              data.posts.length > 1
                ? `calc(100vh - ${lastPostHeight + 49}px)`
                : 76,
          }}
        />
      </div>

      <ReplyComposer
        chapterId={data.primaryPost.chapter.id}
        parentId={data.primaryPost.post.id}
        rootId={data.primaryPost.post.rootId ?? data.primaryPost.post.id}
      />
    </div>
  )
}

const FeedPost = ({
  primaryPost,
  post,
  hiddenReplies,
}: {
  primaryPost: Serialized<PostDetailsType>
  post: Serialized<PostDetailsType>
  hiddenReplies: boolean
}) => {
  const user = useUser()
  const isPrimaryPost = primaryPost.post.id === post.post.id
  const isReplyPost = primaryPost.post.id === post.post.parentId
  // main poster hasn't read chapter and you are not the main poster
  const showSpoilerWarning =
    !primaryPost.chapter.userComplete && user.id !== post.user.id

  return (
    <div
      id={isPrimaryPost ? 'primary-post' : 'secondary-post'}
      style={{
        scrollMargin: 'calc(env(safe-area-inset-top) + 64px)',
      }}
      className={clsx(
        'scroll-m-16',
        isReplyPost ? 'px-4 py-2' : 'p-4 pb-2',
        (isPrimaryPost || isReplyPost) && 'border-b border-background-tertiary',
      )}
    >
      {isPrimaryPost ? (
        <>
          <PrimaryPost {...post} />
          {showSpoilerWarning && (
            <div className="-mx-4 mt-2 border-y border-amber-400/40 bg-amber-400/10 px-4 py-1">
              <ExclamationIcon className="inline h-4 w-4 text-amber-400" />
              <Text as="span" variant="caption" className="ml-2">
                Poster has not completed this chapter yet.
              </Text>
            </div>
          )}
          {hiddenReplies && (
            <div className="-mx-4 mt-2 border-y border-amber-400/40 bg-amber-400/10 px-4 py-1">
              <ExclamationIcon className="inline h-4 w-4 text-amber-400" />
              <Text as="span" variant="caption" className="ml-2">
                Some replies have been hidden until the chapter is complete.
              </Text>
            </div>
          )}
        </>
      ) : isReplyPost ? (
        <ReplyPost {...post} clubId={post.chapter.clubId} />
      ) : (
        <ParentPost {...post} />
      )}
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
        : { OR: [{ id: dbPost.id }, { rootId: dbPost.id }] }),
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
          progress: true,
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
      userComplete: p.member.progress.some(
        prog => prog.chapterId === p.chapter.id,
      ),
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

  const primaryPost = posts.find(p => p.post.id === dbPost.id)

  if (!primaryPost) return null

  const filteredPosts = prunedPosts.filter(p => {
    // main poster hasn't read chapter and you are the main poster
    const isReplyPost = primaryPost.post.id === p.post.parentId

    const hideSpoilers =
      isReplyPost &&
      primaryPost.user.id === userId &&
      !primaryPost.chapter.userComplete &&
      p.user.id !== userId

    return !hideSpoilers
  })

  return {
    posts: filteredPosts,
    primaryPost,
    hiddenReplies: filteredPosts.length !== prunedPosts.length,
  }
}
