import { prisma } from '~/db.server'

export async function getChapterList({
  userId,
  clubId,
}: {
  userId: string
  clubId: string
}) {
  const chapters = await prisma.chapter.findMany({
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
  })

  return chapters.map(chapter => {
    return {
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      complete: chapter.progress.some(
        progress =>
          progress.chapterId === chapter.id &&
          progress.member.userId === userId,
      ),
    }
  })
}

export type { Chapter } from '@prisma/client'
