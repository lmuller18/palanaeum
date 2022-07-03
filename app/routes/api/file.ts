// import { redirect } from '@remix-run/node'
import type { ActionFunction } from '@remix-run/node'
// import { unstable_parseMultipartFormData } from '@remix-run/node'

// import { uploadS3Handler } from '~/s3.server'
import { requireUserId } from '~/session.server'

export const action: ActionFunction = async ({ request }) => {
  requireUserId(request)

  // const formData = await unstable_parseMultipartFormData(
  //   request,
  //   uploadS3Handler({ key: 'test/test-file.jpg', filename: 'test-file.jpg' }),
  // )

  // const image = formData.get('image')
  // console.log('key: ', image)

  // return redirect('/upload')
  return null
}
