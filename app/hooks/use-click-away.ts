import { useRef, useEffect, useCallback } from 'react'

function useClickAway<T extends HTMLElement>(callback: Function) {
  const ref = useRef<T>(null)

  const handleDocumentClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node

      if (ref.current?.contains(target)) {
        return
      }

      callback()
    },
    [callback],
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
    }
  }, [handleDocumentClick])

  return ref
}

export default useClickAway
