import { Disclosure, Transition } from '@headlessui/react'
import Badge from '~/components/Badge'
import Header from '~/components/Typography/Header'

export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-6 p-2">
      <Disclosure>
        <Disclosure.Button className="rounded-md bg-background-secondary p-2 text-3xl">
          Headers
        </Disclosure.Button>

        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Disclosure.Panel>
            <Header size="h1">H1 Primary</Header>
            <Header size="h2">H2 Primary</Header>
            <Header size="h3">H3 Primary</Header>
            <Header size="h4">H4 Primary</Header>
            <Header size="h5">H5 Primary</Header>
            <Header size="h6">H6 Primary</Header>

            <Header size="h1" variant="secondary">
              H1 Secondary
            </Header>
            <Header size="h2" variant="secondary">
              H2 Secondary
            </Header>
            <Header size="h3" variant="secondary">
              H3 Secondary
            </Header>
            <Header size="h4" variant="secondary">
              H4 Secondary
            </Header>
            <Header size="h5" variant="secondary">
              H5 Secondary
            </Header>
            <Header size="h6" variant="secondary">
              H6 Secondary
            </Header>
          </Disclosure.Panel>
        </Transition>
      </Disclosure>

      <Disclosure>
        <Disclosure.Button className="rounded-md bg-background-secondary p-2 text-3xl">
          Badges
        </Disclosure.Button>

        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Disclosure.Panel>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge rounded="none">Default</Badge>
                <Badge rounded="none">None</Badge>
                <Badge rounded="sm">Small</Badge>
                <Badge rounded="md">Medium</Badge>
                <Badge rounded="lg">Large</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="default">Default</Badge>
                <Badge color="amber">Amber</Badge>
                <Badge color="blue">Blue</Badge>
                <Badge color="cyan">Cyan</Badge>
                <Badge color="emerald">Emerald</Badge>
                <Badge color="fuchsia">Fuchsia</Badge>
                <Badge color="green">Green</Badge>
                <Badge color="indigo">Indigo</Badge>
                <Badge color="lime">Lime</Badge>
                <Badge color="orange">Orange</Badge>
                <Badge color="pink">Pink</Badge>
                <Badge color="purple">Purple</Badge>
                <Badge color="red">Red</Badge>
                <Badge color="rose">Rose</Badge>
                <Badge color="sky">Sky</Badge>
                <Badge color="teal">Teal</Badge>
                <Badge color="violet">Violet</Badge>
                <Badge color="yellow">Yellow</Badge>
              </div>
            </div>
          </Disclosure.Panel>
        </Transition>
      </Disclosure>
    </div>
  )
}
