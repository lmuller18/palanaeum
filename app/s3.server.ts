import { Readable } from 'stream'

import mime from 'mime-types'
import { notFound } from 'remix-utils'

import { Upload } from '@aws-sdk/lib-storage'
import type { UploadHandler } from '@remix-run/node'
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

import { s3Client } from './storage.server'

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
  data: AsyncIterable<Uint8Array> | File
  contentType: string
}) {
  let stream

  if (!(data instanceof File)) {
    stream = Readable.from(data)
  }

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: data instanceof File ? data : stream,
      ContentType: contentType,
      Metadata: {
        filename: filename,
      },
    },
  })

  const res = await upload.done()

  if (stream) stream.destroy()

  return res.$metadata
}

export async function removeObject(key: string) {
  return s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }),
  )
}
