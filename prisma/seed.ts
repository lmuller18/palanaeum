import { Club, PrismaClient, User } from '@prisma/client'
import bcrypt from '@node-rs/bcrypt'

const prisma = new PrismaClient()

const createMember = async (user: User, club: Club) => {
  return prisma.member.create({
    data: {
      club: { connect: { id: club.id } },
      user: { connect: { id: user.id } },
      isOwner: club.ownerId === user.id,
    },
  })
}

const createUser = async (
  email: string,
  password: string,
  username: string,
) => {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      email,
      username,
      avatar: `https://i.pravatar.cc/150?u=${username}`,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

const createChapters = async (clubId: string, count = 5) => {
  for (let i = 0; i < count; i++) {
    await prisma.chapter.create({
      data: {
        order: i,
        title: `Chapter ${i + 1}`,
        club: { connect: { id: clubId } },
      },
    })
  }
}

async function seed() {
  // // cleanup the existing database
  const emails = ['rachel@palanaeum.club', 'kevin@palanaeum.club']

  for (const email of emails) {
    try {
      await prisma.user.delete({
        where: { email },
      })
    } catch (e) {
      // no worries if it doesn't exist yet
      console.log('failed deleting', e)
    }
  }

  const user1 = await createUser(
    'rachel@palanaeum.club',
    'blueberry',
    'RachelRox',
  )
  const user2 = await createUser(
    'kevin@palanaeum.club',
    'blueberry',
    'KevinVin',
  )

  const club = await prisma.club.create({
    data: {
      title: 'Book Club',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0',
      owner: { connect: { id: user1.id } },
    },
  })

  await createMember(user1, club)
  await createMember(user2, club)
  await createChapters(club.id, 5)

  console.log(`Database has been seeded. 🌱`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
