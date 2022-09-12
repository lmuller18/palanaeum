import clsx from 'clsx'
import { Link } from '@remix-run/react'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/outline'

const ChapterPagination = ({
  currentPage,
  lastPage,
}: {
  currentPage: number
  lastPage: number
}) => {
  return (
    <nav className="mt-4 mb-4 flex items-center justify-between border-t border-slate-700 px-4">
      <div className="-mt-px flex w-0 flex-1">
        {currentPage !== 1 ? (
          <Link
            to={`?page=${currentPage - 1}`}
            className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-slate-300 hover:border-slate-400 hover:text-slate-100"
          >
            <ArrowLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-slate-500">
            <ArrowLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
            Previous
          </span>
        )}
      </div>
      <div className="-mt-px flex">
        {pagination(currentPage, lastPage).map((page, i) =>
          page.to ? (
            <Link
              key={page.to}
              to={page.to}
              className={clsx(
                'inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium',
                page.active
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent text-gray-300 hover:border-slate-400 hover:text-slate-100',
              )}
            >
              {page.label}
            </Link>
          ) : (
            <div
              key={`filler-${i}`}
              className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
            >
              {page.label}
            </div>
          ),
        )}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        {currentPage !== lastPage ? (
          <Link
            to={`?page=${currentPage + 1}`}
            className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-slate-300 hover:border-slate-400 hover:text-slate-100"
          >
            Next
            <ArrowRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-slate-500">
            Next
            <ArrowRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
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
