import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Dialog } from '@headlessui/react'

const SheetModal = ({
  onClose,
  children,
}: {
  onClose: (value: boolean) => void
  children: ReactNode
}) => {
  return (
    <Dialog className="fixed inset-0 z-50" onClose={onClose} open={true}>
      <div className="flex h-full flex-col justify-center px-1 pt-4 text-center sm:block sm:p-0">
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
          initial={{ y: '100%' }}
          animate={{
            y: 0,
            transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
          }}
          exit={{
            y: '100%',
            transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
          }}
          className="z-0 flex h-full w-full flex-col rounded-t-lg bg-background-tertiary shadow-xl"
        >
          {children}
        </motion.div>
      </div>
    </Dialog>
  )
}

export default SheetModal
