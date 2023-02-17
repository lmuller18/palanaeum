import clsx from 'clsx'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMatch } from 'react-router'

import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { Outlet, NavLink, useParams, useLoaderData } from '@remix-run/react'

import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import PageHeader from '~/components/PageHeader'
import { getChapter } from '~/models/chapters.server'

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.chapterId, 'expected chapterId')
  const userId = await requireUserId(request)

  const chapter = await getChapter(params.chapterId, userId)

  if (!chapter) throw new Response('Chapter not found', { status: 404 })

  return json({
    chapter: {
      id: chapter.id,
      title: chapter.title,
    },
  })
}

export default function ChapterPage() {
  const { clubId } = useParams()
  const { chapter } = useLoaderData<typeof loader>()

  const inDiscussion = !!useMatch(
    '/clubs/:clubId/chapters/:chapterId/discussions/*',
  )
  const inPosts = !!useMatch('/clubs/:clubId/chapters/:chapterId/posts/*')

  const title = useMemo(() => {
    if (inDiscussion) return 'Discussions'
    if (inPosts) return 'Posts'
    return 'Chapter Overview'
  }, [inDiscussion, inPosts])

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      <PageHeader
        title={chapter.title}
        caption={title}
        description="Chapter Overview"
      />

      <div className="content-wrapper relative">
        <Outlet />
      </div>

      <div className="h-14 md:hidden" />
    </>
  )
}

const SpringLink = ({
  to,
  children,
  end = false,
}: {
  to: string
  children: ReactNode
  end?: boolean
}) => (
  <NavLink
    to={to}
    className="flex flex-grow items-center justify-center rounded-lg text-center"
    end={end}
  >
    {({ isActive }) => (
      <div className="relative h-full w-full">
        {isActive && (
          <motion.div
            transition={{
              layout: {
                duration: 0.2,
                ease: 'easeOut',
              },
            }}
            layoutId="chapter-nav"
            className={clsx(
              'absolute inset-0 h-full w-full rounded-lg bg-background-tertiary shadow-md shadow-background-primary',
            )}
          />
        )}
        <Text className={clsx('relative', isActive && 'text-white')}>
          {children}
        </Text>
      </div>
    )}
  </NavLink>
)

export const handle = {
  nav: (match: { params: { chapterId: string; clubId: string } }) => (
    <div className="relative grid grid-cols-3 items-center overflow-hidden rounded-md bg-background-primary bg-opacity-50 p-1">
      <SpringLink
        to={`/clubs/${match.params.clubId}/chapters/${match.params.chapterId}/posts`}
      >
        Posts
      </SpringLink>
      <SpringLink
        to={`/clubs/${match.params.clubId}/chapters/${match.params.chapterId}`}
        end
      >
        Chapter
      </SpringLink>
      <SpringLink
        to={`/clubs/${match.params.clubId}/chapters/${match.params.chapterId}/discussions`}
      >
        Discussions
      </SpringLink>
    </div>
  ),
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
