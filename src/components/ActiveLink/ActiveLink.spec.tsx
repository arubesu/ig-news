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

  test('active link should render', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Test </a>
      </ActiveLink>
    )
    expect(getByText('Test')).toBeInTheDocument()
  })

  test('active link should receive active class when href is equal to the current path', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Test </a>
      </ActiveLink>
    )
    expect(getByText('Test')).toHaveClass('active')
  })

  test('active link should not receive active class when href is different to the current path', () => {
    const { getByText } = render(
      <ActiveLink href="/other" activeClassName="active">
        <a>Test </a>
      </ActiveLink>
    )
    expect(getByText('Test')).not.toHaveClass('active')
  })

})

