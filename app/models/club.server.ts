import { prisma } from '~/db.server'

export function getClub({ userId, id }: { userId: string; id: string }) {
  return prisma.club.findFirst({
    where: { id, members: { some: { userId } } },
  })
}

export function getClubListItems({ userId }: { userId: string }) {
  return prisma.club.findMany({
    where: { members: { some: { userId } } },
    select: {
      id: true,
      title: true,
      image: true,
      members: {
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
