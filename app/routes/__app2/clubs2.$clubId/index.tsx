import { Link } from 'remix'
import { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useUser } from '~/utils'
import Post from '~/components/Post'
import Chart from '~/components/Chart'
import Text from '~/elements/Typography/Text'
import useValueChanged from '~/hooks/use-value-changed'
import DiscussionSummary from '~/components/DiscussionSummary/DiscussionSummary'

export default function ClubPage() {
  const user = useUser()
  return (
    <>
      {/* <dl className="mb-4 grid grid-cols-[1fr,1fr] grid-rows-[100px,100px] gap-px overflow-hidden rounded-lg bg-background-tertiary">
          <Stat stat="Members" value={3} />
          <Stat stat="Members" value={3} />
          <Stat stat="Members" value={3} />
          <Stat stat="Members" value={3} />
        </dl> */}

      {/* Chart Block */}
      <div className="mb-6 border-b border-t-2 border-indigo-500 border-b-background-tertiary bg-gradient-to-b from-indigo-400/10 via-transparent">
        <div
          className="h-full w-full p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%231e222a' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <Text variant="title1">23</Text>{' '}
              <Text variant="subtitle1">Chapters</Text>
            </div>
            <div>
              <Text variant="caption">16 Remaining</Text>
            </div>
          </div>
          <div className="h-64">
            <Chart />
          </div>
        </div>
      </div>

      {/* Top Post Block */}
      <div className="mb-6 border-b border-t-2 border-sky-400 border-b-background-tertiary bg-gradient-to-b from-sky-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Top Post
        </Text>
        <Post
          user={user}
          chapter={{ id: '3', name: 'Chapter 3' }}
          post={{
            id: '1',
            content: `So Mraize's boss is willing to make deals with the Fused to gain
          Oathgate access. Interesting that he would need them, since Mraize
          seems to have access to things off world already.`,
          }}
        />
      </div>

      {/* Top Discussion Block */}
      <div className="mb-6 border-b border-t-2 border-emerald-400 border-b-background-tertiary bg-gradient-to-b from-emerald-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Hottest Discussion
        </Text>
        <DiscussionSummary
          user={user}
          chapter={{ id: '1', title: 'Chapter 5' }}
          discussion={{ id: '1', title: '3 Pure Tones and 3 Shards of Roshar' }}
        />
      </div>
    </>
  )
}

const Stat = ({
  stat,
  value,
  to,
}: {
  stat: string
  value: number | string
  to?: string
}) => {
  const valueChanged = useValueChanged(value)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background-secondary">
      <DynamicLink to={to}>
        <Text
          as="dt"
          variant="caption"
          className="truncate text-center text-gray-300"
        >
          {stat}
        </Text>
        <AnimatePresence exitBeforeEnter>
          <motion.div
            initial={valueChanged ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key={value}
            className="mt-1 text-center"
          >
            <Text as="dd" variant="title1">
              {value}
            </Text>
          </motion.div>
        </AnimatePresence>
      </DynamicLink>
    </div>
  )
}

const DynamicLink = ({
  to,
  ...props
}: {
  to?: string
  children: ReactNode
}) => {
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  if (to) return <Link to={to} {...props} />
  return <div {...props} />
}
