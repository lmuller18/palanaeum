import {
  motion,
  useTransform,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion'
import { useMemo, useEffect } from 'react'

import Text from '~/elements/Typography/Text'

const CircularProgress = ({
  percent,
  label,
  emptyStrokeOpacity = 0.25,
  strokeWidth = 6,
}: {
  percent: number
  label?: string | number
  emptyStrokeOpacity?: number
  strokeWidth?: number
}) => {
  const radius = 45
  const circumference = Math.ceil(2 * Math.PI * radius)

  const fillPercents = useMemo(() => {
    const p = percent < 0 ? 0 : percent > 100 ? 100 : percent
    return Math.abs(Math.ceil((circumference / 100) * (p - 100)))
  }, [percent, circumference])
  const colorValue = useMotionValue(fillPercents)
  const color = useTransform(
    colorValue,
    [0, 50, 100],
    ['#e11d48', '#eab308', '#2563eb'],
  )

  useEffect(() => {
    colorValue.set(fillPercents)
  }, [fillPercents, colorValue])

  return (
    <div className="relative items-center justify-center">
      <AnimatePresence mode="wait">
        {typeof label !== 'undefined' && (
          <motion.div
            className="absolute flex h-full w-full items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Text variant="caption">{label}</Text>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-8 w-8">
        <svg
          viewBox="0 0 100 100"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            className="circle"
            strokeWidth={strokeWidth}
            stroke="#666"
            strokeOpacity={emptyStrokeOpacity}
            fill="transparent"
            animate={{
              scale: typeof label !== 'undefined' ? 1 : 0.85,
            }}
          />
        </svg>
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          style={{
            transform: 'rotate(-90deg)',
            overflow: 'visible',
          }}
        >
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth={strokeWidth}
            stroke={color}
            fill="transparent"
            strokeDashoffset={fillPercents}
            strokeDasharray={circumference}
            initial={false}
            animate={{
              strokeDashoffset: fillPercents,
              scale: typeof label !== 'undefined' ? 1 : 0.85,
            }}
          />
        </svg>
      </div>
    </div>
  )
}

export default CircularProgress
