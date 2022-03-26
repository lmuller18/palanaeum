import { json, Link, LoaderFunction, useLoaderData } from 'remix'

import Avatar from '~/elements/Avatar'
import { requireUser } from '~/session.server'

type LoaderData = {
  user: Awaited<ReturnType<typeof requireUser>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)

  if (!user) {
    throw new Response('Not Found', { status: 404 })
  }
  return json<LoaderData>({ user })
}

export default function ProfilePage() {
  const { user } = useLoaderData() as LoaderData

  return (
    <>
      <div
        className="h-48 bg-purple-400 bg-cover bg-center md:h-56 lg:h-64"
        style={{
          backgroundImage: user.background
            ? `url(${user.background})`
            : undefined,
        }}
      />

      <div className="lg:-mt-26 -mt-8 flex justify-center md:-mt-12">
        <Link to="/profile">
          <Avatar src={user.avatar} />
        </Link>
      </div>

      <div className="mx-auto max-w-screen-md p-4"></div>
    </>
  )
}
