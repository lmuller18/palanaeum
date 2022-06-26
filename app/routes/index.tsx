import { Form, Link } from '@remix-run/react'

import { useOptionalUser } from '~/utils'

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
        <Link to="/clubs_old">Clubs Old</Link>
        <Link to="/clubs">Clubs</Link>
      </div>
    </main>
  )
}
