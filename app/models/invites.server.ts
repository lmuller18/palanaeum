import { prisma } from '~/db.server'

export async function getInvitesWithInvitee(clubId: string) {
  const invites = await prisma.clubInvite.findMany({
    where: { clubId },
    select: {
      invitee: {
        select: {
          avatar: true,
          id: true,
          username: true,
        },
      },
    },
  })
  return invites.map(inv => ({
    ...inv.invitee,
  }))
}

export async function createInvite({
  clubId,
  inviteeId,
  inviterId,
}: {
  clubId: string
  inviterId: string
  inviteeId: string
}) {
  return prisma.clubInvite.upsert({
    where: {
      inviterId_inviteeId_clubId: {
        clubId,
        inviteeId,
        inviterId,
      },
    },
    create: {
      clubId,
      inviteeId,
      inviterId,
    },
    update: {},
    select: {
      club: {
        select: {
          id: true,
          image: true,
          title: true,
          author: true,
        },
      },
      inviter: {
        select: {
          avatar: true,
          id: true,
          username: true,
        },
      },
      inviteeId: true,
    },
  })
}

export async function deleteInvite({
  inviteeId,
  inviterId,
  clubId,
}: {
  inviteeId: string
  inviterId: string
  clubId: string
}) {
  return prisma.clubInvite
    .delete({
      where: {
        inviterId_inviteeId_clubId: {
          clubId,
          inviteeId,
          inviterId,
        },
      },
    })
    .catch(e => console.log('invite not found'))
}

export async function getReceivedInvites(userId: string) {
  const invites = await prisma.clubInvite.findMany({
    where: { inviteeId: userId },
    select: {
      updatedAt: true,
      inviter: {
        select: {
          id: true,
          avatar: true,
          username: true,
        },
      },
      club: {
        select: {
          id: true,
          image: true,
          title: true,
          author: true,
          createdAt: true,
          _count: {
            select: {
              chapters: true,
              members: true,
            },
          },
        },
      },
    },
  })

  return invites.map(i => ({
    invitedAt: i.updatedAt,
    user: i.inviter,
    club: i.club,
  }))
}

export async function getSentInvites(userId: string) {
  const invites = await prisma.clubInvite.findMany({
    where: { inviterId: userId },
    select: {
      updatedAt: true,
      invitee: {
        select: {
          id: true,
          avatar: true,
          username: true,
        },
      },
      club: {
        select: {
          id: true,
          image: true,
          title: true,
          author: true,
          createdAt: true,
          _count: {
            select: {
              chapters: true,
              members: true,
            },
          },
        },
      },
    },
  })

  return invites.map(i => ({
    invitedAt: i.updatedAt,
    user: i.invitee,
    club: i.club,
  }))
}
