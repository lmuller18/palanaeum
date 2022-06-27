import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { useLoaderData } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/node'
const { searchAudible } = require('audible-api')
export const loader: LoaderFunction = async ({ request }) => {
  const search = new URL(request.url).searchParams.get('q')
  invariant(search, 'expected search')

  const aud = await searchAudible({
    keywords: 'search',
  })

  console.log('aud', aud)

  console.log('search: ', search, encodeURIComponent(search))
  // &mode=everything&has_fulltext=true`,

  const results = await fetch(
    `http://openlibrary.org/search.json?title=${encodeURIComponent(
      search,
    )}&mode=works`,
  ).then(res => {
    if (res.status === 204) return null
    return res.json()
  })

  if (results.docs) {
    const work = await fetch(
      `http://openlibrary.org/works/OL16597059W.json`,
    ).then(res => {
      if (res.status === 204) return null
      return res.json()
    })

    const book = await fetch(
      `http://openlibrary.org/books/OL27098434M.json`,
    ).then(res => {
      if (res.status === 204) return null
      return res.json()
    })

    return json({
      book,
      work,
      results,
    })
  }

  if (!results)
    json({
      message: 'no results',
    })

  return json({
    data: results,
  })
}

export default function Page() {
  const data = useLoaderData()
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
