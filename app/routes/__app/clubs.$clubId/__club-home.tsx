import { Outlet } from 'remix'
import { LayoutGroup } from 'framer-motion'

import TabLink from '~/components/TabLink'

export default function ClubHomeLayout() {
  return (
    <>
      {/* Nav section */}
      <div
        className="mb-6 grid grid-cols-3 border-l border-t border-r border-background-tertiary shadow-md hover:shadow-lg focus:shadow-lg"
        role="group"
      >
        <LayoutGroup id="club-nav-wrapper">
          <TabLink to="posts" color="sky" layoutId="club-nav">
            Posts
          </TabLink>
          <TabLink to="." end color="teal" layoutId="club-nav">
            Home
          </TabLink>
          <TabLink to="chapters" color="indigo" layoutId="club-nav">
            Chapters
          </TabLink>
        </LayoutGroup>
      </div>

      <Outlet />
    </>
  )
}
