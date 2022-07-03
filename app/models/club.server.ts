import { prisma } from '~/db.server'

export async function createClub({
  title,
  image,
  chapterCount,
  author,
  userId,
}: {
  title: string
  image: string
  chapterCount: number
  author: string
  userId: string
}) {
  const chapters = Array.from(Array(chapterCount).keys()).map(i => ({
    order: i,
    title: `Chapter ${i + 1}`,
  }))

  return prisma.club.create({
    data: {
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

export function getClub({ userId, id }: { userId: string; id: string }) {
  return prisma.club.findFirst({
    where: { id, members: { some: { userId, removed: false } } },
  })
}

export function getClubListItems({ userId }: { userId: string }) {
  return prisma.club.findMany({
    where: { members: { some: { userId, removed: false } } },
    select: {
      id: true,
      title: true,
      image: true,
      members: {
        where: { removed: false },
        select: {
          user: {
            select: {
              id: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          chapters: true,
          members: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export type { Club } from '@prisma/client'
