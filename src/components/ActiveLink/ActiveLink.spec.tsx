import { render } from '@testing-library/react'
import { ActiveLink } from '.'

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      }
    }
  }
})

describe('Active Link Component', () => {

  it('renders correctly', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Test </a>
      </ActiveLink>
    )
    expect(getByText('Test')).toBeInTheDocument()
  })

  it('receive active class when href is equal to the current path', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Test </a>
      </ActiveLink>
    )
    expect(getByText('Test')).toHaveClass('active')
  })

  it('not receive active class when href is different to the current path', () => {
    const { getByText } = render(
      <ActiveLink href="/other" activeClassName="active">
        <a>Test </a>
      </ActiveLink>
    )
    expect(getByText('Test')).not.toHaveClass('active')
  })

})

