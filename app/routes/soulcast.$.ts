import invariant from 'tiny-invariant'
import { notFound, serverError } from 'remix-utils'

import { Response } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async ({ params }) => {
  const path = params['*']
  invariant(path, 'expected path')

  try {
    const data = await fetch(decodeURI(path)).then(res => res.blob())

    if (!data) throw notFound({ message: 'Image not found' })

    return new Response(data, {
      headers: {
        type: data.type ?? 'image/jpeg',
        'Cache-Control': 'private, max-age=604800',
      },
    })
  } catch (e) {
    throw serverError({ error: e })
  }
}
