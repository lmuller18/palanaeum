import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { useLoaderData, useParams } from '@remix-run/react'

import Post from '~/components/Post'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import PostComposer from '~/components/PostComposer'
import { getPostsByChapter } from '~/models/posts.server'
import { getChapterDetails } from '~/models/chapters.server'

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.clubId, 'expected clubId')
  invariant(params.chapterId, 'expected chapterId')

  const userId = await requireUserId(request)

  const [posts, chapter] = await Promise.all([
    getPostsByChapter(params.clubId, params.chapterId, userId),
    getChapterDetails(params.chapterId, userId),
  ])

  if (!chapter) throw new Response('Chapter not found', { status: 404 })
  if (!posts) throw new Response('Problem finding posts', { status: 500 })

  return json({
    posts,
    chapter,
  })
}

export default function PostsPage() {
  const { clubId, chapterId } = useParams()
  const { posts, chapter } = useLoaderData<typeof loader>()

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
