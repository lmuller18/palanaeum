import { differenceInDays } from 'date-fns'

import bcrypt from '@node-rs/bcrypt'
import type { User } from '@prisma/client'

import { prisma } from '~/db.server'
export { User }

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

async function generatePassword(plaintext: string) {
  return bcrypt.hash(plaintext, 10)
}

export async function updatePassword(userId: string, password: string) {
  const hashedPassword = await generatePassword(password)
  return prisma.password.update({
    where: { userId },
    data: { hash: hashedPassword },
  })
}

export async function createUser({
  email,
  username,
  avatar,
  password,
}: {
  email: string
  username: string
  avatar: string
  password: string
}) {
  const hashedPassword = await generatePassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      username,
      avatar,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  return user
}

export async function deleteUserByEmail(email: string) {
  return prisma.user.delete({ where: { email } })
}

export async function verifyLogin(email: string, password: string) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.verify(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}

export async function getMemberIdFromUser(clubId: string, userId: string) {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      clubId,
    },
    select: { id: true },
  })
  if (!member) return null

  return member.id
}

export async function getMemberIdFromUserByChapter(
  userId: string,
  chapterId: string,
) {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      club: {
        chapters: {
          some: {
            id: chapterId,
          },
        },
      },
    },
    select: { id: true, removed: true },
  })
  if (!member || member.removed) {
    throw new Response('Member not associated with Chapter', { status: 403 })
  }

  return member.id
}

export async function getMemberIdFromUserByDiscussion(
  userId: string,
  discussionId: string,
) {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      club: {
        chapters: {
          some: {
            discussions: {
              some: {
                id: discussionId,
              },
            },
          },
        },
      },
    },
    select: { id: true },
  })
  if (!member) {
    throw new Response('Member not associated with Chapter', { status: 403 })
  }

  return member.id
}

export async function getUserStats(userId: string) {
  // books read 30 days
  // books read total
  // chapters read 30 days
  // chapters read total

  const [clubs, discussions, posts] = await Promise.all([
    prisma.club.findMany({
      where: { members: { some: { userId, removed: false } } },
      select: {
        members: {
          select: { progress: { select: { completedAt: true } } },
          where: { userId },
        },
        _count: { select: { chapters: true } },
      },
    }),
    prisma.discussion.findMany({
      where: { member: { userId } },
      select: { createdAt: true },
    }),
    prisma.post.findMany({
      where: { member: { userId }, parentId: { equals: null } },
      select: { createdAt: true },
    }),
  ])

  const discussionTotal = discussions.length
  const discussions30Days = discussions.filter(
    d => Math.abs(differenceInDays(d.createdAt, new Date())) <= 30,
  ).length

  const postTotal = posts.length
  const posts30Days = posts.filter(
    p => Math.abs(differenceInDays(p.createdAt, new Date())) <= 30,
  ).length

  const clubStats = clubs.reduce(
    (acc, cur) => {
      const complete = cur.members[0].progress.length === cur._count.chapters
      const recentComplete =
        complete &&
        cur.members[0].progress.some(prog => {
          const dif = differenceInDays(prog.completedAt, new Date())
          return Math.abs(dif) <= 30
        })

      const chapterCount = cur.members[0].progress.length
      const chapters30DayCount = cur.members[0].progress.filter(
        prog => Math.abs(differenceInDays(prog.completedAt, new Date())) <= 30,
      ).length

      return {
        bookTotal: complete ? acc.bookTotal + 1 : acc.bookTotal,
        book30Days: recentComplete ? acc.book30Days + 1 : acc.book30Days,
        chapterTotal: acc.chapterTotal + chapterCount,
        chapter30Days: acc.chapter30Days + chapters30DayCount,
      }
    },
    { bookTotal: 0, book30Days: 0, chapterTotal: 0, chapter30Days: 0 } as {
      bookTotal: number
      book30Days: number
      chapterTotal: number
      chapter30Days: number
    },
  )

  return {
    ...clubStats,
    discussionTotal,
    discussions30Days,
    postTotal,
    posts30Days,
  }
}

export async function getPassword(userId: string) {
  return prisma.password.findUnique({ where: { userId } })
}

export async function updateUser(
  userId: string,
  user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  return prisma.user.update({
    where: { id: userId },
    data: user,
  })
}
