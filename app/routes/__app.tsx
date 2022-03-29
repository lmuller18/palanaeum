import { Link, Outlet } from 'remix'

import { useUser } from '~/utils'

export default function AppLayout() {
  const user = useUser()
  return (
    <>
      <header className="sticky top-0 z-[500] w-full bg-background-secondary shadow-lg">
        <nav className="relative flex items-start justify-between">
          <div className="flex h-16 flex-1 items-center px-2">
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
        </nav>
      </header>

      <main className="isolate">
        <Outlet />
      </main>
    </>
  )
}
