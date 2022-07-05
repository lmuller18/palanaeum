export {}

declare global {
  type RequiredFuncType<T> = NonNullable<Awaited<ReturnType<T>>>
  type FuncType<T> = Awaited<ReturnType<T>>
  interface Window {
    ENV: { [key: string]: string }
  }
}
