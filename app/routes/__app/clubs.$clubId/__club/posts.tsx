import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import SortIcon from '@heroicons/react/outline/AdjustmentsIcon'
import { useLoaderData, useParams, useSearchParams } from '@remix-run/react'

import Post from '~/components/Post'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import { getPosts } from '~/models/posts.server'
import PostComposer from '~/components/PostComposer'
import { getChapterList, getNextChapter } from '~/models/chapters.server'
interface LoaderData {
  posts: RequiredFuncType<typeof getPosts>
  nextChapter: FuncType<typeof getNextChapter>
  chapters: FuncType<typeof getChapterList>
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)
  const searchParams = new URL(request.url).searchParams
  const chapterId = searchParams.get('chapterId')
  const sortOrder = searchParams.get('sort') === 'chapter' ? 'chapter' : 'time'

  const [posts, nextChapter, chapters] = await Promise.all([
    getPosts(params.clubId, userId, chapterId, sortOrder),
    getNextChapter(userId, params.clubId),
    getChapterList(params.clubId, userId),
  ])

  if (!chapters) throw new Response('Problem finding chapters', { status: 500 })
  if (!posts) throw new Response('Problem finding posts', { status: 500 })

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
    <div>
      <PostComposer
        defaultChapter={nextChapter ?? chapters[chapters.length - 1]}
        chapters={chapters}
      />

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
    </div>
  )
}

const PostSort = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = searchParams.get('sort') === 'chapter' ? 'chapter' : 'time'

  const changeSort = () => {
    searchParams.set('sort', sort === 'time' ? 'chapter' : 'time')
    setSearchParams(searchParams)
  }

  return (
    <div className="flex w-full items-center justify-end py-4 text-blue-500">
      <button type="button" onClick={changeSort}>
        <Text variant="subtitle2" className="cursor-pointer font-bold" as="p">
          Sort{' '}
          <Text variant="subtitle2" as="span" className="font-normal">
            {sort === 'time' && '(Time)'}
            {sort === 'chapter' && '(Chapter)'}
          </Text>
        </Text>
      </button>
      <SortIcon className="h-6 w-6" />
    </div>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
