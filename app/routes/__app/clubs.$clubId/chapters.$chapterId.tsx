import invariant from 'tiny-invariant'
import { LayoutGroup } from 'framer-motion'
import { ChevronLeftIcon } from '@heroicons/react/outline'
import { json, LoaderFunction, Outlet, useLoaderData, useParams } from 'remix'

import { prisma } from '~/db.server'
import TextLink from '~/elements/TextLink'
import TabLink from '~/components/TabLink'
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

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <TextLink to="..">
          <ChevronLeftIcon className="h-4 w-4" />
        </TextLink>
        <TextLink variant="title2" className="block" to=".">
          {chapter.title}
        </TextLink>
      </div>

      {/* Nav section */}
      <div
        className="mb-6 grid grid-cols-3 border-l border-t border-r border-background-tertiary shadow-md hover:shadow-lg focus:shadow-lg"
        role="group"
      >
        <LayoutGroup id="chapter-nav-wrapper">
          <TabLink to="posts" color="sky" layoutId="chapter-nav">
            Posts
          </TabLink>
          <TabLink to="." end color="teal" layoutId="chapter-nav">
            Home
          </TabLink>
          <TabLink to="chapters" color="indigo" layoutId="chapter-nav">
            Discussions
          </TabLink>
        </LayoutGroup>
      </div>

      <Outlet />
    </>
  )
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
