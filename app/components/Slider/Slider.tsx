import {
  motion,
  animate,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion'
import { useRef, useMemo, useState, useEffect } from 'react'

const CHAPTERS = [
  { id: '1', title: 'Chapter 1' },
  { id: '2', title: 'Chapter 2' },
  { id: '3', title: 'Chapter 3' },
  { id: '4', title: 'Chapter 4' },
  { id: '5', title: 'Chapter 5' },
  { id: '6', title: 'Chapter 6' },
  { id: '7', title: 'Chapter 7' },
  { id: '8', title: 'Chapter 8' },
]

const Slider = ({
  chapters = CHAPTERS,
  initialChapter = CHAPTERS[0],
}: {
  chapters?: typeof CHAPTERS
  initialChapter?: typeof CHAPTERS[number]
}) => {
  let min = 0
  let max = 100

  const [value, setValue] = useState(
    (chapters.findIndex(v => initialChapter.id === v.id) /
      (chapters.length - 1)) *
      100,
  )
  let percent = value / (max - min)

  const ticks = useMemo(
    () =>
      chapters.map((c, i) => ({
        id: c.id,
        title: c.title,
        value: (i / (chapters.length - 1)) * 100,
      })),
    [chapters],
  )

  const [dragging, setDragging] = useState(false)
  const constraintsRef = useRef<HTMLDivElement>(null!)
  const handleRef = useRef<HTMLDivElement>(null!)
  const progressBarRef = useRef<HTMLDivElement>(null!)
  const handleSize = 40
  const handleX = useMotionValue(0)
  const progress = useTransform(handleX, v => v + handleSize / 2)
  const background = useMotionTemplate`linear-gradient(90deg, #374151 ${progress}px, #d1d5db 0)`

  function handleDrag() {
    const handleBounds = handleRef.current.getBoundingClientRect()
    const middleOfHandle = handleBounds.x + handleBounds.width / 2
    const progressBarBounds = progressBarRef.current.getBoundingClientRect()
    const newProgress =
      (middleOfHandle - progressBarBounds.x) / progressBarBounds.width

    const newProgressPx = newProgress * (max - min)
    setValue(newProgressPx)
  }

  const closest = useMemo(
    () =>
      ticks.reduce((prev, cur) => {
        const curDif = Math.abs(cur.value - value)
        const prevDif = Math.abs(prev.value - value)
        if (curDif < prevDif) return cur
        return prev
      }, ticks[0]),
    [ticks, value],
  )

  function onDragEnd() {
    setDragging(false)
    setValue(closest.value)

    const { width } = progressBarRef.current.getBoundingClientRect()
    const newProgress = (closest.value / 100) * width - handleSize / 2
    animate(handleX, newProgress)
  }

  useEffect(() => {
    const newProgress = value / (max - min)
    const progressBarBounds = progressBarRef.current.getBoundingClientRect()

    handleX.set(newProgress * progressBarBounds.width - handleSize / 2)
  }, [handleX, max, min, value])

  return (
    <div className="mx-auto max-w-xl py-8">
      <div data-test="slider" className="relative flex flex-col justify-center">
        <motion.div
          data-test="slider-background"
          className="absolute h-3 w-full rounded-full"
          style={{ background }}
        />

        <div
          data-test="slider-progress"
          ref={progressBarRef}
          className="absolute h-2"
          style={{
            left: 0,
            right: 0,
          }}
        />

        <div ref={constraintsRef}>
          <motion.div
            data-test="slider-handle"
            ref={handleRef}
            className="relative z-10 cursor-pointer rounded-full bg-violet-500"
            drag="x"
            dragMomentum={false}
            dragConstraints={constraintsRef}
            dragElastic={0}
            onDrag={handleDrag}
            onDragStart={() => setDragging(true)}
            onDragEnd={onDragEnd}
            onPointerDown={() => setDragging(true)}
            onPointerUp={() => setDragging(false)}
            animate={{
              scale: dragging ? 1.25 : 1,
            }}
            style={{
              width: handleSize,
              height: handleSize,
              x: handleX,
            }}
          />
        </div>

        {ticks.map((t, i) => (
          <div
            className="absolute flex h-6 w-[25px] -translate-x-1/2 transform cursor-pointer justify-center"
            key={`tick-${t.value}`}
            style={{ left: `${t.value}%` }}
            onPointerDown={() => {
              const { width } = progressBarRef.current.getBoundingClientRect()
              const newProgress = (t.value / 100) * width - handleSize / 2
              animate(handleX, newProgress)
              setValue(t.value)
            }}
          >
            {i !== 0 && i !== ticks.length - 1 && (
              <div className="h-full w-1 rounded-[500px] bg-violet-500" />
            )}
          </div>
        ))}
      </div>

      <motion.div
        className="text-xl"
        animate={{ y: dragging && percent < 0.15 ? 20 : 0 }}
      >
        {closest.title}
      </motion.div>
    </div>
  )
}

export default Slider
