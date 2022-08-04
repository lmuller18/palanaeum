import clsx from 'clsx'
import { Fragment, memo } from 'react'
import { Link, NavLink } from '@remix-run/react'
import { Dialog, Transition } from '@headlessui/react'
import {
  BookOpenIcon,
  HomeIcon,
  InboxIcon,
  XIcon,
} from '@heroicons/react/outline'

import Button from '~/elements/Button'
import BottomNavSection from './BottomNavSection'

const links = [
  { name: 'Home', to: '/', icon: HomeIcon },
  { name: 'Clubs', to: '/clubs', icon: BookOpenIcon },
  { name: 'Invites', to: '/invites', icon: InboxIcon },
]

const Sidenav = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-[999] flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-background-secondary">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div
                  className="absolute top-0 right-0 -mr-12 pt-2"
                  style={{
                    paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
                  }}
                >
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex h-0 flex-1 flex-col overflow-y-auto bg-cover bg-center bg-no-repeat">
                <div
                  className="flex flex-shrink-0 items-center bg-background-primary px-4 pt-5 pb-4"
                  style={{
                    paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
                  }}
                >
                  <img
                    className="h-8 w-auto"
                    src="/images/inline.svg"
                    alt="Palanaeum Logo"
                  />
                </div>
                <nav className="mt-5 space-y-1 px-2">
                  {links.map(link => (
                    <NavLink end to={link.to} key={link.to}>
                      {({ isActive }) => (
                        <button
                          onClick={() => setOpen(false)}
                          className={clsx(
                            isActive
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'group flex w-full items-center rounded-md px-2 py-2 text-base font-medium transition-colors',
                          )}
                        >
                          <link.icon
                            className={clsx(
                              isActive
                                ? 'text-gray-300'
                                : 'text-gray-400 group-hover:text-gray-300',
                              'mr-4 h-6 w-6 flex-shrink-0',
                            )}
                            aria-hidden="true"
                          />
                          {link.name}
                        </button>
                      )}
                    </NavLink>
                  ))}
                </nav>
                <div className="flex flex-grow items-center justify-center text-background-primary">
                  <img
                    src="/images/nav-background.svg"
                    className="not-sr-only"
                    aria-hidden="true"
                    alt="Background logo"
                  />
                </div>
              </div>
              <div className="p-4">
                <Link to="/clubs/new">
                  <Button
                    type="button"
                    fullWidth
                    onClick={() => setOpen(false)}
                  >
                    New Club
                  </Button>
                </Link>
              </div>
              <BottomNavSection setOpen={setOpen} />
            </Dialog.Panel>
          </Transition.Child>
          <div className="w-14 flex-shrink-0">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default memo(Sidenav)
