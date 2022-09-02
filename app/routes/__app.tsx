import { useState } from 'react'
import { Link, Outlet, useMatches } from '@remix-run/react'
import { MenuAlt2Icon } from '@heroicons/react/outline'

import { useUser } from '~/utils'
import Sidenav from '~/components/Sidenav'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { AnimatePresence, motion } from 'framer-motion'

export default function AppLayout() {
  const user = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const matches = useMatches()

  const secondaryNav = matches
    .filter(match => match.handle && match.handle.topNav)
    .at(-1)

  return (
    <>
      <motion.header className="fixed left-0 right-0 top-0 isolate z-50 bg-background-secondary pt-safe-top shadow-lg">
        <div className="relative z-[999] flex items-center justify-between bg-background-secondary px-4 py-2">
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

        <AnimatePresence mode="popLayout">
          {secondaryNav && (
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
            >
              {secondaryNav.handle?.topNav({
                title: secondaryNav.data.chapter.title,
                clubId: secondaryNav.params.clubId,
                chapterId: secondaryNav.params.chapterId,
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <Sidenav open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="mb-4 mt-[59.91px] pt-safe-top">
        <Outlet />
      </main>
    </>
  )
}
