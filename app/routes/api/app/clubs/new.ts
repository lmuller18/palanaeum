import { z } from 'zod'
import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import { requireUserId } from '~/jwt.server'
import { createClub } from '~/models/clubs.server'

const NewClubSchema = z.object({
  title: z.string(),
  author: z.string(),
  image: z.string(),
  chapters: z.array(
    z.object({
      order: z.number(),
      title: z.string(),
    }),
  ),
})

type NewClub = z.infer<typeof NewClubSchema>

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)

  let newClub: NewClub | undefined

  try {
    const body = await request.json()
    newClub = await NewClubSchema.parseAsync(body)
  } catch (error) {
    let err = error
    if (err instanceof z.ZodError) {
      err = err.issues.map(e => ({ path: e.path[0], message: e.message }))
    }
    throw json({ status: 'Invalid body', error: err }, { status: 409 })
  }
  const image = newClub.image.startsWith('/soulcast')
    ? newClub.image
    : `/soulcast/${encodeURI(newClub.image)}`
  const club = await createClub({ ...newClub, image, userId })
  return json(club)
}
