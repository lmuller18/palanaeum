import { redirect } from '@remix-run/node'
import type { ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'

import { uploadS3Handler } from '~/s3.server'

export const action: ActionFunction = async ({ request }) => {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadS3Handler({ key: 'test/test-file.jpg', filename: 'test-file.jpg' }),
  )

  const image = formData.get('image')
  console.log('key: ', image)

  return redirect('/upload')
}
