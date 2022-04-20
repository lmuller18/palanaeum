import { DateTime } from 'luxon'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const data = [
  {
    name: 'Page A',
    date: DateTime.now().plus({ days: 1 }).toLocaleString(DateTime.DATE_SHORT),
    u1: 20,
    u2: 2,
    u3: 7,
  },
  {
    name: 'Page B',
    date: DateTime.now().plus({ days: 2 }).toLocaleString(DateTime.DATE_SHORT),
    u1: 2,
    u2: 1,
    u3: 10,
  },
  {
    name: 'Page C',
    date: DateTime.now().plus({ days: 3 }).toLocaleString(DateTime.DATE_SHORT),
    u1: 10,
    u2: 3,
    u3: 13,
  },
  {
    name: 'Page D',
    date: DateTime.now().plus({ days: 4 }).toLocaleString(DateTime.DATE_SHORT),
    u1: 17,
    u2: 14,
    u3: 5,
  },
  {
    name: 'Page E',
    date: DateTime.now().plus({ days: 5 }).toLocaleString(DateTime.DATE_SHORT),
    u1: 3,
    u2: 10,
    u3: 3,
  },
  {
    name: 'Page F',
    date: DateTime.now().plus({ days: 6 }).toLocaleString(DateTime.DATE_SHORT),
    u1: 1,
    u2: 2,
    u3: 17,
  },
  {
    name: 'Page G',
    date: DateTime.now().plus({ days: 7 }).toLocaleString(DateTime.DATE_SHORT),
    u1: 2,
    u2: 1,
    u3: 20,
  },
]

const Chart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart width={300} height={200} data={data}>
      <Line
        type="monotone"
        stroke="inherit"
        dataKey="u1"
        strokeWidth={2}
        className="stroke-indigo-500"
      />
      {/* <Line
        type="monotone"
        stroke="inherit"
        dataKey="u2"
        strokeWidth={2}
        className="stroke-emerald-500"
      />
      <Line
        type="monotone"
        stroke="inherit"
        dataKey="u3"
        strokeWidth={2}
        className="stroke-amber-300"
      /> */}
    </LineChart>
  </ResponsiveContainer>
)

export default Chart
