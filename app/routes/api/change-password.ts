import type { ActionArgs } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { requireUserId } from '~/session.server'
import { parseStringFormData } from '~/utils'
import { json } from '@remix-run/node'
import { getPassword, updatePassword } from '~/models/users.server'
import bcrypt from '@node-rs/bcrypt'

interface ActionData {
  errors: {
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request)

  const formData = await parseStringFormData(request)

  invariant(formData.currentPassword, 'expected current password')
  invariant(formData.newPassword, 'expected new password')
  invariant(formData.confirmPassword, 'expected confirm password')

  if (typeof formData.newPassword !== 'string') {
    return json<ActionData>(
      { errors: { newPassword: 'Password is required' } },
      { status: 400 },
    )
  }

  if (formData.newPassword.length < 8) {
    return json<ActionData>(
      { errors: { newPassword: 'Password is too short' } },
      { status: 400 },
    )
  }

  if (formData.newPassword !== formData.confirmPassword) {
    return json(
      { errors: { confirmPassword: 'Passwords do not match' } },
      { status: 400 },
    )
  }

  const currentHashedPassword = await getPassword(userId)

  if (!currentHashedPassword) {
    return json(
      { errors: { currentPassword: 'Something went wrong' } },
      { status: 500 },
    )
  }

  const isMatch = await bcrypt.compare(
    formData.currentPassword,
    currentHashedPassword.hash,
  )
  if (!isMatch) {
    return json(
      { errors: { currentPassword: 'Current password is incorrect' } },
      { status: 400 },
    )
  }

  await updatePassword(userId, formData.newPassword)

  return json({ ok: true })
}

export const loader = () => new Response('Invalid method', { status: 405 })
