import { useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const Modal = ({
  open,
  onClose,
  children,
  backdropColor = 'black',
  scaleBackground = false,
}: {
  open: boolean
  onClose: (value: boolean) => void
  children: ReactNode
  backdropColor?: string
  scaleBackground?: boolean
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
        <Dialog className="fixed inset-0 z-50" onClose={onClose} open={true}>
          <div className="flex h-full flex-col justify-center px-3 pt-4 sm:block sm:p-0">
            <Dialog.Overlay
              as={motion.div}
              variants={{
                open: {
                  opacity: 1,
                  transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
                },
                closed: {
                  opacity: 0,
                  transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
                },
              }}
              initial="closed"
              animate="open"
              exit="closed"
              onAnimationStart={(variant: string) => {
                if (!scaleBackground) return
                if (variant === 'open') {
                  set(document.documentElement, {
                    background: backdropColor,
                    height: '100vh',
                  })
                  set(document.body, {
                    position: 'fixed',
                    inset: '0',
                  })
                  set(document.querySelector('#app'), {
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transform: 'scale(0.93)',
                    transformOrigin: 'center',
                    transitionProperty: 'transform',
                    transitionDuration: `0.4s`,
                    transitionTimingFunction: `cubic-bezier(0.36,0.66,0.04,1)`,
                  })
                } else {
                  reset(document.querySelector('#app'), 'transform')
                }
              }}
              onAnimationComplete={(variant: string) => {
                if (!scaleBackground) return
                if (variant === 'closed') {
                  reset(document.documentElement)
                  reset(document.body)
                  reset(document.querySelector('#app'))
                }
              }}
              className="fixed inset-0 bg-black/40"
            />

            <motion.div
              initial={{
                scale: 0,
              }}
              animate={{
                scale: '100%',
                transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
              }}
              exit={{
                scale: 0,
                opacity: 0,
                transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
              }}
              className="z-0 flex w-full flex-col rounded-lg border border-[#32353b] bg-background-tertiary shadow-xl sm:rounded-none"
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

export default Modal
