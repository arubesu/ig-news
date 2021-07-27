import { screen, render } from "@testing-library/react";
import { getSession, useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { mocked } from "ts-jest/utils";
import PostPreview, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post =
{
  title: 'post title 1',
  slug: 'post-slug-1',
  content: '<p>post-content-1</p>',
  updatedAt: 'July 25, 2021',
}

jest.mock('../../services/prismic')
jest.mock('next-auth/client')
jest.mock('next/router')

describe('Post Preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession)
    useSessionMocked.mockReturnValueOnce([null, false])
    render(<PostPreview post={post} />)

    expect(screen.getByText(post.title)).toBeInTheDocument()
    expect(screen.getByText('post-content-1')).toBeInTheDocument()
    expect(screen.getByText(post.updatedAt)).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reading ?')).toBeInTheDocument()
  });

  it('redirect to full post page when user has an active subscription', async () => {
    const useSessionMocked = mocked(useSession)
    const useRouterMocked = mocked(useRouter)

    useSessionMocked.mockReturnValueOnce([{
      activeSubscription: 'fake-active-subscription',
    }] as any)

    const mockedPush = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: mockedPush,
    } as any)

    render(<PostPreview post={post} />)

    expect(mockedPush).toBeCalledWith(`/posts/${post.slug}`);
  });
})
