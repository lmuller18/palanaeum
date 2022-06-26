import { useRef, useEffect } from 'react'

const useValueChanged = (value: any) => {
  const changedValue = useRef(false)

  useEffect(() => {
    console.log('useValueChanged.ts:7')
    changedValue.current = true
  }, [value])

  return changedValue.current
}

export default useValueChanged
