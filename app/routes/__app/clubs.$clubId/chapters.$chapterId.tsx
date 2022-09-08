import clsx from 'clsx'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import { motion } from 'framer-motion'
import { json } from '@remix-run/node'
import type { ReactNode } from 'react'
import type { LoaderArgs } from '@remix-run/node'
import { ChevronLeftIcon } from '@heroicons/react/outline'
import { Outlet, NavLink, useParams, useMatches } from '@remix-run/react'

import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
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

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      <div className="mb-4 h-12" />

      <div className="relative mx-auto max-w-lg px-4">
        <Outlet />
      </div>

      <div className="h-14" />
    </>
  )
}

const TopNav = ({
  title,
  clubId,
  chapterId,
}: {
  title: string
  clubId: string
  chapterId: string
}) => {
  const matches = useMatches()
  const backNavigation = useMemo(() => {
    const foundBackNav = matches
      .filter(match => match.handle && match.handle.backNavigation)
      .at(-1)

    if (foundBackNav) {
      const nav = foundBackNav.handle?.backNavigation()

      if (nav === null) return null
      if (typeof nav === 'string') return nav
    }

    return '..'
  }, [matches])

  if (!backNavigation) return null

  const absoluteUrl = `/clubs/${clubId}/chapters/${chapterId}/${backNavigation}`

  return (
    <div className="bg-background-secondary">
      <div className="mx-auto flex max-w-lg items-center gap-2 px-4 pb-4">
        <TextLink to={absoluteUrl}>
          <ChevronLeftIcon className="h-4 w-4" />
        </TextLink>
        <TextLink
          serif
          variant="title2"
          className="block"
          to={`/clubs/${clubId}/chapters/${chapterId}`}
        >
          {title}
        </TextLink>
      </div>
    </div>
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
  topNav: ({
    params: { clubId, chapterId },
    data: {
      chapter: { title },
    },
  }: {
    params: {
      clubId: string
      chapterId: string
    }
    data: { chapter: { title: string } }
  }) => <TopNav title={title} chapterId={chapterId} clubId={clubId} />,
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
