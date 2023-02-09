import { Suspense } from 'react'
import invariant from 'tiny-invariant'

import {
  Await,
  useParams,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react'
import { defer } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import SortIcon from '@heroicons/react/outline/AdjustmentsIcon'

import Post from '~/components/Post'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import { getPosts } from '~/models/posts.server'
import PostComposer from '~/components/PostComposer'
import { getChapterList, getNextChapter } from '~/models/chapters.server'

const getPostsLong = async (
  clubId: string,
  userId: string,
  chapterId: string | null,
  sortOrder: 'chapter' | 'time' | undefined,
) => {
  const posts = await getPosts(clubId, userId, chapterId, sortOrder)

  if (!posts) throw new Response('Problem finding posts', { status: 500 })
  return posts
}

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)
  const searchParams = new URL(request.url).searchParams
  const chapterId = searchParams.get('chapterId')
  const sortOrder = searchParams.get('sort') === 'time' ? 'time' : 'chapter'

  const postsPromise = getPostsLong(params.clubId, userId, chapterId, sortOrder)

  const [nextChapter, chapters] = await Promise.all([
    getNextChapter(userId, params.clubId),
    getChapterList(params.clubId, userId),
  ])

  if (!chapters) throw new Response('Problem finding chapters', { status: 500 })

  return defer({
    posts: postsPromise,
    nextChapter,
    chapters,
  })
}

export default function PostsPage() {
  const { clubId } = useParams()
  const { posts, nextChapter, chapters } = useLoaderData<typeof loader>()

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <div className="mb-4">
      <PostComposer
        defaultChapter={nextChapter ?? chapters[chapters.length - 1]}
        chapters={chapters}
      />

      <Suspense fallback={<PostLoader />}>
        <Await resolve={posts} errorElement={<p>Error loading posts.</p>}>
          {posts => (
            <>
              {posts.length !== 0 && <PostSort />}

              <div className="grid gap-2 border border-background-tertiary">
                {!posts.length && (
                  <div className="p-4">
                    <Text variant="body1" as="p" className="mb-2">
                      No posts yet for this club.
                    </Text>
                    <Text variant="body2" as="p">
                      Start contributing to the conversation above.
                    </Text>
                  </div>
                )}
                {posts.map(post => (
                  <div
                    key={post.post.id}
                    className="border-b border-background-tertiary p-4 pb-2"
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
            </>
          )}
        </Await>
      </Suspense>
    </div>
  )
}

const PostLoader = () => {
  return (
    <div className="mt-12 grid gap-2 divide-y divide-background-tertiary border border-background-tertiary">
      {Array.from(Array(3).keys()).map(i => (
        <div key={`skeleton-${i}`} className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-700" />
            <div className="flex flex-col gap-2">
              <div className="h-2 w-16 animate-pulse rounded-lg bg-gray-600" />
              <div className="h-2 w-11 animate-pulse rounded-lg bg-gray-700" />
            </div>
          </div>
          <div className="flex animate-pulse flex-col gap-2">
            <div className="flex w-full items-center space-x-2">
              <div className="h-2.5 w-32 rounded-full bg-gray-700"></div>
              <div className="h-2.5 w-24 rounded-full bg-gray-600"></div>
              <div className="h-2.5 w-full rounded-full bg-gray-600"></div>
            </div>
            <div className="flex w-full max-w-[480px] items-center space-x-2">
              <div className="h-2.5 w-full rounded-full bg-gray-700"></div>
              <div className="h-2.5 w-full rounded-full bg-gray-600"></div>
              <div className="h-2.5 w-24 rounded-full bg-gray-600"></div>
            </div>
            <div className="flex w-full max-w-[400px] items-center space-x-2">
              <div className="h-2.5 w-full rounded-full bg-gray-600"></div>
              <div className="h-2.5 w-80 rounded-full bg-gray-700"></div>
              <div className="h-2.5 w-full rounded-full bg-gray-600"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const PostSort = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = searchParams.get('sort') === 'time' ? 'time' : 'chapter'

  const changeSort = () => {
    searchParams.set('sort', sort === 'time' ? 'chapter' : 'time')
    setSearchParams(searchParams)
  }

  return (
    <div className="flex w-full justify-end py-4">
      <button
        type="button"
        onClick={changeSort}
        className="flex items-center gap-1 text-blue-500 hover:text-blue-400 active:text-blue-600"
      >
        <Text variant="subtitle2" className="font-bold" as="p">
          Sort{' '}
          <Text variant="subtitle2" as="span" className="font-normal">
            {sort === 'time' && '(Time)'}
            {sort === 'chapter' && '(Chapter)'}
          </Text>
        </Text>
        <SortIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
