import {
  add,
  isSameDay,
  parseISO,
  startOfDay,
  startOfToday,
  eachDayOfInterval,
} from 'date-fns'
import { prisma } from '~/db.server'
import { getMemberIdFromUser } from './users.server'

export async function getChapter(chapterId: string, userId: string) {
  return prisma.chapter.findFirst({
    where: {
      id: chapterId,
      club: { members: { some: { userId, removed: false } } },
    },
  })
}

export async function getPaginatedChapterList(
  clubId: string,
  userId: string,
  page: number,
  size: number,
) {
  const [dbChapters, dbClub] = await Promise.all([
    prisma.chapter.findMany({
      where: {
        clubId,
        club: { members: { some: { userId, removed: false } } },
      },
      skip: page * size,
      take: size,
      select: {
        id: true,
        title: true,
        order: true,
        club: {
          include: {
            _count: {
              select: {
                members: true,
                chapters: true,
              },
            },
          },
        },
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
      orderBy: {
        order: 'asc',
      },
    }),
    prisma.club.findFirst({
      where: { id: clubId, members: { some: { userId, removed: false } } },
      select: {
        _count: {
          select: {
            chapters: true,
            members: true,
          },
        },
      },
    }),
  ])

  if (!dbClub) throw new Error('Club not found')

  const chapters = dbChapters.map(c => {
    const userComplete = c.progress.some(p => p.member.userId === userId)
    const status = userComplete
      ? 'complete'
      : c.progress.length === 0
      ? 'not_started'
      : 'incomplete'

    const chapter: {
      id: string
      title: string
      status: 'complete' | 'incomplete' | 'not_started'
    } = {
      id: c.id,
      title: c.title,
      status,
    }

    return chapter
  })

  return {
    chapters,
    totalPages: Math.ceil(dbClub._count.chapters / size),
  }
}

export async function getChapterList(clubId: string, userId: string) {
  const dbChapters = await prisma.chapter.findMany({
    where: { clubId, club: { members: { some: { userId, removed: false } } } },
    select: {
      id: true,
      title: true,
      order: true,
    },
    orderBy: {
      order: 'asc',
    },
  })

  return dbChapters
}

export async function getNextChapter(userId: string, clubId: string) {
  const dbChapter = await prisma.chapter.findFirst({
    where: {
      clubId,
      progress: {
        none: { member: { userId } },
      },
      club: { members: { some: { userId, removed: false } } },
    },
    select: {
      id: true,
      title: true,
      order: true,
    },
    orderBy: {
      order: 'asc',
    },
  })

  if (!dbChapter) return null

  return {
    id: dbChapter.id,
    title: dbChapter.title,
    order: dbChapter.order,
  }
}

export async function getNextChapterDetails(userId: string, clubId: string) {
  const dbChapter = await prisma.chapter.findFirst({
    where: {
      clubId,
      progress: {
        none: { member: { userId } },
      },
      club: { members: { some: { userId, removed: false } } },
    },
    select: {
      id: true,
      title: true,
      order: true,
      club: {
        include: {
          _count: {
            select: {
              members: true,
              chapters: true,
            },
          },
        },
      },
      _count: {
        select: {
          progress: true,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  if (!dbChapter) return null

  const status: 'not_started' | 'incomplete' =
    dbChapter._count.progress === 0 ? 'not_started' : 'incomplete'

  return {
    id: dbChapter.id,
    title: dbChapter.title,
    membersCompleted: dbChapter._count.progress,
    status,
  }
}

export async function getReadChapters(userId: string, clubId: string) {
  const memberId = await getMemberIdFromUser(clubId, userId)
  if (!memberId) return []
  const dbProgress = await prisma.progress.findMany({
    where: { memberId },
    select: { chapterId: true },
  })
  return dbProgress.map(p => p.chapterId)
}

export async function getChaptersReadByDay(userId: string, clubId: string) {
  const [dbProgress, dbClub] = await Promise.all([
    prisma.progress.findMany({
      where: { chapter: { clubId }, member: { userId, removed: false } },
    }),
    prisma.club.findFirst({
      where: { id: clubId, members: { some: { userId, removed: false } } },
      select: { createdAt: true, _count: { select: { chapters: true } } },
    }),
  ])

  if (!dbClub) return null
  if (!dbProgress || dbProgress.length === 0)
    return {
      read: 0,
      remaining: dbClub._count.chapters,
      countsByDay: [],
    }

  const progress = dbProgress.reduce((acc, cur) => {
    const key = startOfDay(cur.completedAt).toISOString()

    if (acc[key]) {
      return {
        ...acc,
        [key]: acc[key] + 1,
      }
    } else {
      return {
        ...acc,
        [key]: 1,
      }
    }
  }, {} as { [key: string]: number })

  const { counts, remaining } = Object.keys(progress)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .reduce(
      (acc, cur) => {
        return {
          remaining: acc.remaining - progress[cur],
          counts: [
            ...acc.counts,
            {
              name: cur,
              date: parseISO(cur),
              y: acc.remaining - progress[cur],
            },
          ],
        }
      },
      { counts: [], remaining: dbClub._count.chapters } as {
        counts: { name: string; date: Date; y: number }[]
        remaining: number
      },
    )

  const startDate = add(dbClub.createdAt, { days: -1 })

  let current = {
    name: startDate.toISOString(),
    date: startDate,
    y: dbClub._count.chapters,
  }

  const range = eachDayOfInterval({
    start: startDate,
    end: startOfToday(),
  })

  const countsByDay: Array<{ name: string; date: Date; y: number }> = [current]

  range.forEach(date => {
    const foundDate = counts.find(d => isSameDay(date, d.date))
    if (foundDate) {
      countsByDay.push(foundDate)
      current = foundDate
    } else {
      countsByDay.push(current)
    }
  })

  return {
    read: dbProgress.length,
    remaining: remaining,
    countsByDay,
  }
}

export async function getChapterDetails(chapterId: string, userId: string) {
  const dbChapter = await prisma.chapter.findFirst({
    where: {
      id: chapterId,
      club: { members: { some: { userId, removed: false } } },
    },
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
  })

  if (!dbChapter) return null

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

export async function markRead(chapterId: string, memberId: string) {
  return prisma.progress.upsert({
    where: {
      memberId_chapterId: {
        memberId,
        chapterId,
      },
    },
    create: {
      memberId,
      chapterId,
    },
    update: {
      completedAt: new Date(),
    },
  })
}

export async function markUnread(chapterId: string, memberId: string) {
  return prisma.progress
    .delete({
      where: {
        memberId_chapterId: {
          memberId,
          chapterId,
        },
      },
    })
    .catch(() => {})
}
