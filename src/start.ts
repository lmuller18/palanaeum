import { createStart } from '@tanstack/react-start'
import { formErrorAdapter } from './lib/form-error'

export const startInstance = createStart(() => {
  return {
    defaultSsr: true,
    serializationAdapters: [formErrorAdapter],
  }
})
