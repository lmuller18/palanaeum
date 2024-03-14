import { prisma } from '~/db.server'

export async function getClub(clubId: string, userId: string) {
  return prisma.club.findFirst({
    where: { id: clubId, members: { some: { userId, removed: false } } },
  })
}

export async function getClubByChapterId(chapterId: string, userId: string) {
  return prisma.club.findFirst({
    where: {
      chapters: { some: { id: chapterId } },
      members: { some: { userId, removed: false } },
    },
  })
}

export async function getClubWithUserMembers(clubId: string, userId: string) {
  const club = await prisma.club.findFirst({
    where: {
      id: clubId,
      members: { some: { userId, removed: false } },
    },
    select: {
      ownerId: true,
      members: {
        where: { removed: false },
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
    },
  })

  if (!club) return null

  return {
    ownerId: club.ownerId,
    members: club.members.map(member => ({
      ...member.user,
    })),
  }
}

export async function createClub({
  clubId,
  title,
  author,
  image,
  chapters,
  userId,
}: {
  clubId?: string
  title: string
  author: string
  image: string
  chapters: {
    order: number
    title: string
  }[]
  userId: string
}) {
  return prisma.club.create({
    data: {
      id: clubId,
      title,
      image,
      author,
      ownerId: userId,
      members: {
        create: {
          isOwner: true,
          userId,
        },
      },
      chapters: {
        createMany: {
          data: chapters,
        },
      },
    },
  })
}

export async function createManualClub({
  clubId,
  title,
  author,
  image,
  chapterCount,
  userId,
}: {
  clubId?: string
  title: string
  author: string
  image: string
  chapterCount: number
  userId: string
}) {
  const chapters = Array.from(Array(chapterCount).keys()).map(i => ({
    order: i,
    title: `Chapter ${i + 1}`,
  }))

  return createClub({
    clubId,
    title,
    author,
    image,
    chapters,
    userId,
  })
}

export interface ClubListDetails {
  id: string
  title: string
  author: string
  image: string
  createdAt: Date
  owner: {
    id: string
    username: string
    avatar: string
  }
  chapterCount: number
  memberCount: number
}

export async function getClubsByUserId(userId: string) {
  return prisma.club.findMany({
    where: { members: { some: { userId, removed: false } } },
  })
}

export async function getClubListDetails(userId: string) {
  const dbClubs = await prisma.club.findMany({
    where: { members: { some: { userId, removed: false } } },
    select: {
      id: true,
      title: true,
      author: true,
      image: true,
      createdAt: true,
      owner: {
        select: {
          avatar: true,
          id: true,
          username: true,
        },
      },
      members: {
        where: { removed: false },
        select: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              progress: true,
            },
          },
        },
      },
      _count: {
        select: {
          chapters: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const currentlyReading: ClubListDetails[] = []
  const previouslyRead: ClubListDetails[] = []

  dbClubs.forEach(dbClub => {
    const userProgress =
      dbClub.members.find(m => m.user.id === userId)?._count.progress ?? 0

    const club: ClubListDetails = {
      id: dbClub.id,
      title: dbClub.title,
      author: dbClub.author,
      image: dbClub.image,
      owner: dbClub.owner,
      createdAt: dbClub.createdAt,
      memberCount: dbClub.members.length,
      chapterCount: dbClub._count.chapters,
    }

    if (userProgress === dbClub._count.chapters) {
      previouslyRead.push(club)
    } else {
      currentlyReading.push(club)
    }
  })

  return { currentlyReading, previouslyRead }
}

export async function addUserToClub(clubId: string, userId: string) {
  const existingMember = await prisma.member.findFirst({
    where: {
      clubId,
      userId,
    },
  })

  // if the user is already part of the club
  // check if the user has been removed from the club
  // if not, return the existing member.
  // otherwise, un-remove the existing member.
  // Otherwise create the new member

  if (existingMember) {
    if (!existingMember.removed) return existingMember

    return prisma.member.update({
      where: { id: existingMember.id },
      data: {
        removed: false,
      },
    })
  }

  return prisma.member.create({
    data: {
      clubId,
      userId,
    },
  })
}

export async function deleteClub(clubId: string) {
  // delete comments
  // delete discussions
  // delete posts
  // delete chapters
  // delete progress
  // delete members
  // delete club

  return prisma.$transaction([
    prisma.comment.deleteMany({
      where: { discussion: { chapter: { clubId } } },
    }),
    prisma.discussion.deleteMany({ where: { chapter: { clubId } } }),
    prisma.post.deleteMany({ where: { chapter: { clubId } } }),
    prisma.chapter.deleteMany({ where: { clubId } }),
    prisma.progress.deleteMany({ where: { chapter: { clubId } } }),
    prisma.member.deleteMany({ where: { clubId } }),
    prisma.clubInvite.deleteMany({ where: { clubId } }),
    prisma.club.delete({ where: { id: clubId } }),
  ])
}
