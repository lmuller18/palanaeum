import { z } from 'zod'

import {
  Link,
  redirect,
  useLocation,
  createFileRoute,
} from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { verifyLogin } from '@/server/auth'
import { FormError } from '@/lib/form-error'
import { useAppSession } from '@/utils/session'
import { useRef } from 'react'

const loginSearchSchema = z.object({
  redirectTo: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ context }) => {
    const user = context.user
    if (user) throw redirect({ to: '/clubs' })
  },
})

const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(100),
  redirectTo: z.string().optional(),
})

const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const user = await verifyLogin(data.email, data.password)
    if (!user) throw new FormError('Invalid credentials', 'password')
    const session = await useAppSession()
    await session.update({
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      username: user.username,
    })
    throw redirect({ to: data.redirectTo ?? '/clubs' })
  })

function RouteComponent() {
  const formRef = useRef<HTMLFormElement>(null)
  const loginMutation = useMutation({
    mutationFn: loginFn,
    onError: (error) => {
      if (error instanceof FormError) {
        const field = formRef.current?.querySelector(
          `input[name="${error.field}"]`,
        )
        if (field) {
          ;(field as HTMLInputElement).focus()
        }
      }
    },
  })

  const location = useLocation()
  const redirectTo = location.search.redirectTo
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    loginMutation.mutate({
      data: {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        redirectTo,
      },
    })
  }

  const getFieldError = (field: string) => {
    return loginMutation.error instanceof FormError &&
      loginMutation.error.field === field
      ? loginMutation.error.message
      : null
  }

  const getErrorProps = (field: string) => {
    const message = getFieldError(field)
    return {
      'aria-invalid': message ? true : undefined,
      'aria-describedby': `${field}-error`,
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-24 w-auto overflow-hidden rounded-full"
          src="/images/gradient-logo-192.png"
          alt="Palanaeum"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Or{' '}
          <Link
            className="font-medium text-indigo-500 hover:text-indigo-400"
            to="/join"
            search={{ redirectTo }}
          >
            create a new account now
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background-secondary py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit} ref={formRef}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-100"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  {...getErrorProps('email')}
                />
              </div>
              <FieldError message={getFieldError('email')} field="email" />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-100"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  {...getErrorProps('password')}
                  className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <FieldError
                message={getFieldError('password')}
                field="password"
              />
            </div>

            <div>
              <button
                disabled={loginMutation.isPending}
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function FieldError(props: { message: string | null; field: string }) {
  if (!props.message) return null
  return (
    <div
      className="pt-1 text-destructive-foreground text-xs"
      id={`${props.field}-error`}
    >
      {props.message}
    </div>
  )
}
