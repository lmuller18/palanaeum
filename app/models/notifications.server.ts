import { prisma } from '~/db.server'
import { sendPush } from '~/utils/notifications.server'
import { createNotification } from '~/utils/notifications.utils'

import type { createPost } from './posts.server'
import type { createInvite } from './invites.server'
import type { createDiscussion } from './discussions.server'

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

export async function notifyClubCompletion(
  chapterId: string,
  memberId: string,
) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } })
  if (!chapter) return

  const [lastChapter, user, club] = await Promise.all([
    prisma.chapter.findFirst({
      where: { clubId: chapter.clubId },
      orderBy: { order: 'desc' },
    }),
    prisma.user.findFirst({
      where: { members: { some: { id: memberId } } },
    }),
    prisma.club.findUnique({ where: { id: chapter.clubId } }),
  ])

  if (!lastChapter || !club || !user || lastChapter.id !== chapter.id) return

  const [incompleteUsers, completedUsers] = await Promise.all([
    prisma.member.findMany({
      where: {
        removed: false,
        clubId: club.id,
        id: { not: memberId },
        progress: { none: { chapterId } },
      },
      select: { userId: true },
    }),
    prisma.member.findMany({
      where: {
        removed: false,
        clubId: club.id,
        id: { not: memberId },
        progress: { some: { chapterId } },
      },
      select: { userId: true },
    }),
  ])

  const [completedSubscriptions, incompleteSubscriptions] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: { in: completedUsers.map(u => u.userId) } },
    }),
    prisma.subscription.findMany({
      where: { userId: { in: incompleteUsers.map(u => u.userId) } },
    }),
  ])

  const clubUrl = `/clubs/${club.id}`

  const createClubNotification = (completed: boolean) =>
    createNotification({
      title: `${user.username} just completed ${club.title}`,
      body: `${user.username} just wrapped up reading ${club.title} by ${
        club.author
      }. ${
        completed
          ? "They're ready to join you in the conversation"
          : "Don't fall behind now!"
      }`,
      icon: user.avatar,
      image: club.image,
      data: {
        options: {
          action: 'navigate',
          url: clubUrl,
        },
      },
    })

  const notifications: Promise<any>[] = []
  completedSubscriptions.forEach(subscription => {
    notifications.push(sendPush(subscription, createClubNotification(true)))
  })
  incompleteSubscriptions.forEach(subscription => {
    notifications.push(sendPush(subscription, createClubNotification(false)))
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

export async function notifyNewPost(
  post: FuncType<typeof createPost>,
  postUrl: string,
) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      User: {
        members: {
          some: {
            removed: false,
            id: {
              not: post.member.id,
            },
            progress: {
              some: {
                chapterId: post.chapter.id,
              },
            },
          },
        },
      },
    },
  })

  const notification = createNotification({
    title: 'New Post',
    body: `${post.member.user.username} posted in ${post.chapter.title}`,
    icon: post.member.user.avatar,
    image: post.chapter.club.image,
    data: {
      options: {
        action: 'navigate',
        url: postUrl,
      },
    },
  })

  const notifications: Promise<any>[] = []
  subscriptions.forEach(subscription => {
    notifications.push(sendPush(subscription, notification))
  })
  return Promise.allSettled(notifications)
}

export async function notifyPostReply(
  post: FuncType<typeof createPost>,
  parentUserId: string,
  postUrl: string,
) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: parentUserId,
    },
  })

  const notification = createNotification({
    title: 'You received new replies',
    body: `${post.member.user.username} responded to your ${post.chapter.title} post`,
    icon: post.member.user.avatar,
    image: post.chapter.club.image,
    data: {
      options: {
        action: 'navigate',
        url: postUrl,
      },
    },
  })

  const notifications: Promise<any>[] = []
  subscriptions.forEach(subscription => {
    notifications.push(sendPush(subscription, notification))
  })
  return Promise.allSettled(notifications)
}
