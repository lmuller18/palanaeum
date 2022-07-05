import { prisma } from '~/db.server'
import type { createInvite } from './invites.server'
import { sendPush } from '~/utils/notifications.server'
import type { createDiscussion } from './discussions.server'
import { createNotification } from '~/utils/notifications.utils'

export async function notifyNewInvite(invite: FuncType<typeof createInvite>) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: invite.inviteeId,
    },
  })

  const notification = createNotification({
    title: `New Club Invite: ${invite.club.title}`,
    body: `${invite.inviter.username} invited you to read ${invite.club.title} by ${invite.club.author}`,
    icon: invite.inviter.avatar,
    image: invite.club.image,
    data: {
      options: {
        action: 'navigate',
        url: `/invites`,
      },
    },
  })

  const notifications: Promise<any>[] = []
  subscriptions.forEach(subscription => {
    notifications.push(sendPush(subscription, notification))
  })
  return Promise.allSettled(notifications)
}

export async function notifyNewDiscussion(
  discussion: FuncType<typeof createDiscussion>,
  discussionUrl: string,
) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      User: {
        members: {
          some: {
            removed: false,
            id: {
              not: discussion.member.id,
            },
            progress: {
              some: {
                chapterId: discussion.chapter.id,
              },
            },
          },
        },
      },
    },
  })

  const notification = createNotification({
    title: `New Discussion: ${discussion.title}`,
    body: `${discussion.member.user.username} posted a new discussion in ${discussion.chapter.title}`,
    icon: discussion.member.user.avatar,
    image: discussion.image ?? discussion.chapter.club.image,
    data: {
      options: {
        action: 'navigate',
        url: discussionUrl,
      },
    },
  })

  const notifications: Promise<any>[] = []
  subscriptions.forEach(subscription => {
    notifications.push(sendPush(subscription, notification))
  })
  return Promise.allSettled(notifications)
}