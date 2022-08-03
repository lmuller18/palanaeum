import { useState } from 'react'
import { Link, Outlet } from '@remix-run/react'
import { MenuAlt2Icon } from '@heroicons/react/outline'

import { useUser } from '~/utils'
import Sidenav from '~/components/Sidenav'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'

export default function AppLayout() {
  const user = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <header>
        <div className="flex items-center justify-between bg-background-secondary px-4 py-2 shadow-lg">
          <button type="button" onClick={() => setSidebarOpen(o => !o)}>
            <MenuAlt2Icon className="h-8 w-8" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex flex-col justify-start text-right">
              <Text variant="caption">Welcome</Text>
              <TextLink to={`/users/${user.id}`}>{user.username}</TextLink>
            </div>
            <Link to={`/users/${user.id}`}>
              <img
                src={user.avatar}
                className="h-10 w-10 rounded-md"
                alt="user avatar"
              />
            </Link>
          </div>
        </div>
      </header>

      <Sidenav open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="mb-4">
        <Outlet />
      </main>
    </>
  )
}
