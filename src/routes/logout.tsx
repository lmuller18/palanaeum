import { useAppSession } from '@/utils/session'
import { createServerFn } from '@tanstack/react-start'
import { createFileRoute, redirect } from '@tanstack/react-router'

const logoutFn = createServerFn().handler(async () => {
  const session = await useAppSession()
  await session.clear()
  throw redirect({ to: '/login' })
})

export const Route = createFileRoute('/logout')({
  preload: false,
  loader: () => logoutFn(),
})
