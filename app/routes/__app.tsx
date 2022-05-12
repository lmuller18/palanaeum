import { Outlet } from 'remix'
import { useState } from 'react'
import { MenuAlt2Icon } from '@heroicons/react/outline'

import { useUser } from '~/utils'
import Sidenav from '~/components/Sidenav'
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
              <Text>{user.username}</Text>
            </div>
            <img
              src={user.avatar}
              className="h-10 w-10 rounded-md"
              alt="user avatar"
            />
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
