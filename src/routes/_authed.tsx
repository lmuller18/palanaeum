import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location, context }) => {
    if (!context.user)
      throw redirect({ to: '/login', search: { redirectTo: location.href } })
  },
})
