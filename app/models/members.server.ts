import { prisma } from '~/db.server'

export async function getCompletedMembersCount(
  chapterId: string,
  userId: string,
) {
  const [dbProgress, dbClub] = await Promise.all([
    prisma.progress.findMany({
      where: { chapterId },
    }),
    prisma.club.findFirst({
      where: {
        chapters: { some: { id: chapterId } },
        members: { some: { userId, removed: false } },
      },
      select: { createdAt: true, _count: { select: { members: true } } },
    }),
  ])

  if (!dbClub) return null

  const total = dbProgress.length

  return {
    completed: total,
    remaining: dbClub._count.members - total,
  }
}
