import Button from '~/elements/Button'

import Container from './Container'

const ButtonDemo = () => (
  <Container title="Buttons">
    Size
    <div className="flex w-full flex-col items-start gap-2">
      xs
      <Button size="xs">Button</Button>
      sm
      <Button size="sm">Button</Button>
      base
      <Button size="base">Button</Button>
      lg
      <Button size="lg">Button</Button>
      xl
      <Button size="xl">Button</Button>
    </div>
    Variants
    <div className="flex w-full flex-col items-start gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  </Container>
)

export default ButtonDemo
