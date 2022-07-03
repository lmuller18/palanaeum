interface OutlinedInputProps {
  labelProps: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >
  inputProps: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
}

const OutlinedInput = ({ labelProps, inputProps }: OutlinedInputProps) => (
  <div className="relative rounded-md border border-background-tertiary px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
    <label
      className="absolute -top-2 left-2 -mt-px inline-block bg-background-primary px-1 text-xs font-medium text-white"
      {...labelProps}
    />
    <input
      className="block w-full border-0 bg-background-primary p-0 text-white placeholder-gray-500 focus:ring-0 sm:text-sm"
      {...inputProps}
    />
  </div>
)

export default OutlinedInput
