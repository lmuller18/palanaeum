import z from 'zod'
import { useRef } from 'react'

import {
  Link,
  redirect,
  useLocation,
  createFileRoute,
} from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { FormError } from '@/lib/form-error'
import { useAppSession } from '@/utils/session'
import { createUser, getUserByEmail } from '@/server/user'

const joinSearchSchema = z.object({
  redirectTo: z.string().optional(),
})

export const Route = createFileRoute('/join')({
  validateSearch: joinSearchSchema,
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.user
    if (user) throw redirect({ to: '/clubs' })
  },
})

const joinSchema = z.object({
  email: z.email({ error: 'Invalid email address' }).max(255, {
    error: 'Email must be at most 255 characters',
  }),
  username: z
    .string()
    .min(3, { error: 'Username must be at least 3 characters' })
    .max(30, {
      error: 'Username must be at most 30 characters',
    }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters' })
    .max(100, { error: 'Password must be at most 100 characters' }),
  confirmPassword: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters' })
    .max(100, { error: 'Password must be at most 100 characters' }),
  redirectTo: z.string().optional(),
})

const joinFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    const result = joinSchema.safeParse(data)
    if (!result.success) {
      const firstError = result.error.issues[0]
      throw new FormError(
        firstError.message ?? 'Error creating user',
        firstError.path?.[0].toString() ?? '',
      )
    }

    return result.data
  })
  .handler(async ({ data }) => {
    if (data.password !== data.confirmPassword)
      throw new FormError('Passwords do not match', 'confirmPassword')

    const existingEmail = await getUserByEmail(data.email)
    if (existingEmail) throw new FormError('Email already in use', 'email')

    const avatar = `https://ui-avatars.com/api/?size=128&name=${encodeURIComponent(
      data.username,
    )}`

    const user = await createUser({
      email: data.email,
      username: data.username,
      avatar,
      password: data.password,
    })
    const session = await useAppSession()
    await session.update({
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      username: user.username,
    })
    throw redirect({ to: data.redirectTo ?? '/' })
  })

function RouteComponent() {
  const formRef = useRef<HTMLFormElement>(null)
  const joinMutate = useMutation({
    mutationFn: joinFn,
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

    joinMutate.mutate({
      data: {
        email: formData.get('email') as string,
        username: formData.get('username') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
        redirectTo,
      },
    })
  }

  const getFieldError = (field: string) => {
    return joinMutate.error instanceof FormError &&
      joinMutate.error.field === field
      ? joinMutate.error.message
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
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Already have an account?{' '}
          <Link
            className="font-medium text-indigo-500 hover:text-indigo-400"
            to="/login"
            search={{ redirectTo }}
          >
            Sign in now.
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
                htmlFor="username"
                className="block text-sm font-medium text-gray-100"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  required
                  name="username"
                  autoComplete="username"
                  className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  {...getErrorProps('username')}
                />
              </div>
              <FieldError
                message={getFieldError('username')}
                field="username"
              />
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
                  autoComplete="new-password"
                  className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                  {...getErrorProps('password')}
                />
              </div>
              <FieldError
                message={getFieldError('password')}
                field="password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-100"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  {...getErrorProps('confirmPassword')}
                  className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <FieldError
                message={getFieldError('confirmPassword')}
                field="confirmPassword"
              />
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create Account
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
