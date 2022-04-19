import { Link, Outlet } from 'remix'
import { MenuAlt2Icon } from '@heroicons/react/outline'

import { useUser } from '~/utils'
import Text from '~/elements/Typography/Text'

export default function AppLayout() {
  const user = useUser()

  return (
    <>
      <header>
        <div className="flex items-center justify-between bg-background-secondary p-4 shadow-lg">
          <Link to="/clubs2">
            <MenuAlt2Icon className="h-8 w-8" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex flex-col justify-start text-right">
              <Text>Welcome</Text>
              <Text variant="title3">{user.username}</Text>
            </div>
            <img src={user.avatar} className="h-12 w-12 rounded-md" />
          </div>
        </div>
      </header>

      <main className="mb-16">
        <Outlet />
      </main>
    </>
  )
}
