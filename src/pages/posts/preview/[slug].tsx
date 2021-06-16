import { GetStaticProps } from "next"
import { getSession, useSession } from "next-auth/client"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { RichText } from "prismic-dom"
import { useEffect } from "react"
import { getPrismicClient } from "../../../services/prismic"
import styles from "../post.module.scss"

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function PostPreview({ post }: PostPreviewProps) {

  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [session])


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
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }} // needed to keep the post html structure,
          //safe because prismic api prevent scripts
          >
          </div>

          <div className={styles.continueReading}>
            Wanna continue reading ?

            <Link href="/">
              <a href="">Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = await getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {})

  const {
    title,
    content,
  } = response.data;

  const post = {
    slug,
    title: RichText.asText(title),
    content: RichText.asHtml(content?.splice(0, 3)),
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
