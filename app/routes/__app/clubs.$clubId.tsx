import { Link, Outlet } from 'remix'
import Text from '~/elements/Typography/Text'

export default function ClubLayout() {
  return (
    <>
      <div className="relative py-6">
        <div
          className="absolute top-0 left-0 right-0 -bottom-6"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(220, 17%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
          }}
        />
        <Link
          to="."
          className="relative mx-auto block aspect-[0.66/1] w-full max-w-[200px] overflow-hidden rounded-lg shadow-md "
        >
          <img
            className="h-full w-full object-cover"
            src="/images/war.jpg"
            alt={'Rythm of War cover'}
          />
        </Link>
      </div>
      <div className="relative mx-auto max-w-lg px-4">
        <div className="mb-4">
          <Text as="h3" variant="title1" serif>
            Rhythm of War
          </Text>
          <Text variant="subtitle1" as="p" className="text-right">
            By Brandon Sanderson
          </Text>
        </div>

        <Outlet />
      </div>
    </>
  )
}
