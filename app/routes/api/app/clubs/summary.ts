import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'

import { requireUserId } from '~/jwt.server'
import { getClubListDetails } from '~/models/clubs.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const { currentlyReading, previouslyRead } = await getClubListDetails(userId)

  return json({
    currentlyReading,
    previouslyRead,
  })
}
