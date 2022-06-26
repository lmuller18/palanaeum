import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Dialog } from '@headlessui/react'

const Modal = ({
  onClose,
  children,
}: {
  onClose: (value: boolean) => void
  children: ReactNode
}) => {
  return (
    <Dialog className="fixed inset-0 z-50" onClose={onClose} open={true}>
      <div className="flex h-full flex-col justify-center px-1 pt-4 sm:block sm:p-0">
        <Dialog.Overlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
          }}
          className="fixed inset-0 bg-black/40"
        />

        <motion.div
          initial={{ scale: 0, y: '100%' }}
          animate={{
            scale: '100%',
            y: 0,
            transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
          }}
          exit={{
            y: '100%',
            scale: 0,
            opacity: 0,
            transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
          }}
          className="z-0 flex w-full flex-col rounded-lg bg-background-tertiary shadow-xl sm:rounded-none"
        >
          {children}
        </motion.div>
      </div>
    </Dialog>
  )
}

export default Modal
