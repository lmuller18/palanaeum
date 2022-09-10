import type { ComponentProps } from 'react'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function FormattedDate({
  date,
  ...props
}: { date: Date } & ComponentProps<'time'>) {
  return (
    <time dateTime={date.toISOString()} {...props}>
      {dateFormatter.format(date)}
    </time>
  )
}

export default FormattedDate
