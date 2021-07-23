import { screen, getByText, render } from "@testing-library/react";
import Home from "../../pages";

jest.mock('next/router')
jest.mock('next-auth/client', () => {
  return {
    useSession: () => [null, false]
  }
})

describe('Home page', () => {
  it('renders correctly', () => {
    render(<Home product={{ productId: 'product-id', amount: 'U$ 9.99' }} />)

    expect(screen.getByText('for U$ 9.99 month')).toBeInTheDocument()
  });
})
