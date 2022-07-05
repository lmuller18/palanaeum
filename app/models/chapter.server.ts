import { prisma } from '~/db.server'

// ! Deprecate Below

const formatChapter = (
  chapter: {
    id: string
    title: string
    order: number
    progress: {
      chapterId: string
      member: {
        userId: string
      }
    }[]
  },
  userId: string,
  memberCount: number,
) => {
  const memberComplete = chapter.progress.some(
    progress =>
      progress.chapterId === chapter.id && progress.member.userId === userId,
  )
  const clubComplete = chapter.progress.length === memberCount

  const status: ChapterStatus =
    chapter.progress.length === 0
      ? 'not_started'
      : clubComplete
      ? 'all_complete'
      : memberComplete
      ? 'complete'
      : 'incomplete'

  return {
    id: chapter.id,
    title: chapter.title,
    order: chapter.order,
    count: {
      completed: chapter.progress.length,
      total: memberCount,
    },
    status,
  }
}

export async function getChapterList({
  userId,
  clubId,
  size = 1,
  page = 0,
}: {
  userId: string
  clubId: string
  size?: number
  page?: number
}): Promise<{
  chapters: ChapterListItem[]
  nextChapter: ChapterListItem | null
  totalChapters: number
}> {
  const [club, chapters, nextChapter] = await Promise.all([
    prisma.club.findFirst({
      where: { id: clubId, members: { some: { userId, removed: false } } },
      select: { _count: { select: { members: true, chapters: true } } },
    }),
    prisma.chapter.findMany({
      take: size,
      skip: size * page,
      where: {
        clubId,
        club: { members: { some: { userId, removed: false } } },
      },
      select: {
        id: true,
        order: true,
        title: true,
        progress: {
          select: {
            member: { select: { userId: true } },
            chapterId: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    }),
    prisma.chapter.findFirst({
      where: {
        progress: {
          none: {
            member: {
              userId,
            },
          },
        },
      },
      select: {
        id: true,
        order: true,
        title: true,
        progress: {
          select: {
            member: { select: { userId: true } },
            chapterId: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    }),
  ])

  if (!club) throw new Response('Not Found', { status: 404 })

  const formattedChapters = chapters.map(chapter =>
    formatChapter(chapter, userId, club._count.members),
  )

  return {
    chapters: formattedChapters,
    nextChapter: nextChapter
      ? formatChapter(nextChapter, userId, club._count.members)
      : null,
    totalChapters: club._count.chapters,
  }
}

export async function getChapterDetails({
  id,
  userId,
  clubId,
}: {
  id: string
  userId: string
  clubId: string
}) {
  const [club, chapter] = await Promise.all([
    prisma.club.findFirst({
      where: { id: clubId, members: { some: { userId, removed: false } } },
      select: { _count: { select: { members: true } } },
    }),
    prisma.chapter.findFirst({
      where: { id, club: { members: { some: { userId, removed: false } } } },
      select: {
        id: true,
        order: true,
        title: true,
        progress: {
          select: {
            member: { select: { userId: true } },
            chapterId: true,
          },
        },
      },
    }),
  ])

  if (!chapter || !club) throw new Response('Not Found', { status: 404 })

  const memberComplete = chapter.progress.some(
    progress =>
      progress.chapterId === chapter.id && progress.member.userId === userId,
  )

  const clubComplete = chapter.progress.length === club._count.members

  const status: ChapterStatus =
    chapter.progress.length === 0
      ? 'not_started'
      : clubComplete
      ? 'all_complete'
      : memberComplete
      ? 'complete'
      : 'incomplete'

  return {
    id: chapter.id,
    title: chapter.title,
    order: chapter.order,
    count: {
      completed: chapter.progress.length,
      total: club._count.members,
    },
    status,
  }
}

export interface ChapterListItem {
  id: string
  title: string
  order: number
  count: {
    completed: number
    total: number
  }
  status: ChapterStatus
}

export interface ChapterDetails {
  id: string
  title: string
  order: number
  count: {
    completed: number
    total: number
  }
  status: ChapterStatus
}

export type ChapterStatus =
  | 'not_started'
  | 'incomplete'
  | 'complete'
  | 'all_complete'

export type { Chapter } from '@prisma/client'
