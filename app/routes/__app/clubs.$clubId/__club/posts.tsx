import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { useLoaderData, useParams } from '@remix-run/react'

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

  const [posts, nextChapter, chapters] = await Promise.all([
    getPosts(params.clubId, userId, chapterId),
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

export { default as CatchBoundary } from '~/components/CatchBoundary'
