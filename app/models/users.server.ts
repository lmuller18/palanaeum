import bcrypt from '@node-rs/bcrypt'
import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
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
  const hashedPassword = await bcrypt.hash(password, 10)
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
    select: { id: true },
  })
  if (!member) {
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
