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

test('active link should render', () => {
  const { getByText } = render(
    <ActiveLink href="/" activeClassName="active">
      <a>Test </a>
    </ActiveLink>
  )
  expect(getByText('Test')).toBeInTheDocument()
})
