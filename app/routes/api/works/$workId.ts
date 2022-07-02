import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { notFound } from 'remix-utils'
import invariant from 'tiny-invariant'
import { requireUserId } from '~/session.server'

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request)

  const workId = params.workId

  invariant(workId, 'expected workId')

  const book = await fetch(`http://openlibrary.org/works/${workId}.json`).then(
    res => res.json(),
  )

  if (!book?.covers) return notFound({ message: 'book not found' })

  return json({
    covers: book.covers.map(
      (c: string) => `http://covers.openlibrary.org/b/id/${c}-L.jpg`,
    ),
  })
}
