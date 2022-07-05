import * as React from 'react'
import type {
  MetaFunction,
  LoaderFunction,
  ActionFunction,
} from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'

import { validateEmail } from '~/utils'
import { getUserId, createUserSession } from '~/session.server'
import { createUser, getUserByEmail } from '~/models/users.server'

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return null
}

export const meta: MetaFunction = () => {
  return {
    title: 'Sign Up',
  }
}

export default function Join() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? undefined
  const actionData = useActionData() as ActionData
  const emailRef = React.useRef<HTMLInputElement>(null)
  const usernameRef = React.useRef<HTMLInputElement>(null)
  const passwordRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.username) {
      usernameRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

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
            to={{
              pathname: '/login',
              search: searchParams.toString(),
            }}
          >
            Sign in now.
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background-secondary py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form
            method="post"
            className="space-y-6"
            noValidate
            action={
              redirectTo
                ? `?redirectTo=${encodeURIComponent(redirectTo)}`
                : undefined
            }
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-100"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  aria-invalid={actionData?.errors?.email ? true : undefined}
                  aria-describedby="email-error"
                />
              </div>
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-100"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  ref={usernameRef}
                  id="username"
                  required
                  name="username"
                  autoComplete="username"
                  className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  aria-invalid={actionData?.errors?.username ? true : undefined}
                  aria-describedby="username-error"
                />
              </div>
              {actionData?.errors?.username && (
                <div className="pt-1 text-red-700" id="username-error">
                  {actionData.errors.username}
                </div>
              )}
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
                  ref={passwordRef}
                  aria-invalid={actionData?.errors?.password ? true : undefined}
                  aria-describedby="password-error"
                  className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>

            <input type="hidden" name="redirectTo" value={redirectTo ?? ''} />

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create Account
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

interface ActionData {
  errors: {
    email?: string
    password?: string
    username?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get('email')
  const username = formData.get('username')
  const password = formData.get('password')
  const redirectTo = formData.get('redirectTo')

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: 'Email is invalid' } },
      { status: 400 },
    )
  }

  if (typeof username !== 'string' || username.length === 0) {
    return json<ActionData>(
      { errors: { username: 'Username is required' } },
      { status: 400 },
    )
  }

  if (username.length < 4) {
    return json<ActionData>(
      { errors: { username: 'Username is too short' } },
      { status: 400 },
    )
  }

  if (typeof password !== 'string') {
    return json<ActionData>(
      { errors: { password: 'Password is required' } },
      { status: 400 },
    )
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: 'Password is too short' } },
      { status: 400 },
    )
  }

  const existingEmail = await getUserByEmail(email)
  if (existingEmail) {
    return json<ActionData>(
      { errors: { email: 'A user already exists with this email' } },
      { status: 400 },
    )
  }

  const user = await createUser({
    email,
    avatar: `https://ui-avatars.com/api/?size=128&name=${encodeURIComponent(
      username,
    )}`,
    password,
    username,
  })

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: typeof redirectTo === 'string' ? redirectTo : '/',
  })
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
