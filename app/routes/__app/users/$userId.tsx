import cuid from 'cuid'
import clsx from 'clsx'
import { notFound } from 'remix-utils'
import invariant from 'tiny-invariant'
import AvatarEditor from 'react-avatar-editor'
import { useRef, useState, useEffect } from 'react'

import {
  json,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from '@remix-run/node'
import {
  MinusSmIcon,
  ArrowSmUpIcon,
  ArrowSmDownIcon,
} from '@heroicons/react/solid'
import {
  FireIcon,
  UsersIcon,
  CameraIcon,
  BookOpenIcon,
  BookmarkIcon,
  PencilAltIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'
import { useFetcher, useLoaderData } from '@remix-run/react'
import type { LoaderArgs, ActionArgs } from '@remix-run/node'

import Modal from '~/components/Modal'
import Button from '~/elements/Button'
import { getErrorMessage } from '~/utils'
import { useToast } from '~/hooks/use-toast'
import Text from '~/elements/Typography/Text'
import SheetModal from '~/components/SheetModal'
import { putObject, removeObject } from '~/s3.server'
import { getClubsByUserId } from '~/models/clubs.server'
import { requireUser, requireUserId } from '~/session.server'
import { updateUser, getUserById, getUserStats } from '~/models/users.server'

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.userId, 'expected userId')

  const userId = await requireUserId(request)

  const user = await getUserById(params.userId)

  if (!user) throw notFound({ message: 'User not found' })

  const [userStats, clubs] = await Promise.all([
    getUserStats(user.id),
    getClubsByUserId(user.id),
  ])

  return json({
    user,
    userStats,
    clubs,
    isProfile: userId === params.userId,
  })
}

type Stat = {
  id: number
  name: string
  stat: number
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
  change: number
  changeType: string
  changeText: string
}

