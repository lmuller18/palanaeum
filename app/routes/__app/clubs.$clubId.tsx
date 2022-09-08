import clsx from 'clsx'
import type { RouteMatch } from '@remix-run/react'
import { Outlet, useMatches } from '@remix-run/react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  HomeIcon,
  BookOpenIcon,
  NewspaperIcon as DiscussionsIcon,
  BookmarkAltIcon as ChaptersIcon,
  SpeakerphoneIcon as PostsIcon,
} from '@heroicons/react/outline'

import TabLink from '~/components/TabLink'
import useValueChanged from '~/hooks/use-value-changed'

export default function ClubNavigationLayout() {
  const matches = useMatches()

  const secondaryNavSections = matches
    // skip routes that don't have a breadcrumb
    .filter(match => match.handle && match.handle.nav)

  return (
    <>
      <div className="pb-safe-bottom">
        <Outlet />
      </div>

      {/* Nav section */}
      <div className="h-14" />
      <NavSection secondaryNavSections={secondaryNavSections} />
    </>
  )
}

const NavSection = ({
  secondaryNavSections,
}: {
  secondaryNavSections?: RouteMatch[]
}) => {
  const hasSecondaryNav =
    !!secondaryNavSections && secondaryNavSections.length > 0
  const valueChanged = useValueChanged(hasSecondaryNav)

  return (
    <div
      id="club-nav"
      className="fixed bottom-0 left-0 right-0 w-full transform-gpu"
    >
      <AnimatePresence exitBeforeEnter>
        {hasSecondaryNav && (
          <motion.div
            className="z-40 -mb-1 border-t border-background-tertiary bg-background-secondary"
            initial={valueChanged ? { y: 50 } : false}
            animate={{ y: 0 }}
            exit={{ y: 50, animationDelay: '.5s' }}
          >
            {secondaryNavSections.map((match, index) =>
              match.handle?.nav ? (
                <div key={index} className="rounded-t-lg p-2">
                  {match.handle.nav(match)}
                </div>
              ) : null,
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-[999] bg-background-secondary pb-safe-bottom">
        <NavBar hasSecondaryNav={hasSecondaryNav} />
      </div>
    </div>
  )
}

const NavBar = ({ hasSecondaryNav }: { hasSecondaryNav: boolean }) => (
  <div
    className={clsx(
      'flex h-14 items-end justify-around border-background-tertiary bg-background-secondary',
      !hasSecondaryNav && 'border-t',
    )}
  >
    <LayoutGroup id="club-nav">
      <TabLink to=".." color="sky">
        <HomeIcon className="h-6 w-6" />
      </TabLink>
      <TabLink to="chapters" color="pink">
        <ChaptersIcon className="h-6 w-6" />
      </TabLink>

      <TabLink to="." end color="teal">
        <BookOpenIcon className="h-6 w-6" />
      </TabLink>

      <TabLink to="posts" color="sky">
        <PostsIcon className="h-6 w-6" />
      </TabLink>
      <TabLink to="discussions" color="indigo">
        <DiscussionsIcon className="h-6 w-6" />
      </TabLink>
    </LayoutGroup>
  </div>
)
