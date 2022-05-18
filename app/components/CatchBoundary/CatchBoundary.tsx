import { useCatch } from 'remix'

const CatchBoundary = () => {
  const caught = useCatch()

  return (
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
        <div className="py-4">
          <div className="text-center">
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {caught.data ?? 'Page Not Found'}
            </h1>
            {caught.status === 404 && (
              <p className="mt-2 text-base text-gray-300">
                Sorry, we couldn’t find the page you’re looking for.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default CatchBoundary
