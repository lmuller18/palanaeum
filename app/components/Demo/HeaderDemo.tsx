import Header from '~/elements/Typography/Header'

import Container from './Container'

const HeaderDemo = () => (
  <Container title="Headers">
    <Header size="h1">H1 Primary</Header>
    <Header size="h2">H2 Primary</Header>
    <Header size="h3">H3 Primary</Header>
    <Header size="h4">H4 Primary</Header>
    <Header size="h5">H5 Primary</Header>
    <Header size="h6">H6 Primary</Header>

    <Header size="h1" variant="secondary">
      H1 Secondary
    </Header>
    <Header size="h2" variant="secondary">
      H2 Secondary
    </Header>
    <Header size="h3" variant="secondary">
      H3 Secondary
    </Header>
    <Header size="h4" variant="secondary">
      H4 Secondary
    </Header>
    <Header size="h5" variant="secondary">
      H5 Secondary
    </Header>
    <Header size="h6" variant="secondary">
      H6 Secondary
    </Header>
  </Container>
)

export default HeaderDemo
