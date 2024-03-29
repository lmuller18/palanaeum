import clsx from 'clsx'
import { useMemo } from 'react'
import { DateTime } from 'luxon'
import invariant from 'tiny-invariant'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ToRelativeOptions } from 'luxon'

import { useMatches } from '@remix-run/react'

import type { User } from '~/models/users.server'

import type { ThreadedComment } from './models/comments.server'

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find(route => route.id === id),
    [matchingRoutes, id],
  )
  return route?.data
}

function isUser(user: any): user is User {
  return user && typeof user === 'object' && typeof user.email === 'string'
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData('root')
  if (!data || !isUser(data.user)) {
    return undefined
  }
  return data.user
}

export function useUser(): User {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.',
    )
  }
  return maybeUser
}

export function validateEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length > 3 && email.includes('@')
}

export function toLuxonDate(date: Date | string) {
  return DateTime.fromJSDate(new Date(date))
}

export function toRelative(date: Date | string, options?: ToRelativeOptions) {
  if (toLuxonDate(date).diffNow().as('seconds') > -30) return 'just now'
  return toLuxonDate(date).toRelative(options)
}

export function pluralize(singular: string, plural: string, count: number) {
  if (count === 1) return singular
  return plural
}

export async function parseStringFormData(request: Request) {
  let formData = await request.formData()
  let obj: { [key: string]: string | undefined } = {}
  for (let [key, val] of formData.entries()) {
    invariant(typeof val === 'string', `expected string in for ${key}`)
    obj[key] = val
  }
  return obj
}

export function removeEmpty(obj: object) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null))
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export function threadComments(
  commentList: Omit<ThreadedComment, 'replies'>[],
) {
  // create an id --> comment map
  const commentMap = commentList.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.id]: cur,
    }),
    {} as { [key: string]: ThreadedComment },
  )

  commentList.forEach(comment => {
    if (comment != null && comment.parentId != null) {
      const parent = commentMap[comment.parentId]
      parent.replies = [...(parent.replies ?? []), comment]
    }
  })

  return commentList
    .filter(comment => comment.parentId == null)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
