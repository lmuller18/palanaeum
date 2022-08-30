import clsx from 'clsx'

interface ClickableAreaProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  as?: React.ElementType
}

const ClickableArea = ({ as, className, ...props }: ClickableAreaProps) => {
  const Tag = as ?? 'button'

  return (
    <Tag
      className={clsx(
        'group touch-none select-none transition-colors duration-75 active:bg-white/10',
        className,
      )}
      {...props}
    />
  )
}

export default ClickableArea
