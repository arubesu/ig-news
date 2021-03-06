import styles from './styles.module.scss';
import Head from 'next/head'
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { useSession } from 'next-auth/client';

const ONE_HOUR = 60 * 60;

type Post = {
  title: string
  slug: string
  excerpt: string
  updatedAt: string
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  const [session] = useSession();

  return (
    <>
      <Head>
        <title>
          Ignews | Posts
        </title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map(post => (
              <Link href={
                session?.activeSubscription ?
                  `posts/${post.slug}` :
                  `posts/preview/${post.slug}`
              } key={post.slug}>
                <a>
                  <time>{post.updatedAt}</time>
                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              </Link>
            ))
          }
        </div>

      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: ['posts.title', 'posts.content'],
    pageSize: 100,
  },
  )

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-Br', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    }
  })

  return {
    props: {
      posts,
    },
    revalidate: ONE_HOUR
  }
}

