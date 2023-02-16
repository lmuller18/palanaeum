import clsx from 'clsx'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

import TextLink from '~/elements/TextLink'

const animation = {
  hide: { x: -32, opacity: 0 },
  show: { x: 0, opacity: 1 },
}

const imageAnimation = {
  hide: { opacity: 0, x: 120 },
  show: { opacity: 1, x: 0 },
  transition: {
    delay: 0.1,
    type: 'spring',
    damping: 20,
    stiffness: 100,
  },
}

interface PageHeaderProps {
  title: string
  description: string
  caption?: string
  headerImage?: ReactNode
  link?: string
}

function PageHeader({
  title,
  description,
  caption = '',
  headerImage = null,
  link,
}: PageHeaderProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '70%'])
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <header
      ref={ref}
      className={clsx(
        'relative z-[900] mb-10 overflow-hidden border-b border-divider-dark bg-background-primary pt-32 pb-10',
      )}
    >
      <motion.div style={{ y: gridY }} className="absolute inset-0 isolate">
        <div
          className={clsx(
            'h-full',
            'background-grid background-grid--fade-out',
          )}
        />
      </motion.div>

      {headerImage && (
        <motion.div
          style={{ y: imageY }}
          initial={imageAnimation.hide}
          animate={imageAnimation.show}
          transition={imageAnimation.transition}
          className={clsx(
            'content-wrapper-min absolute inset-0 overflow-hidden',
          )}
        >
          <div
            className={clsx(
              'background-image pointer-events-none absolute inset-0 block select-none',
            )}
          >
            <div className={clsx('content-wrapper-min relative h-full')}>
              <div className={clsx('absolute right-4 top-4 bottom-0')}>
                {headerImage}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="content-wrapper-min relative">
        {caption && (
          <motion.div
            initial={animation.hide}
            animate={animation.show}
            transition={{ delay: 0 }}
          >
            <p className="mb-1 text-lg font-extrabold capitalize leading-none">
              {caption}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={animation.hide}
          animate={animation.show}
          transition={{ delay: 0.1 }}
        >
          <TextLink
            to={link ?? '.'}
            className="block w-fit text-[2.5rem] font-extrabold leading-tight text-slate-100"
          >
            {title}
          </TextLink>
        </motion.div>
        <motion.div
          initial={animation.hide}
          animate={animation.show}
          transition={{ delay: 0.2 }}
        >
          <p className="mt-4 text-lg text-slate-300">{description}</p>
        </motion.div>
      </div>
    </header>
  )
}

export default PageHeader