export default function ProfilePage() {
  const { user, userStats, isProfile, clubs } = useLoaderData<typeof loader>()
  const [editing, setEditing] = useState(false)

  return (
    <div>
      <div className="h-36 w-full">
        <HeaderSection
          background={user.background}
          editing={editing}
          username={user.username}
          setEditing={setEditing}
        />
      </div>
      <div className="-mt-14 flex items-center justify-between gap-4 px-4 xs:-mt-16">
        <AvatarSection
          editing={editing}
          avatar={user.avatar}
          username={user.username}
          setEditing={setEditing}
        />

        {isProfile && (
          <div className="mt-8 pt-4">
            {editing ? (
              <Button
                onClick={() => setEditing(false)}
                type="button"
                variant="warning"
              >
                Cancel Edit
              </Button>
            ) : (
              <Button
                onClick={() => setEditing(true)}
                type="button"
                variant="secondary"
              >
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      {isProfile && editing && <ChangePasswordSection />}

      <div className="content-wrapper px-4 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <Text variant="title2">{user.username}</Text>
        </div>

        <div>
          <ClubsSection clubs={clubs} />
          <StatsSection userStats={userStats} />
        </div>
      </div>
    </div>
  )
}

const ChangePasswordSection = () => {
  const fetcher = useFetcher()
  const formRef = useRef<HTMLFormElement>(null)
  const toast = useToast()

  useEffect(() => {
    if (fetcher.type === 'done') {
      if (fetcher.data.ok) {
        toast.toast({ description: 'Password changed successfully' })
        formRef.current?.reset()
      }
    }
  }, [fetcher, toast])

  const actionData = fetcher.data

  return (
    <div className="content-wrapper px-4 pb-4">
      <div className="rounded-lg bg-background-secondary px-4 py-3 shadow sm:px-6 sm:py-4">
        <Text variant="body1">Change Password</Text>

        <fetcher.Form method="post" action="/api/change-password" ref={formRef}>
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-100"
            >
              Current Password
            </label>
            <div className="mt-1">
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                aria-describedby="current-password-error"
                className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {actionData?.errors?.currentPassword && (
              <div className="pt-1 text-red-700" id="current-password-error">
                {actionData.errors.currentPassword}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-100"
            >
              New Password
            </label>
            <div className="mt-1">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                aria-describedby="new-password-error"
                className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {actionData?.errors?.newPassword && (
              <div className="pt-1 text-red-700" id="new-password-error">
                {actionData.errors.newPassword}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-100"
            >
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                aria-describedby="confirm-password-error"
                className="block w-full appearance-none rounded-md border border-background-tertiary bg-background-tertiary px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {actionData?.errors?.confirmPassword && (
              <div className="pt-1 text-red-700" id="confirm-password-error">
                {actionData.errors.confirmPassword}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={fetcher.state === 'submitting'}
            className="mt-2"
          >
            Submit
          </Button>
        </fetcher.Form>
      </div>
    </div>
  )
}

const HeaderSection = ({
  editing,
  background,
  username,
  setEditing,
}: {
  editing: boolean
  background: string | null
  username: string
  setEditing: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const uploadRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files?.[0]) return
    const image = e.target.files[0]
    if (preview) URL.revokeObjectURL(preview)
    const objectUrl = URL.createObjectURL(image)
    setPreview(objectUrl)
  }

  const changePhoto = () => {
    uploadRef.current?.click()
  }

  const clearPhoto = () => {
    if (uploadRef.current) uploadRef.current.value = ''
    setPreview(null)
  }

  const closeModal = () => {
    clearPhoto()
    setEditing(false)
  }

  return (
    <div className="relative h-full w-full">
      <div
        className={clsx('h-full w-full bg-cover bg-center bg-no-repeat')}
        style={{
          backgroundImage: background
            ? `url("${background}")`
            : 'url("https://www.tor.com/wp-content/uploads/2016/08/WoK-wallpaper-iphone-horizontal-960x640.jpg")',
        }}
      />
      {editing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <button
            className="rounded-full bg-black/70 p-[6px]"
            type="button"
            onClick={changePhoto}
          >
            <CameraIcon className="h-6 w-6" />
            <input
              ref={uploadRef}
              onChange={handleImageChange}
              id="image"
              name="image"
              type="file"
              className="sr-only"
            />
          </button>
          <Modal open={!!preview} onClose={closeModal}>
            <div className="flex flex-col pt-3">
              <div className="px-3 pb-4 shadow-sm">
                <div className="relative mt-2 text-center">
                  <span className="font-medium">Upload Header</span>
                  <div className="absolute inset-y-0 right-0">
                    <button
                      className="mr-1 text-blue-500 focus:outline-none"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="p-2">
                  {preview && (
                    <EditUploadSection
                      image={preview}
                      username={username}
                      onSave={closeModal}
                      uploadAction="UPDATE_HEADER"
                    />
                  )}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  )
}

const AvatarSection = ({
  editing,
  avatar,
  username,
  setEditing,
}: {
  editing: boolean
  avatar: string
  username: string
  setEditing: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const uploadRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files?.[0]) return
    const image = e.target.files[0]
    if (preview) URL.revokeObjectURL(preview)
    const objectUrl = URL.createObjectURL(image)
    setPreview(objectUrl)
  }

  const changePhoto = () => {
    uploadRef.current?.click()
  }

  const clearPhoto = () => {
    if (uploadRef.current) uploadRef.current.value = ''
    setPreview(null)
  }

  const closeModal = () => {
    clearPhoto()
    setEditing(false)
  }

  return (
    <div className="relative mb-2 overflow-hidden rounded-full ">
      <img
        src={avatar}
        className="h-28 w-28 rounded-full border-[4px] border-background-primary xs:h-32 xs:w-32"
        alt="user avatar"
      />
      {editing && (
        <div className="absolute inset-[4px] flex items-center justify-center rounded-full bg-black/70">
          <button
            className="rounded-full bg-black/70 p-[6px]"
            type="button"
            onClick={changePhoto}
          >
            <CameraIcon className="h-6 w-6" />
            <input
              ref={uploadRef}
              onChange={handleImageChange}
              id="image"
              name="image"
              type="file"
              className="sr-only"
            />
          </button>
          <Modal open={!!preview} onClose={closeModal}>
            <div className="flex flex-col pt-3">
              <div className="px-3 pb-4 shadow-sm">
                <div className="relative mt-2 text-center">
                  <span className="font-medium">Upload Avatar</span>
                  <div className="absolute inset-y-0 right-0">
                    <button
                      className="mr-1 text-blue-500 focus:outline-none"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="p-2">
                  {preview && (
                    <EditUploadSection
                      image={preview}
                      username={username}
                      onSave={closeModal}
                      uploadAction="UPDATE_AVATAR"
                    />
                  )}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  )
}

const EditUploadSection = ({
  image,
  username,
  uploadAction,
  onSave: onSaveCallback,
}: {
  image: string
  username: string
  uploadAction: 'UPDATE_AVATAR' | 'UPDATE_HEADER'
  onSave: () => void
}) => {
  const [scale, setScale] = useState(1)
  const ref = useRef<AvatarEditor>(null)
  const fetcher = useFetcher()

  const onSave = async () => {
    if (ref.current) {
      const canvas = ref.current
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.getImage().toBlob(resolve, 'image/jpeg'),
      )

      if (!blob) return
      const formData = new FormData()
      formData.append('_action', uploadAction)
      formData.append(
        'image',
        blob,
        `${
          uploadAction === 'UPDATE_AVATAR' ? 'avatar' : 'header'
        }-${username}.jpg`,
      )
      fetcher.submit(formData, {
        method: 'post',
        replace: true,
        encType: 'multipart/form-data',
      })
    }
  }

  useEffect(() => {
    if (fetcher.type === 'done') {
      if (fetcher.data.ok) {
        onSaveCallback()
      }
    }
  }, [fetcher, onSaveCallback])

  const avatarProps = {
    width: 250,
    height: 250,
    borderRadius: 9999,
    scale,
  }

  const headerProps = {
    width: 512,
    height: 144,
    scale,
  }

  return (
    <div className="flex flex-col items-center">
      <AvatarEditor
        image={image}
        {...(uploadAction === 'UPDATE_AVATAR' ? avatarProps : headerProps)}
        ref={ref}
      />

      <input
        type="range"
        value={scale}
        min={1}
        max={2}
        step={0.01}
        onChange={e => setScale(Number(e.target.value))}
      />

      <Button
        type="button"
        onClick={onSave}
        disabled={fetcher.state === 'submitting'}
      >
        Save
      </Button>
    </div>
  )
}

const ClubsSection = ({
  clubs,
}: {
  clubs: Serialized<FuncType<typeof getClubsByUserId>>
}) => {
  return (
    <div>
      <div className="relative mb-4 flex w-full snap-x gap-6 overflow-x-auto rounded-lg bg-background-secondary p-4">
        {clubs.map((c, i) => (
          <CoverCard key={c.id + '-' + i} club={c} />
        ))}
      </div>
    </div>
  )
}

const CoverCard = ({
  club,
}: {
  club: Serialized<FuncType<typeof getClubsByUserId>[number]>
}) => {
  const [open, setOpen] = useState(false)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const stats = [
    {
      id: 1,
      name: 'Chapters',
      stat: 26,
      icon: BookmarkIcon,
    },
    {
      id: 2,
      name: 'Members',
      stat: 4,
      icon: UsersIcon,
    },
    {
      id: 3,
      name: 'Posts',
      stat: 107,

      icon: FireIcon,
    },
    {
      id: 4,
      name: 'Discussions',
      stat: 13,
      icon: PencilAltIcon,
    },
  ]

  return (
    <div className="relative aspect-book w-full max-w-[180px] flex-shrink-0 snap-center overflow-hidden rounded-lg">
      <img
        src={club.image}
        alt={`${club.title} cover`}
        onClick={openModal}
        className="h-full w-full bg-background-primary object-cover shadow-lg"
      />
      <button
        type="button"
        onClick={openModal}
        className="absolute top-2 right-2 rounded-full bg-black/75 p-[2px]"
      >
        <InformationCircleIcon className="h-4 w-4" />
      </button>
      <SheetModal open={open} onClose={closeModal}>
        <div className="flex flex-col overflow-hidden pt-3">
          <div className="px-3 pb-4 shadow-sm">
            <div className="relative mt-2 text-center">
              <span className="font-medium">Club Details</span>
              <div className="absolute inset-y-0 right-0">
                <button
                  type="button"
                  className="mr-1 text-blue-500 focus:outline-none"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <div className="relative py-6">
            <div
              className="absolute top-0 left-0 right-0 -bottom-6 bg-background-primary"
              style={{
                backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(220, 17%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
              }}
            />
            <div className="relative mx-auto block aspect-book w-full max-w-[200px] overflow-hidden rounded-lg shadow-md ">
              <img
                className="h-full w-full object-cover"
                src={club.image}
                alt={`${club.title} cover`}
              />
            </div>
          </div>
          <div className="relative p-4 pt-0">
            <div className="mb-4">
              <Text as="h3" variant="title1" serif>
                {club.title}
              </Text>
              <Text variant="subtitle1" as="p" className="text-right">
                By {club.author}
              </Text>
            </div>

            <dl className="grid grid-cols-1 gap-5">
              {stats.map(item => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-lg bg-background-secondary px-4 py-5 shadow sm:px-6 sm:py-6"
                >
                  <dt>
                    <div className="absolute rounded-md bg-indigo-500 p-3">
                      <item.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-300">
                      {item.name}
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold">{item.stat}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </SheetModal>
    </div>
  )
}

const StatsSection = ({
  userStats,
}: {
  userStats: RequiredFuncType<typeof getUserStats>
}) => {
  const stats: Stat[] = [
    {
      id: 1,
      name: 'Books Read',
      stat: userStats.bookTotal,
      icon: BookOpenIcon,
      change: userStats.book30Days,
      changeType: userStats.book30Days ? 'increase' : 'none',
      changeText: 'in the last 30 days',
    },
    {
      id: 2,
      name: 'Chapters Read',
      stat: userStats.chapterTotal,
      icon: BookmarkIcon,
      change: userStats.chapter30Days,
      changeType: userStats.chapter30Days ? 'increase' : 'none',
      changeText: 'in the last 30 days',
    },
    {
      id: 3,
      name: 'Posts Created',
      stat: userStats.postTotal,
      icon: FireIcon,
      change: userStats.posts30Days,
      changeType: userStats.posts30Days ? 'increase' : 'none',
      changeText: 'in the last 30 days',
    },
    {
      id: 4,
      name: 'Discussions Created',
      stat: userStats.discussionTotal,
      icon: PencilAltIcon,
      change: userStats.discussions30Days,
      changeType: userStats.discussions30Days ? 'increase' : 'none',
      changeText: 'in the last 30 days',
    },
  ]

  return (
    <div>
      <dl className="grid grid-cols-1 gap-5">
        {stats.map(item => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-background-secondary px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-300">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold">{item.stat}</p>
              <p
                className={clsx(
                  item.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600',
                  'ml-2 flex items-baseline text-sm font-semibold',
                )}
              >
                {item.changeType === 'increase' && (
                  <ArrowSmUpIcon
                    className="h-5 w-5 flex-shrink-0 self-start text-green-500"
                    aria-hidden="true"
                  />
                )}

                {item.changeType === 'none' && (
                  <MinusSmIcon
                    className="h-5 w-5 flex-shrink-0 self-start text-gray-500"
                    aria-hidden="true"
                  />
                )}

                {item.changeType === 'decrease' && (
                  <ArrowSmDownIcon
                    className="h-5 w-5 flex-shrink-0 self-start text-red-500"
                    aria-hidden="true"
                  />
                )}

                <span className="sr-only">
                  {item.changeType === 'increase' ? 'Increased' : 'Decreased'}{' '}
                  by
                </span>
                {item.change !== 0 && item.change}
                <span className="ml-1 text-gray-300">{item.changeText}</span>
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export const action = async ({ params, request }: ActionArgs) => {
  const user = await requireUser(request)
  switch (request.method.toLowerCase()) {
    case 'post':
      try {
        const formData = await parseMultipartFormData(
          request,
          composeUploadHandlers(createMemoryUploadHandler()),
        )

        const action = formData.get('_action')

        // required fields
        invariant(
          action != null && typeof action === 'string',
          'action required',
        )

        switch (action) {
          case 'UPDATE_HEADER': {
            const image = formData.get('image')
            invariant(
              image != null && image instanceof File,
              'incorrect image type',
            )
            const prefix = '/reserve/'
            const key = `users/${user.id}/header-${cuid.slug()}.jpeg`
            await putObject({
              key,
              contentType: 'image/jpeg',
              data: image,
              filename: 'header.jpeg',
            })
            await updateUser(user.id, {
              background: `${prefix}${key}`,
            })
            if (user.background?.startsWith(prefix)) {
              const oldKey = user.background.slice(
                user.background.indexOf(prefix) + prefix.length,
              )
              try {
                console.log('removing old background: ', oldKey)
                await removeObject(oldKey)
              } catch (e) {
                console.error('Failure to remove old background')
              }
            }
            return json({ ok: true })
          }
          case 'UPDATE_AVATAR':
            {
              const image = formData.get('image')
              invariant(
                image != null && image instanceof File,
                'incorrect image type',
              )
              const prefix = '/reserve/'
              const key = `users/${user.id}/avatar-${cuid.slug()}.jpeg`
              await putObject({
                key,
                contentType: 'image/jpeg',
                data: image,
                filename: 'avatar.jpeg',
              })
              await updateUser(user.id, {
                avatar: `${prefix}${key}`,
              })
              if (user.avatar.startsWith(prefix)) {
                const oldKey = user.avatar.slice(
                  user.avatar.indexOf(prefix) + prefix.length,
                )
                try {
                  console.log('removing old avatar: ', oldKey)
                  await removeObject(oldKey)
                } catch (e) {
                  console.error('Failure to remove old avatar')
                }
              }
            }
            return json({ ok: true })
          default:
            throw new Response('Bad request', { status: 400 })
        }
      } catch (error) {
        console.error(error)
        return json(
          { error: getErrorMessage(error) },
          {
            status: 500,
          },
        )
      }
    default:
      throw new Response('Invalid method', { status: 405 })
  }
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
