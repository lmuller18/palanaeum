import { Link, Outlet } from 'remix'

import { useUser } from '~/utils'

export default function AppLayout() {
  const user = useUser()
  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 w-full items-center bg-background-secondary shadow-lg">
        <div className="flex flex-1 items-center px-2">
          <Link to="/">
            <img
              src="/images/inline.svg"
              className="w-52"
              width={208}
              height={36}
            />
          </Link>
        </div>
        <div className="absolute right-0 top-0 mt-2 mr-2 h-24 w-24 rounded-full p-1">
          <img
            className="relative h-full w-full rounded-full"
            src={user.avatar}
          />
        </div>
      </header>

      <main className="isolate">
        <Outlet />
      </main>
    </>
  )
}
