import {
  BadgeDemo,
  ButtonDemo,
  HeaderDemo,
  ProgressDemo,
} from '~/components/Demo'

export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-6 p-2">
      <HeaderDemo />
      <BadgeDemo />
      <ProgressDemo />
      <ButtonDemo />
    </div>
  )
}
