import clsx from 'clsx'

interface ClickableAreaProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  as?: React.ElementType
}

const ClickableArea = ({
  as,
  className,
  children,
  ...props
}: ClickableAreaProps) => {
  const Tag = as ?? 'button'

  return (
    <Tag className={clsx('group touch-none select-none', className)} {...props}>
      {children}
      <div className="pointer-events-none absolute inset-0 rounded-lg transition-colors duration-75 group-active:bg-white/20" />
    </Tag>
  )
}

export default ClickableArea
