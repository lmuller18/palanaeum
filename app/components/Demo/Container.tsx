import { ReactNode } from 'react'
import { Disclosure, Transition } from '@headlessui/react'

interface ContainerProps {
  title: string
  children: ReactNode
}

const Container = ({ title, children }: ContainerProps) => (
  <div className="w-full">
    <div className="rounded-lg bg-background-secondary">
      <Disclosure>
        <Disclosure.Button className="flex w-full justify-center rounded-lg px-4 py-2 text-xl font-medium focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
          {title}
        </Disclosure.Button>

        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
          className="w-full"
        >
          <Disclosure.Panel className="flex w-full flex-col items-start gap-6 p-4 pt-2">
            {children}
          </Disclosure.Panel>
        </Transition>
      </Disclosure>
    </div>
  </div>
)

export default Container
