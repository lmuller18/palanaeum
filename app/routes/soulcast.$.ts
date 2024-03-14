import invariant from 'tiny-invariant'

import type { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async ({ params }) => {
  const path = params['*']
  invariant(path, 'expected path')

  try {
    const url = decodeURI(path)
    const data = await fetch(url).then(res => res.blob())

    if (!data)
      throw new Response(null, { status: 404, statusText: 'Image not found' })

    return new Response(data, {
      headers: {
        type: data.type ?? 'image/jpeg',
        'Cache-Control': 'private, max-age=604800',
      },
    })
  } catch (e) {
    throw e
  }
}
