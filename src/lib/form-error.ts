import { createSerializationAdapter } from '@tanstack/react-router'

export class FormError extends Error {
  field: string
  constructor(message: string, field: string) {
    super(message)
    this.name = this.constructor.name
    this.field = field
  }
}

export const formErrorAdapter = createSerializationAdapter({
  key: 'form-error',
  test: (v) => v instanceof FormError,
  toSerializable: ({ message, field }: { message: string; field: string }) => {
    return {
      message,
      field,
    }
  },
  fromSerializable: ({
    message,
    field,
  }: {
    message: string
    field: string
  }) => {
    return new FormError(message, field)
  },
})
