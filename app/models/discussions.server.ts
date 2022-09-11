import { prisma } from '~/db.server'
import { threadComments } from '~/utils'

export async function getTopDiscussionByClub(clubId: string) {
  const dbDiscussion = await prisma.discussion.findFirst({
    where: { chapter: { clubId } },
    select: {
      id: true,
      title: true,
      member: {
        select: {
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          clubId: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    take: 1,
    orderBy: [
      {
        replies: {
          _count: 'desc',
        },
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  if (!dbDiscussion) return null

  return {
    user: dbDiscussion.member.user,
    chapter: dbDiscussion.chapter,
    discussion: {
      id: dbDiscussion.id,
      title: dbDiscussion.title,
      replyCount: dbDiscussion._count.replies,
    },
  }
}

export async function getTopDiscussionByChapter(chapterId: string) {
  const dbDiscussion = await prisma.discussion.findFirst({
    where: { chapterId },
    select: {
      id: true,
      title: true,
      member: {
        select: {
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          clubId: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    take: 1,
    orderBy: [
      {
        replies: {
          _count: 'desc',
        },
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  if (!dbDiscussion) return null

  return {
    user: dbDiscussion.member.user,
    chapter: dbDiscussion.chapter,
    discussion: {
      id: dbDiscussion.id,
      title: dbDiscussion.title,
      replyCount: dbDiscussion._count.replies,
    },
  }
}

export async function getThreadedDiscussion(
  discussionId: string,
  userId: string,
) {
  const dbDiscussion = await prisma.discussion.findFirst({
    where: {
      id: discussionId,
      chapter: { club: { members: { some: { userId, removed: false } } } },
    },
    select: {
      id: true,
      image: true,
      title: true,
      content: true,
      createdAt: true,
      member: {
        select: {
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      replies: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          parentId: true,
          rootId: true,
          discussionId: true,

          member: {
            select: {
              user: {
                select: {
                  id: true,
                  avatar: true,
                  username: true,
                },
              },
            },
          },

          _count: {
            select: {
              replies: true,
            },
          },
        },
      },
    },
  })

  if (!dbDiscussion) return null

  const comments = threadComments(
    dbDiscussion.replies.map(r => ({
      id: r.id,
      content: r.content,

      discussionId: r.discussionId,
      parentId: r.parentId,
      rootId: r.rootId,
      createdAt: r.createdAt,

      replyCount: r._count.replies,

      user: {
        id: r.member.user.id,
        avatar: r.member.user.avatar,
        username: r.member.user.username,
      },
    })),
  )

  return {
    id: dbDiscussion.id,
    title: dbDiscussion.title,
    image: dbDiscussion.image,
    content: dbDiscussion.content,
    createdAt: dbDiscussion.createdAt,
    user: {
      id: dbDiscussion.member.user.id,
      avatar: dbDiscussion.member.user.avatar,
      username: dbDiscussion.member.user.username,
    },
    comments,
  }
}

export async function getDiscussionsByChapter(
  chapterId: string,
  userId: string,
) {
  const dbDiscussions = await prisma.discussion.findMany({
    where: {
      chapterId,
      chapter: { club: { members: { some: { userId, removed: false } } } },
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { replies: true } },
      member: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          clubId: true,
        },
      },
    },
  })

  return dbDiscussions.map(d => ({
    user: {
      id: d.member.user.id,
      username: d.member.user.username,
      avatar: d.member.user.avatar,
    },
    discussion: {
      id: d.id,
      title: d.title,
      replyCount: d._count.replies,
      createdAt: d.createdAt,
    },
    chapter: {
      id: d.chapter.id,
      title: d.chapter.title,
      clubId: d.chapter.clubId,
    },
  }))
}

export async function getDiscussionsForReadChapters(
  clubId: string,
  userId: string,
  sortOrder?: 'chapter' | 'time',
) {
  const sort = sortOrder ?? 'time'
  const dbDiscussions = await prisma.discussion.findMany({
    where: {
      AND: [
        // right club that the user is a part of
        { chapter: { clubId } },
        // and user had read the chapter or is the creator
        {
          OR: [
            { chapter: { progress: { some: { member: { userId } } } } },
            { member: { userId } },
          ],
        },
      ],
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { replies: true } },
      member: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          clubId: true,
        },
      },
    },
    orderBy:
      sort === 'chapter'
        ? [{ chapter: { order: 'desc' } }, { createdAt: 'desc' }]
        : { createdAt: 'desc' },
  })

  return dbDiscussions.map(d => ({
    user: {
      id: d.member.user.id,
      username: d.member.user.username,
      avatar: d.member.user.avatar,
    },
    discussion: {
      id: d.id,
      title: d.title,
      replyCount: d._count.replies,
      createdAt: d.createdAt,
    },
    chapter: {
      id: d.chapter.id,
      title: d.chapter.title,
      clubId: d.chapter.clubId,
    },
  }))
}

export async function createDiscussion({
  title,
  chapterId,
  content,
  image,
  memberId,
}: {
  title: string
  chapterId: string
  image?: string
  content?: string
  memberId: string
}) {
  return prisma.discussion.create({
    data: {
      title,
      chapterId,
      image,
      content,
      memberId,
    },
    select: {
      id: true,
      image: true,
      title: true,
      member: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          club: {
            select: {
              id: true,
              title: true,
              image: true,
            },
          },
        },
      },
    },
  })
}
