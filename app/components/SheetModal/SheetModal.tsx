import { useEffect } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Dialog } from '@headlessui/react'

const TRANSITIONS = {
  DURATION: 0.5,
  EASE: [0.32, 0.72, 0, 1],
}

const SheetModal = ({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: (value: boolean) => void
  children: ReactNode
}) => {
  useEffect(
    () => () => {
      reset(document.documentElement)
      reset(document.body)
      reset(document.querySelector('#app'))
    },
    [],
  )

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          className="fixed inset-0 z-50"
          onClose={onClose}
          open={true}
          static
        >
          <Dialog.Overlay
            as={motion.div}
            variants={{
              open: {
                opacity: 1,
                transition: {
                  ease: TRANSITIONS.EASE,
                  duration: TRANSITIONS.DURATION,
                },
              },
              closed: {
                opacity: 0,
                transition: {
                  ease: TRANSITIONS.EASE,
                  duration: TRANSITIONS.DURATION,
                },
              },
            }}
            initial="closed"
            animate="open"
            exit="closed"
            onAnimationStart={(variant: string) => {
              if (variant === 'open') {
                set(document.documentElement, {
                  background: 'black',
                  height: '100vh',
                })
                set(document.body, {
                  position: 'fixed',
                  inset: '0',
                })
                set(document.querySelector('#app'), {
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transform:
                    'scale(0.93) translateY(calc(env(safe-area-inset-top) + 8px))',
                  transformOrigin: 'top',
                  transitionProperty: 'transform',
                  transitionDuration: `${TRANSITIONS.DURATION}s`,
                  transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(
                    ',',
                  )})`,
                })
              } else {
                reset(document.querySelector('#app'), 'transform')
              }
            }}
            onAnimationComplete={(variant: string) => {
              if (variant === 'closed') {
                reset(document.documentElement)
                reset(document.body)
                reset(document.querySelector('#app'))
              }
            }}
            className="fixed inset-0 bg-black/40"
          />

          <div
            className="pointer-events-none fixed inset-x-0 bottom-0"
            style={{
              top: 'calc(env(safe-area-inset-top) + 16px)',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{
                y: 0,
                transition: {
                  ease: TRANSITIONS.EASE,
                  duration: TRANSITIONS.DURATION,
                },
              }}
              exit={{
                y: '100%',
                transition: {
                  ease: TRANSITIONS.EASE,
                  duration: TRANSITIONS.DURATION,
                },
              }}
              className="pointer-events-auto absolute inset-x-0 top-0 bottom-0 mt-4 overflow-y-auto rounded-t-xl bg-background-tertiary shadow-xl"
            >
              {children}
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

const cache = new Map<HTMLElement, { [key in keyof CSSProperties]: string }>()

function set(
  el: HTMLElement | null,
  styles: { [key in keyof CSSProperties]: string },
) {
  if (!el) return
  const originalStyles: { [key: string]: string } = {}

  Object.entries(styles).forEach(([key, value]) => {
    // @ts-ignore
    originalStyles[key] = el.style[key]
    // @ts-ignore
    el.style[key] = value
  })

  cache.set(el, originalStyles)
}

function reset(el: HTMLElement | null, prop?: string) {
  if (!el) return null
  const originalStyles = cache.get(el)
  if (!originalStyles) return
  if (prop) {
    // @ts-ignore
    el.style[prop] = originalStyles[prop]
  } else {
    Object.entries(originalStyles).forEach(([key, value]) => {
      // @ts-ignore
      el.style[key] = value
    })
  }
}

export default SheetModal
