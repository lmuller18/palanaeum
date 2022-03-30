import Badge from '~/elements/Badge'
import Container from './Container'

const BadgeDemo = () => (
  <Container title="Badge">
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge rounded="none">Default</Badge>
        <Badge rounded="none">None</Badge>
        <Badge rounded="sm">Small</Badge>
        <Badge rounded="md">Medium</Badge>
        <Badge rounded="lg">Large</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="default">Default</Badge>
        <Badge color="amber">Amber</Badge>
        <Badge color="blue">Blue</Badge>
        <Badge color="cyan">Cyan</Badge>
        <Badge color="emerald">Emerald</Badge>
        <Badge color="fuchsia">Fuchsia</Badge>
        <Badge color="green">Green</Badge>
        <Badge color="indigo">Indigo</Badge>
        <Badge color="lime">Lime</Badge>
        <Badge color="orange">Orange</Badge>
        <Badge color="pink">Pink</Badge>
        <Badge color="purple">Purple</Badge>
        <Badge color="red">Red</Badge>
        <Badge color="rose">Rose</Badge>
        <Badge color="sky">Sky</Badge>
        <Badge color="teal">Teal</Badge>
        <Badge color="violet">Violet</Badge>
        <Badge color="yellow">Yellow</Badge>
      </div>
    </div>
  </Container>
)

export default BadgeDemo
