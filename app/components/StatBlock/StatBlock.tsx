import { AnimatePresence, motion } from 'framer-motion'

import DynamicLink from '../DynamicLink'
import Text from '~/elements/Typography/Text'
import useValueChanged from '~/hooks/use-value-changed'

const StatBlock = () => {
  return (
    <dl className="mb-4 grid grid-cols-[1fr,1fr] grid-rows-[100px,100px] gap-px overflow-hidden rounded-lg bg-background-tertiary">
      <Stat stat="Members" value={3} />
      <Stat stat="Members" value={3} />
      <Stat stat="Members" value={3} />
      <Stat stat="Members" value={3} />
    </dl>
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

export default StatBlock
