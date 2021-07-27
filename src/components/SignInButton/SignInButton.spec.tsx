import { render, screen, fireEvent } from '@testing-library/react'
import { mocked } from "ts-jest/utils";
import { useSession, signOut, signIn } from "next-auth/client";
import { SignInButton } from '.'

jest.mock('next-auth/client')

describe('SignInButton Component', () => {

  it('renders correctly when user is not signed in', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(
      <SignInButton />
    )
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument()
  })

  it('renders correctly when user is signed in', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([{
      user: {
        name: 'John Doe',
        email: 'john@doe.com',
      }
    }, true])

    render(
      <SignInButton />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('allow to sign out when user is logged in', () => {
    const useSessionMocked = mocked(useSession)

    const user = {
      name: 'John Doe',
      email: 'john@doe.com',
    }

    useSessionMocked.mockReturnValueOnce([{
      user,
    }, true])

    const signOutMocked = mocked(signOut);

    render(
      <SignInButton />
    )

    const signOutButton = screen.getByRole('button', {
      name: new RegExp(user.name)
    })

    fireEvent.click(signOutButton)
    expect(signOutMocked).toBeCalled()
  })

  it('allow to sign in when user is logged out', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    const signInMocked = mocked(signIn);

    render(
      <SignInButton />
    )

    const signInButton = screen.getByRole('button', {
      name: /Sign in with GitHub/i
    })

    fireEvent.click(signInButton)
    expect(signInMocked).toBeCalled()
  })
})

