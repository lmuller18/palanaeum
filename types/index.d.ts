export {}

declare global {
  type RequiredFuncType<T> = NonNullable<Awaited<ReturnType<T>>>
  type FuncType<T> = Awaited<ReturnType<T>>
  type Serialized<T> = {
    [P in keyof T]: T[P] extends Date ? string : Serialized<T[P]>
  }
  interface Window {
    ENV: { [key: string]: string }
  }
}
