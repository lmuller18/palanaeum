import { redirect } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/node'

import { useOptionalUser } from '~/utils'
import { requireUserId } from '~/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return redirect('/clubs')
}

export default function Index() {
  const user = useOptionalUser()
  return (
    <main>
      {user ? (
        <div>
          <img
            src={user.avatar}
            className="h-24 w-24 rounded-full object-cover"
            alt="user avatar"
          />
          <h1>{user.username}</h1>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <Link to="/join">Sign Up</Link>
          <Link to="/login">Log in</Link>
        </div>
      )}
      <div className="grid">
        <Link to="/clubs">Clubs</Link>
      </div>
    </main>
  )
}
