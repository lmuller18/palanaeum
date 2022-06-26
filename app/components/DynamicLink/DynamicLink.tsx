import { Link } from '@remix-run/react'
import { ReactNode } from 'react'

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

export default DynamicLink
