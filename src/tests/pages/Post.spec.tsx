import { screen, render } from "@testing-library/react";
import { getSession } from "next-auth/client";
import { mocked } from "ts-jest/utils";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post =
{
  title: 'post title 1',
  slug: 'post-slug-1',
  content: '<p>post-content-1</p>',
  updatedAt: 'June, 20',
}

jest.mock('../../services/prismic')
jest.mock('next-auth/client')

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText(post.title)).toBeInTheDocument()
    expect(screen.getByText('post-content-1')).toBeInTheDocument()
    expect(screen.getByText(post.updatedAt)).toBeInTheDocument()
  });

  it('redirect user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    })

    const response = await getServerSideProps({
      req: {
        cookies: {},
      },
      params: {
        slug: 'post-slug'
      }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: '/',
          permanent: false,
        }
      })
    )
  });

  it('loads initial data when user has subscription', async () => {
    const getSessionMocked = mocked(getSession)
    const getPrismicClientMocked = mocked(getPrismicClient)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-subscription',
    })

    getPrismicClientMocked.mockResolvedValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{
            type: 'heading',
            text: 'post title'
          }],
          content: [{
            type: 'paragraph',
            text: 'post paragraph'
          }],
        },
        last_publication_date: '2021-07-26'
      })
    })

    const response = await getServerSideProps({
      req: {
        cookies: {},
      },
      params: {
        slug: 'post-slug'
      }
    } as any)

    const expectedPost = {
      slug: 'post-slug',
      title: 'post title',
      content: '<p>post paragraph</p>',
      updatedAt: 'July 25, 2021'
    }

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: expectedPost,
        }
      })
    )
  });
})
