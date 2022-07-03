import mime from 'mime-types'
import { Readable } from 'stream'
import { notFound } from 'remix-utils'
import { GetObjectCommand } from '@aws-sdk/client-s3'

import { s3Client } from './storage.server'
import { Upload } from '@aws-sdk/lib-storage'
import type { UploadHandler } from '@remix-run/node'

export async function getObject(key: string) {
  const data = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }),
  )

  if (!data.Body) throw notFound({ message: 'Image not found' })

  return data
}

export const uploadS3Handler = ({
  key,
  filename,
}: {
  key: string
  filename: string
}): UploadHandler => {
  return async ({ data, contentType, name }) => {
    if (name !== 'image') return undefined
    if (!contentType.startsWith('image/')) return undefined
    const ext = mime.extension(contentType)
    if (!ext) return undefined
    const fName = `${filename}.${ext}`
    const fullKey = `${key}.${ext}`
    await putObject({
      filename: fName,
      key: fullKey,
      data,
      contentType,
    })

    return fullKey
  }
}

export async function putObject({
  filename,
  key,
  data,
  contentType,
}: {
  filename: string
  key: string
  data: AsyncIterable<Uint8Array>
  contentType: string
}) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: Readable.from(data),
      ContentType: contentType,
      Metadata: {
        filename: filename,
      },
    },
  })

  const res = await upload.done()
  return res.$metadata
}
