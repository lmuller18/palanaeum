import clsx from 'clsx'
import { useMemo } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
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

const Chart = ({
  data = DEFAULT_DATA,
  disabled = false,
  color = 'indigo',
}: {
  data?: {
    name: string
    y: number | null
    prediction?: number | null
  }[]
  disabled?: boolean
  color?: 'indigo' | 'emerald' | 'amber'
}) => {
  const chartData = disabled ? DEFAULT_DATA : data

  const stroke = useMemo(() => {
    switch (color) {
      case 'indigo':
        return 'stroke-indigo-500'
      case 'amber':
        return 'stroke-amber-500'
      case 'emerald':
        return 'stroke-emerald-500'
    }
  }, [color])

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={300}
          height={200}
          data={chartData}
          className={clsx(disabled && 'blur-sm')}
        >
          <Line
            dot={false}
            type="monotone"
            stroke="inherit"
            strokeDasharray="2 2"
            dataKey="prediction"
            strokeWidth={2}
            className={clsx(stroke)}
          />
          <Line
            dot={false}
            type="monotone"
            stroke="inherit"
            dataKey="y"
            strokeWidth={2}
            className={clsx(stroke)}
          />
        </LineChart>
      </ResponsiveContainer>
      {disabled && (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center">
          <Text variant="title2">Chart Unavailable</Text>
        </div>
      )}
    </div>
  )
}

export default Chart
