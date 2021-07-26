import { screen, render } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import Home, { getStaticProps } from "../../pages";
import { stripe } from "../../services/stripe";

jest.mock('next/router')
jest.mock('next-auth/client', () => {
  return {
    useSession: () => [null, false]
  }
})

jest.mock('../../services/stripe')

describe('Home page', () => {
  it('renders correctly', () => {
    render(<Home product={{ productId: 'product-id', amount: 'U$ 9.99' }} />)

    expect(screen.getByText('for U$ 9.99 month')).toBeInTheDocument()
  });

  it('loads initial data', async () => {
    const stripePriceMocked = mocked(stripe.prices.retrieve)

    stripePriceMocked.mockResolvedValueOnce({
      product: 'fake-price-id',
      unit_amount: 999,
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            productId: 'fake-price-id',
            amount: '$9.99',
          }
        }
      })
    )
  });
})
