import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head"
import { RichText } from "prismic-dom"
import { getPrismicClient } from "../../services/prismic"
import styles from "./post.module.scss"

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title} | ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }} // needed to keep the post html structure,
          //safe because prismic api prevent scripts
          >
          </div>
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req });
  const { slug } = params;

  if (!session.activeSubscription) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const prismic = await getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {})

  const {
    title,
    content,
  } = response.data;

  const post = {
    slug,
    title: RichText.asText(title),
    content: RichText.asHtml(content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('en-US',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
  }

  return {
    props: {
      post,
    }
  }
}
