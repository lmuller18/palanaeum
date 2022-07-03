import clsx from 'clsx'

const colors = {
  red: 'text-red-500 hover:text-red-400',
  orange: 'text-orange-500 hover:text-orange-400',
  amber: 'text-amber-500 hover:text-amber-400',
  yellow: 'text-yellow-500 hover:text-yellow-400',
  lime: 'text-lime-500 hover:text-lime-400',
  green: 'text-green-500 hover:text-green-400',
  emerald: 'text-emerald-500 hover:text-emerald-400',
  teal: 'text-teal-500 hover:text-teal-400',
  cyan: 'text-cyan-500 hover:text-cyan-400',
  sky: 'text-sky-500 hover:text-sky-400',
  blue: 'peer-checked:bg-blue-600 peer-focus:ring-blue-800',
  indigo: 'text-indigo-400 hover:text-indigo-300',
  violet: 'text-violet-500 hover:text-violet-400',
  purple: 'text-purple-500 hover:text-purple-400',
  fuchsia: 'text-fuchsia-500 hover:text-fuchsia-400',
  pink: 'text-pink-500 hover:text-pink-400',
  rose: 'text-rose-500 hover:text-rose-400',
}

interface SwitchProps {
  id?: string
  label?: string
  color?: keyof typeof colors
  buttonProps?: Omit<React.ComponentProps<'div'>, 'className' | 'children'>
  inputProps?: Omit<
    React.ComponentProps<'input'>,
    'id' | 'type' | 'className' | 'children'
  >
}

const Switch = ({ id, label, color = 'blue', inputProps }: SwitchProps) => (
  <label
    htmlFor={id}
    className="relative inline-flex cursor-pointer items-center"
  >
    <input type="checkbox" id={id} className="peer sr-only" {...inputProps} />
    <div
      className={clsx(
        "peer h-6 w-11 rounded-full  border-gray-600 bg-gray-700 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4",
        colors[color],
      )}
    />
    {label && (
      <span className="ml-3 text-sm font-medium text-gray-300">{label}</span>
    )}
  </label>
)

export default Switch
