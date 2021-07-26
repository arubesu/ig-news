import { screen, render } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import Posts, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";

const posts = [
  {
    title: 'post title 1',
    slug: 'post-slug-1',
    excerpt: 'post excerpt 1',
    updatedAt: 'June, 20',
  },
]

jest.mock('../../services/prismic')

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText(posts[0].title)).toBeInTheDocument()
    expect(screen.getByText(posts[0].excerpt)).toBeInTheDocument()
    expect(screen.getByText(posts[0].updatedAt)).toBeInTheDocument()
  });

  it('loads initial data', async () => {

    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'post-uuid',
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
            last_publication_date: '2021-07-26',
          }
        ]
      }),
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'post-uuid',
            title: 'post title',
            excerpt: 'post paragraph',
            updatedAt: 'July 25, 2021',
          }]
        }
      })
    )
  });
})
