import invariant from 'tiny-invariant'

import type { LoaderFunction } from '@remix-run/node'
import { GetObjectCommand } from '@aws-sdk/client-s3'

import { s3Client } from '~/storage.server'

export const loader: LoaderFunction = async ({ params }) => {
  const path = params['*']
  invariant(path, 'expected path')

  try {
    const data = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: path,
      }),
    )

    if (!data.Body) throw new Response(null, { status: 404, statusText: "Image not found"})
    
    return new Response(data.Body as Blob, {
      headers: {
        type: data.ContentType ?? 'image/jpeg',
        'Cache-Control': 'private, max-age=604800',
      },
    })
  } catch (e) {
    if (isResourceNotFoundException(e)) {
      throw new Response(null, { status: 404, statusText: 'Image not found'})
    } else if (isAccessDeniedException(e)) {
      throw new Response(null, {status: 403, statusText: "Access Denied"})
    }

    throw e
  }
}

function isAccessDeniedException(err: any): err is { code: string } {
  return err?.name === 'AccessDenied'
}

function isResourceNotFoundException(err: any): err is { code: string } {
  return err?.name === 'NoSuchKey'
}
