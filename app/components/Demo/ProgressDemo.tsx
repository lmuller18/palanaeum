import Progress from '~/elements/Progress'
import Container from './Container'

const ProgressDemo = () => (
  <Container title="Progress">
    Size
    <div className="flex w-full flex-col items-start gap-2">
      sm
      <Progress value={25} size="sm" />
      md
      <Progress value={50} size="md" />
      lg
      <Progress value={75} size="lg" />
    </div>
    Rounded
    <div className="flex w-full flex-col items-start gap-2">
      none
      <Progress value={50} size="lg" rounded="none" />
      sm
      <Progress value={50} size="lg" rounded="sm" />
      md
      <Progress value={50} size="lg" rounded="md" />
      lg
      <Progress value={50} size="lg" rounded="lg" />
      full
      <Progress value={50} size="lg" rounded="full" />
    </div>
    <div className="flex w-full flex-col items-start gap-2">
      Amber
      <Progress value={50} color="amber" />
      Blue
      <Progress value={50} color="blue" />
      Cyan
      <Progress value={50} color="cyan" />
      Emerald
      <Progress value={50} color="emerald" />
      Fuchsia
      <Progress value={50} color="fuchsia" />
      Green
      <Progress value={50} color="green" />
      Indigo
      <Progress value={50} color="indigo" />
      Lime
      <Progress value={50} color="lime" />
      Orange
      <Progress value={50} color="orange" />
      Pink
      <Progress value={50} color="pink" />
      Purple
      <Progress value={50} color="purple" />
      Red
      <Progress value={50} color="red" />
      Rose
      <Progress value={50} color="rose" />
      Sky
      <Progress value={50} color="sky" />
      Teal
      <Progress value={50} color="teal" />
      Violet
      <Progress value={50} color="violet" />
      Yellow
      <Progress value={50} color="yellow" />
    </div>
  </Container>
)

export default ProgressDemo
