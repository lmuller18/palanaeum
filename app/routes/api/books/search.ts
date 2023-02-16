import invariant from 'tiny-invariant'

import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'

import { requireUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  const search = new URL(request.url).searchParams.get('q')

  invariant(search, 'expected search params')

  const books = await fetch(
    `http://openlibrary.org/search.json?mode=works&title=${encodeURIComponent(
      search,
    )}`,
  )
    .then(res => res.json())
    .catch(() => null)

  if (!books?.docs?.length) return json({ results: [] })

  // @ts-ignore
  const results = books.docs.map(b => ({
    id: b.key,
    title: b.title,
    image: b.cover_i
      ? `http://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`
      : '/images/no-cover.png',
    publishDate: b.first_publish_year,
    author: b.author_name?.join(', '),
  }))

  return json({
    results,
  })
}
