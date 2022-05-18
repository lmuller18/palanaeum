import clsx from 'clsx'
import { useMemo } from 'react'
import {
  Area,
  YAxis,
  ResponsiveContainer,
  AreaChart as AreaRechart,
} from 'recharts'

import Text from '~/elements/Typography/Text'

const DEFAULT_DATA = [
  { name: 'Page A', y: 2400 },
  { name: 'Page B', y: 1398 },
  { name: 'Page C', y: 9800 },
  { name: 'Page D', y: 3908 },
  { name: 'Page E', y: 4800 },
  { name: 'Page F', y: 3800 },
  { name: 'Page G', y: 4300 },
]

const AreaChart = ({
  data = DEFAULT_DATA,
  disabled = false,
  color = 'indigo',
}: {
  data?: {
    name: string
    y: number
  }[]
  disabled?: boolean
  color?: 'indigo' | 'emerald' | 'amber'
}) => {
  const chartData = disabled ? DEFAULT_DATA : data

  const chartColor = useMemo(() => {
    switch (color) {
      case 'indigo':
        return '#6366f1'
      case 'amber':
        return '#f59e0b'
      case 'emerald':
        return '#10b981'
    }
  }, [color])

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaRechart
          width={300}
          height={200}
          data={chartData}
          className={clsx(disabled && 'blur-sm')}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis
            type="number"
            domain={[0, Math.max(...chartData.map(d => d.y))]}
            hide
          />
          <Area
            type="monotone"
            dataKey="y"
            fill={chartColor}
            stroke={chartColor}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaRechart>
      </ResponsiveContainer>
      {disabled && (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center">
          <Text variant="title2">Chart Unavailable</Text>
        </div>
      )}
    </div>
  )
}

export default AreaChart
