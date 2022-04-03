import { prisma } from '~/db.server'

export async function getChapterList({
  userId,
  clubId,
}: {
  userId: string
  clubId: string
}): Promise<{
  chapters: ChapterListItem[]
  nextChapter: ChapterListItem | null
}> {
  const [club, chapters] = await Promise.all([
    prisma.club.findFirst({
      where: { id: clubId, members: { some: { userId } } },
      select: { _count: { select: { members: true } } },
    }),
    prisma.chapter.findMany({
      where: {
        clubId,
        club: { members: { some: { userId } } },
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

  const formattedChapters = chapters.map(chapter => {
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
  })

  const nextChapter =
    formattedChapters.find(
      c => c.status === 'not_started' || c.status === 'incomplete',
    ) || null

  return {
    chapters: formattedChapters,
    nextChapter,
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
      where: { id: clubId, members: { some: { userId } } },
      select: { _count: { select: { members: true } } },
    }),
    prisma.chapter.findFirst({
      where: { id, club: { members: { some: { userId } } } },
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

async function getMemberIdFromUser(chapterId: string, userId: string) {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      club: {
        chapters: {
          some: {
            id: chapterId,
          },
        },
      },
    },
    select: { id: true },
  })
  if (!member) {
    throw new Response('Member not associated with Chapter', { status: 403 })
  }

  return member.id
}

export async function markRead(chapterId: string, userId: string) {
  const memberId = await getMemberIdFromUser(chapterId, userId)
  return prisma.progress.upsert({
    where: {
      memberId_chapterId: {
        memberId,
        chapterId,
      },
    },
    create: {
      chapterId,
      memberId,
    },
    update: {
      completedAt: new Date(),
    },
  })
}

export async function markUnread(chapterId: string, userId: string) {
  const memberId = await getMemberIdFromUser(chapterId, userId)

  return prisma.progress
    .delete({
      where: {
        memberId_chapterId: {
          chapterId,
          memberId,
        },
      },
    })
    .catch(() => {})
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
