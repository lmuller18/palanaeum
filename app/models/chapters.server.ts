import {
  add,
  isSameDay,
  parseISO,
  startOfDay,
  startOfToday,
  eachDayOfInterval,
} from 'date-fns'
import { notFound } from 'remix-utils'
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
        _count: {
          select: {
            discussions: true,
          },
        },
        posts: {
          where: {
            rootId: null,
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
        members: {
          where: { removed: false },
          select: { id: true },
        },
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    }),
  ])

  if (!dbClub) throw new Error('Club not found')

  const chapters = dbChapters.map(c => {
    const userComplete = c.progress.some(p => p.member.userId === userId)
    const otherMemberCount = c.progress.filter(
      p => p.member.userId !== userId,
    ).length

    const userStatus: 'incomplete' | 'complete' = userComplete
      ? 'complete'
      : 'incomplete'
    const clubStatus: 'not_started' | 'incomplete' | 'complete' =
      c.progress.length === 0
        ? 'not_started'
        : c.progress.length === dbClub.members.length
        ? 'complete'
        : 'incomplete'

    const chapter: {
      id: string
      title: string
      userStatus: typeof userStatus
      clubStatus: typeof clubStatus
      postCount: number
      discussionCount: number
      completedCount: {
        others: number
        total: number
      }
    } = {
      id: c.id,
      title: c.title,
      userStatus,
      clubStatus,
      discussionCount: c._count.discussions,
      postCount: c.posts.length,
      completedCount: {
        others: otherMemberCount,
        total: c.progress.length,
      },
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
      posts: {
        where: {
          rootId: null,
          member: {
            userId: {
              not: userId,
            },
          },
        },
      },
      club: {
        select: {
          members: {
            where: { removed: false },
            select: { id: true },
          },
          _count: {
            select: {
              chapters: true,
            },
          },
        },
      },
      _count: {
        select: {
          progress: true,
          discussions: true,
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
    order: dbChapter.order,
    membersCompleted: dbChapter._count.progress,
    totalMembers: dbChapter.club.members.length,
    discussionCount: dbChapter._count.discussions,
    postCount: dbChapter.posts.length,
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
      total: dbClub._count.chapters,
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
  const endDate =
    dbProgress.length === dbClub._count.chapters
      ? counts.at(-1)?.date ?? startOfToday()
      : startOfToday()

  let current = {
    name: startDate.toISOString(),
    date: startDate,
    y: dbClub._count.chapters,
  }

  const range = eachDayOfInterval({
    start: startDate,
    end: endDate,
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
    total: dbClub._count.chapters,
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

export async function markPreviousRead(chapterId: string, memberId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  })

  if (!chapter) throw notFound({ error: 'Chapter not found' })

  const chapters = await prisma.chapter.findMany({
    where: {
      clubId: chapter.clubId,
      order: {
        lte: chapter.order,
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  if (!chapters?.length) return

  if (chapters.length === 1) {
    return prisma.progress.upsert({
      where: { memberId_chapterId: { chapterId, memberId } },
      create: {
        chapterId,
        memberId,
      },
      update: {},
    })
  }

  // create all previous first so most recent chapter is "most recent"
  const toCreate = chapters.slice(0, -1).map(c => ({
    chapterId: c.id,
    memberId,
  }))

  await prisma.progress.createMany({
    data: toCreate,
    skipDuplicates: true,
  })

  return prisma.progress.upsert({
    where: { memberId_chapterId: { chapterId, memberId } },
    update: {},
    create: {
      chapterId: chapters[chapters.length - 1].id,
      memberId,
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

export async function createChapter(clubId: string, title: string) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { _count: { select: { chapters: true } } },
  })
  if (!club) return null
  const order = club._count.chapters + 1
  return prisma.chapter.create({
    data: {
      title,
      order,
      clubId,
    },
  })
}

export async function deleteChapter(chapterId: string) {
  // delete comments
  // delete discussions
  // delete posts
  // delete chapter

  return prisma.$transaction([
    prisma.comment.deleteMany({ where: { discussion: { chapterId } } }),
    prisma.discussion.deleteMany({ where: { chapterId } }),
    prisma.post.deleteMany({ where: { chapterId } }),
    prisma.chapter.delete({ where: { id: chapterId } }),
  ])
}

export async function renameChapter(chapterId: string, title: string) {
  return prisma.chapter.update({
    where: { id: chapterId },
    data: { title },
  })
}

export async function reorderChapters(
  chapters: { id: string; order: number }[],
) {
  return prisma.$transaction(
    chapters.map(({ id, order }) =>
      prisma.chapter.update({ where: { id }, data: { order } }),
    ),
  )
}

export async function getChaptersReadByUserId(userId: string) {
  return prisma.progress.count({ where: { member: { userId } } })
}
