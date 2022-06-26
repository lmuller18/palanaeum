import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/outline'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  NavLink,
  Outlet,
  useLoaderData,
  useMatches,
  useParams,
} from '@remix-run/react'

import { prisma } from '~/db.server'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'

interface LoaderData {
  chapter: {
    id: string
    title: string
    order: number
    status: 'complete' | 'not_started' | 'incomplete'
  }
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.chapterId, 'expected chapterId')
  const userId = await requireUserId(request)

  const chapter = await getChapter(params.chapterId, userId)

  if (!chapter) throw new Response('Chapter not found', { status: 404 })

  return json<LoaderData>({ chapter })
}

export default function ChapterPage() {
  const { clubId } = useParams()
  const { chapter } = useLoaderData() as LoaderData

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

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      {backNavigation && (
        <div className="mb-4 bg-background-secondary">
          <div className="mx-auto flex max-w-lg items-center gap-2 px-4 pb-4">
            <TextLink to={backNavigation}>
              <ChevronLeftIcon className="h-4 w-4" />
            </TextLink>
            <TextLink serif variant="title2" className="block" to=".">
              {chapter.title}
            </TextLink>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-lg px-4">
        <Outlet />
      </div>

      <div className="h-14" />
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
              type: 'spring',
              damping: 10,
              mass: 0.75,
              stiffness: 100,
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

async function getChapter(chapterId: string, userId: string) {
  const [dbChapter, dbClub] = await Promise.all([
    prisma.chapter.findFirst({
      where: { id: chapterId, club: { members: { some: { userId } } } },
      select: {
        id: true,
        order: true,
        title: true,
        progress: {
          select: {
            member: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
      },
    }),
    prisma.club.findFirst({
      where: { chapters: { some: { id: chapterId } } },
      select: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    }),
  ])

  if (!dbClub || !dbChapter) return null

  const userComplete = dbChapter.progress.some(p => p.member.userId === userId)
  const status: 'complete' | 'not_started' | 'incomplete' = userComplete
    ? 'complete'
    : dbChapter.progress.length === 0
    ? 'not_started'
    : 'incomplete'

  return {
    id: dbChapter.id,
    title: dbChapter.title,
    order: dbChapter.order,
    status,
  }
}
