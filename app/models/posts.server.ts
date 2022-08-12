import cuid from 'cuid'
import { prisma } from '~/db.server'
import { putObject } from '~/s3.server'

export async function getTopPostByClub(clubId: string) {
  const dbPost = await prisma.post.findFirst({
    where: { chapter: { clubId }, parentId: null },
    select: {
      id: true,
      content: true,
      image: true,
      context: true,
      createdAt: true,
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
      member: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    take: 1,
    orderBy: [
      {
        replies: {
          _count: 'desc',
        },
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  if (!dbPost) return null

  const post = {
    user: {
      id: dbPost.member.user.id,
      avatar: dbPost.member.user.avatar,
      username: dbPost.member.user.username,
    },
    chapter: {
      id: dbPost.chapter.id,
      title: dbPost.chapter.title,
    },
    post: {
      id: dbPost.id,
      content: dbPost.content,
      image: dbPost.image,
      context: dbPost.context,
      replies: dbPost._count.replies,
      createdAt: dbPost.createdAt,
    },
  }

  return post
}

export async function getTopPostByChapter(chapterId: string) {
  const dbPost = await prisma.post.findFirst({
    where: { chapterId, parentId: null },
    select: {
      id: true,
      content: true,
      image: true,
      createdAt: true,
      context: true,
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
      member: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    take: 1,
    orderBy: [
      {
        replies: {
          _count: 'desc',
        },
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  if (!dbPost) return null

  const post = {
    user: {
      id: dbPost.member.user.id,
      avatar: dbPost.member.user.avatar,
      username: dbPost.member.user.username,
    },
    chapter: {
      id: dbPost.chapter.id,
      title: dbPost.chapter.title,
    },
    post: {
      id: dbPost.id,
      content: dbPost.content,
      image: dbPost.image,
      context: dbPost.context,
      replies: dbPost._count.replies,
      createdAt: dbPost.createdAt,
    },
  }

  return post
}

export async function getPostsByChapter(
  clubId: string,
  chapterId: string,
  userId: string,
) {
  const dbPosts = await prisma.post.findMany({
    where: {
      parentId: null,
      chapterId,
      chapter: {
        clubId,
        club: {
          members: { some: { userId, removed: false } },
        },
      },
    },
    select: {
      id: true,
      content: true,
      image: true,
      context: true,
      createdAt: true,
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
      member: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const posts = dbPosts.map(dbPost => ({
    user: {
      id: dbPost.member.user.id,
      avatar: dbPost.member.user.avatar,
      username: dbPost.member.user.username,
    },
    chapter: {
      id: dbPost.chapter.id,
      title: dbPost.chapter.title,
    },
    post: {
      id: dbPost.id,
      content: dbPost.content,
      image: dbPost.image,
      context: dbPost.context,
      replies: dbPost._count.replies,
      createdAt: dbPost.createdAt,
    },
  }))

  return posts
}

export async function getPosts(
  clubId: string,
  userId: string,
  chapterId: string | null,
  sortOrder?: 'chapter' | 'time',
) {
  const sort = sortOrder ?? 'time'
  let where = {}

  if (chapterId) {
    where = {
      parentId: null,
      chapterId,
      chapter: {
        clubId,
        club: {
          members: { some: { userId, removed: false } },
        },
      },
    }
  } else {
    const readChapters = await prisma.chapter.findMany({
      where: { clubId, progress: { some: { member: { userId } } } },
      select: {
        id: true,
      },
    })

    where = readChapters
      ? {
          OR: [
            { member: { userId } },
            { chapterId: { in: readChapters.map(c => c.id) } },
          ],
          parentId: null,
          chapter: { clubId },
        }
      : {
          parentId: null,
          chapter: {
            clubId,
            club: {
              members: { some: { userId, removed: false } },
            },
          },
        }
  }

  const dbPosts = await prisma.post.findMany({
    where,
    select: {
      id: true,
      content: true,
      image: true,
      context: true,
      createdAt: true,
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
      member: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy:
      sort === 'chapter'
        ? [
            {
              chapter: {
                order: 'desc',
              },
            },
            {
              createdAt: 'desc',
            },
          ]
        : {
            createdAt: 'desc',
          },
  })

  const posts = dbPosts.map(dbPost => ({
    user: {
      id: dbPost.member.user.id,
      avatar: dbPost.member.user.avatar,
      username: dbPost.member.user.username,
    },
    chapter: {
      id: dbPost.chapter.id,
      title: dbPost.chapter.title,
    },
    post: {
      id: dbPost.id,
      content: dbPost.content,
      image: dbPost.image,
      context: dbPost.context,
      replies: dbPost._count.replies,
      createdAt: dbPost.createdAt,
    },
  }))

  return posts
}

export async function createPost({
  chapterId,
  content,
  image,
  context,
  parentId,
  rootId,
  memberId,
}: {
  chapterId: string
  content: string
  memberId: string
  image: File | null
  context: string | null
  parentId: string | null
  rootId: string | null
}) {
  const id = cuid()
  const imgId = cuid()
  const imgKey = image ? `posts/${id}/${imgId}` : null

  if (image && imgKey) {
    await putObject({
      contentType: image.type,
      data: image,
      filename: imgId,
      key: imgKey,
    })
  }

  return prisma.post.create({
    data: {
      chapterId,
      content,
      image: image ? `/reserve/${imgKey}` : null,
      context,
      parentId,
      rootId,
      memberId,
    },
    select: {
      id: true,
      member: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          club: {
            select: {
              id: true,
              title: true,
              image: true,
            },
          },
        },
      },
      parent: {
        select: {
          id: true,
          member: {
            select: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  })
}
