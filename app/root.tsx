import { QueryClient, QueryClientProvider } from 'react-query'

import type { LinksFunction, LoaderFunction } from '@remix-run/node'
import {
  Meta,
  Links,
  Outlet,
  Scripts,
  LiveReload,
  useLoaderData,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react'
import { json } from '@remix-run/node'
import { ClipboardCopyIcon } from '@heroicons/react/outline'

import tailwindStylesheetUrl from '~/tailwind.css'

import PwaMeta from './pwa-meta'
import { removeEmpty } from './utils'
import TextLink from './elements/TextLink'
import { Toaster } from './components/Toaster'
import { getUser, prepareUserSession } from './session.server'
import { registerWebPush } from './utils/notifications.server'

export const links: LinksFunction = () => {
  return [
    { rel: 'manifest', href: '/site.webmanifest' },
    {
      rel: 'preconnect',
      href: 'https://cdn.fontshare.com',
      crossOrigin: 'anonymous',
    },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      href: 'https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap',
      rel: 'stylesheet',
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&display=swap',
      rel: 'stylesheet',
    },
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
  ]
}

export function meta() {
  return [
    { charset: 'utf-8' },
    { title: 'Palanaeum' },
    {
      viewport:
        'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
    },
    { 'apple-mobile-web-app-status-bar-style': 'black-translucent' },
  ]
}

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>
  ENV: { [key: string]: string }
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)

  registerWebPush()

  const ENV = removeEmpty({
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  })

  if (user) {
    const headers = await prepareUserSession({ request, userId: user.id })
    return json<LoaderData>({ user, ENV }, { headers })
  }

  return json<LoaderData>({ user, ENV })
}

const queryClient = new QueryClient()

export default function App() {
  const data = useLoaderData() as LoaderData

  return (
    <html lang="en" className="dark antialiased">
      <head>
        <Meta />
        <Links />
        <PwaMeta />
      </head>
      <QueryClientProvider client={queryClient}>
        <body>
          <div id="app" className="bg-background-primary">
            <Outlet />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
              }}
            />
            <Toaster />
          </div>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </QueryClientProvider>
    </html>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  const isError = (e: unknown): e is { message: string; stack: any } => {
    return e != null && typeof e === 'object' && Object.hasOwn(e, 'message')
  }

  return (
    <html lang="en" className="dark h-screen">
      <head>
        <Meta />
        <Links />
        <PwaMeta />
      </head>
      <body className="h-full">
        <div id="app" className="h-full bg-background-primary">
          <div className="flex min-h-full flex-col pt-16 pb-12">
            <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-4 sm:px-6 lg:px-8">
              <div className="flex flex-shrink-0 justify-center">
                <a href="/" className="inline-flex">
                  <span className="sr-only">Palanaeum</span>
                  <img
                    className="h-24 w-auto overflow-hidden rounded-full"
                    src="/images/gradient-logo-192.png"
                    alt=""
                  />
                </a>
              </div>
              {isRouteErrorResponse(error) ? (
                <div className="py-4">
                  <div className="text-center">
                    <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                      {error.data ?? 'Page Not Found'}
                    </h1>

                    {error.status === 404 && (
                      <p className="mt-2 text-base text-gray-300">
                        Sorry, we couldn’t find the page you’re looking for.
                      </p>
                    )}

                    <TextLink color="blue" to="/" className="mt-4">
                      Return Home
                    </TextLink>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                      Something went wrong
                    </h1>

                    {isError(error) && (
                      <>
                        <p className="text-left font-mono text-lg leading-none">
                          {error.message}
                        </p>

                        {error.stack && (
                          <div className="relative mt-4 max-h-96 overflow-y-scroll rounded-lg bg-background-secondary p-2">
                            <p className="text-left font-mono text-lg text-red-400">
                              {JSON.stringify(error.stack, null, 2)}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                navigator.clipboard.writeText(error.stack!)
                              }
                              className="absolute top-0 right-0 mt-1 mr-1 rounded-sm bg-black/40 p-1"
                            >
                              <ClipboardCopyIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    <TextLink
                      color="blue"
                      to="/"
                      className="mt-4 block text-center"
                    >
                      Return Home
                    </TextLink>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
