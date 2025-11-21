import { prisma } from '@/db'
import bcrypt from 'bcryptjs'

async function generatePassword(plaintext: string) {
  return bcrypt.hash(plaintext, 10)
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

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}
