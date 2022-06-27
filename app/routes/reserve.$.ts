import invariant from 'tiny-invariant'
import { Response } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { forbidden, notFound, serverError } from 'remix-utils'

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

    if (!data.Body) throw notFound({ message: 'Image not found' })

    return new Response(data.Body, {
      headers: {
        type: data.ContentType ?? 'image/jpeg',
      },
    })
  } catch (e) {
    if (isResourceNotFoundException(e)) {
      throw notFound({ message: 'Image not found' })
    } else if (isAccessDeniedException(e)) {
      throw forbidden({ message: 'Access Denied' })
    }

    throw serverError({ error: e })
  }
}

function isAccessDeniedException(err: any): err is { code: string } {
  return err?.name === 'AccessDenied'
}

function isResourceNotFoundException(err: any): err is { code: string } {
  return err?.name === 'NoSuchKey'
}
