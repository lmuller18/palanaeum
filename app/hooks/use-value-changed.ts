import { useRef, useEffect } from 'react'

const useValueChanged = (value: any) => {
  const changedValue = useRef(false)

  useEffect(() => {
    changedValue.current = true
  }, [value])

  return changedValue.current
}

export default useValueChanged
