import { prisma } from '@/db'
import { useAppSession } from '@/utils/session'
import { redirect } from '@tanstack/react-router'
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import bcrypt from 'bcryptjs'
import z from 'zod'

const sessionSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  avatar: z.string(),
})

export const getSessionUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const parsed = sessionSchema.safeParse(session.data)
    if (!parsed.success) return null

    return parsed.data
  },
)

export async function verifyLogin(email: string, password: string) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: { password: true },
  })

  if (!userWithPassword || !userWithPassword.password) return null

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) return null

  const { password: _password, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}

export const useServerUser = createServerOnlyFn(async () => {
  const session = await useAppSession()
  const user = session.data

  if (!user) throw redirect({ to: '/login' })

  return user
})
