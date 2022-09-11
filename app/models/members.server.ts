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

export async function getMembersWithProgressByClub(clubId: string) {
  const dbMembers = await prisma.member.findMany({
    where: { removed: false, clubId },
    select: {
      user: {
        select: {
          id: true,
          avatar: true,
          username: true,
        },
      },
      _count: { select: { progress: true } },
    },
  })

  return dbMembers.map(m => ({
    user: m.user,
    chapterCount: m._count.progress,
  }))
}

export async function getCompletedMembersByChapter(
  clubId: string,
  chapterId: string,
) {
  const members = await prisma.member.findMany({
    where: { clubId },
    select: {
      progress: { where: { chapterId }, select: { createdAt: true } },
      user: {
        select: {
          id: true,
          avatar: true,
          username: true,
        },
      },
    },
  })

  return members.map(m => ({
    user: m.user,
    progress: m.progress[0] ?? null,
  }))
}
