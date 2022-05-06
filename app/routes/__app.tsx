import { Link, Outlet } from 'remix'
import { MenuAlt2Icon } from '@heroicons/react/outline'

import { useUser } from '~/utils'
import Text from '~/elements/Typography/Text'

export default function AppLayout() {
  const user = useUser()

  return (
    <>
      <header>
        <div className="flex items-center justify-between bg-background-secondary px-4 py-2 shadow-lg">
          <Link to="/clubs">
            <MenuAlt2Icon className="h-8 w-8" />
          </Link>

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

      <main className="mb-16">
        <Outlet />
      </main>
    </>
  )
}
