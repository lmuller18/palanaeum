import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { MenuAlt2Icon } from '@heroicons/react/outline'
import { Link, Outlet, useMatches } from '@remix-run/react'

import { useUser } from '~/utils'
import Sidenav from '~/components/Sidenav'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'

export default function AppLayout() {
  const user = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const matches = useMatches()

  const secondaryNav = matches
    .filter(match => match.handle && match.handle.topNav)
    .at(-1)

  return (
    <>
      <motion.header className="fixed left-0 right-0 top-0 isolate z-50 block bg-background-secondary pt-safe-top shadow-lg md:hidden">
        <div className="relative z-[999] flex items-center justify-between bg-background-secondary px-4 py-2">
          <div>
            <button
              type="button"
              onClick={() => setSidebarOpen(o => !o)}
              className="block md:hidden"
            >
              <MenuAlt2Icon className="h-8 w-8" />
            </button>
          </div>

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

        <AnimatePresence mode="popLayout" initial={false}>
          {secondaryNav && (
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
            >
              {secondaryNav.handle?.topNav({
                data: secondaryNav.data,
                params: secondaryNav.params,
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <Sidenav open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="isolate mb-4 mt-[59.91px] flex flex-1 flex-col pt-safe-top md:mt-0 md:pl-64">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </>
  )
}
