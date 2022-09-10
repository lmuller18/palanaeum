import clsx from 'clsx'
import { Link } from '@remix-run/react'

const ChapterPagination = ({
  currentPage,
  lastPage,
}: {
  currentPage: number
  lastPage: number
}) => {
  return (
    <nav
      className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(50px,1fr))] border-t border-background-tertiary"
      role="group"
    >
      {pagination(currentPage, lastPage).map((page, i) => (
        <div key={page.to + '-' + i} className="flex text-center">
          {page.to ? (
            <Link
              to={page.to}
              className={clsx(
                page.active &&
                  'border-t-2 border-pink-500 font-bold text-pink-400',
                'flex-grow py-2',
              )}
            >
              {page.label}
            </Link>
          ) : (
            <div className="flex-grow py-2">{page.label}</div>
          )}
        </div>
      ))}
    </nav>
  )
}

function getRange(start: number, end: number, current: number) {
  return Array(end - start + 1)
    .fill(0)
    .map((v, i) => ({
      to: `?page=${i + start}`,
      active: i + start === current,
      label: `${i + start}`,
      number: i + start,
    }))
}

interface Page {
  to: string | null
  active: boolean
  label: string
  number: number
}

function pagination(current: number, length: number, delta = 2) {
  const range = {
    start: Math.round(current - delta / 2),
    end: Math.round(current + delta / 2),
  }

  if (range.start - 1 === 1 || range.end + 1 === length) {
    range.start += 1
    range.end += 1
  }

  let pages: Page[] =
    current > delta
      ? getRange(
          Math.min(range.start, length - delta),
          Math.min(range.end, length),
          current,
        )
      : getRange(1, Math.min(length, delta + 1), current)

  const withDots = (value: Page, pair: [Page, Page]) =>
    pages.length + 1 !== length ? pair : [value]

  if (pages[0].number !== 1) {
    pages = withDots(
      {
        to: '?page=1',
        active: current === 1,
        label: '1',
        number: 1,
      },
      [
        {
          to: '?page=1',
          active: current === 1,
          label: '1',
          number: 1,
        },
        {
          to: null,
          active: false,
          label: '...',
          number: -1,
        },
      ],
    ).concat(pages)
  }

  if (pages[pages.length - 1].number < length) {
    pages = pages.concat(
      withDots(
        {
          active: length === current,
          label: `${length}`,
          number: length,
          to: `?page=${length}`,
        },
        [
          {
            to: null,
            active: false,
            label: '...',
            number: -1,
          },
          {
            active: length === current,
            label: `${length}`,
            number: length,
            to: `?page=${length}`,
          },
        ],
      ),
    )
  }

  return pages
}

export default ChapterPagination
