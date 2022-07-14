import clsx from 'clsx'
import {
  Pie,
  Cell,
  ResponsiveContainer,
  PieChart as PieRechart,
} from 'recharts'

import Text from '~/elements/Typography/Text'

const DEFAULT_DATA = [
  { name: 'Group A', value: 3 },
  { name: 'Group B', value: 1 },
]

const COLORS = ['#6366f1', '#f43f5e']

const PieChart = ({
  data = DEFAULT_DATA,
  disabled = false,
  colors = COLORS,
}: {
  data?: {
    name: string
    value: number
  }[]
  colors?: string[]
  disabled?: boolean
}) => {
  const chartData = disabled ? DEFAULT_DATA : data

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieRechart
          data={chartData}
          className={clsx(disabled && 'blur-sm')}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Pie
            data={chartData}
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="140%"
            outerRadius="150%"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
                fillOpacity={0.5}
              />
            ))}
          </Pie>
        </PieRechart>
      </ResponsiveContainer>
      {disabled && (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center">
          <Text variant="title2">Chart Unavailable</Text>
        </div>
      )}
    </div>
  )
}

export default PieChart
