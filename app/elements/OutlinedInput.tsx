import clsx from 'clsx'

const variants = {
  tertiary: {
    border: 'border-[#32353b]',
    background: 'bg-background-tertiary',
  },
  primary: {
    border: 'border-background-tertiary',
    background: 'bg-background-primary',
  },
  secondary: {
    border: '',
    background: 'bg-background-secondary',
  },
}

interface OutlinedInputProps {
  labelProps: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >
  inputProps: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
  variant?: keyof typeof variants
}

const OutlinedInput = ({
  labelProps,
  inputProps,
  variant = 'primary',
}: OutlinedInputProps) => {
  const { className: labelClass, ...lProps } = labelProps
  const { className: inputClass, ...iProps } = inputProps

  const colors = variants[variant]

  return (
    <div
      className={clsx(
        colors.border,
        'relative rounded-md border px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500',
      )}
    >
      <label
        className={clsx(
          'absolute -top-2 left-2 -mt-px inline-block px-1 text-xs font-medium text-white',
          colors.background,
          labelClass,
        )}
        {...lProps}
      />
      <input
        className={clsx(
          'block w-full border-0 p-0 text-white placeholder-gray-500 focus:ring-0 sm:text-sm',
          colors.background,
          inputClass,
        )}
        {...iProps}
      />
    </div>
  )
}

export default OutlinedInput
