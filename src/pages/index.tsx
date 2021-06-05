import { GetStaticProps } from "next";
import { Header } from "../components/Header";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";
import styles from "./home.module.scss";

const DAILY = 60 * 60 * 24;

interface Product {
  productId: string;
  amount: string;
}
interface HomeProps {
  product: Product;
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Header />
      <main className={styles.container}>
        <section className={styles.contentContainer}>
          <p>👏 Hey, Welcome </p>
          <h1>News about <br />
            the  <span>React</span> world
          </h1>
          <br />
          <p>Get access to all the publications
            <br />
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton />

        </section>

        <img
          src="/images/avatar.svg"
          alt="girl coding"
        />
      </main>
    </>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const {
    product,
    unit_amount,
  } = await stripe.prices.retrieve('price_1Iz6VtFHlQfl1xDpAPFy9ILk');

  return {
    props: {
      product: {
        productId: product,
        amount: Intl.NumberFormat(
          'en-US',
          {
            style: 'currency',
            currency: 'USD'
          }
        ).format(unit_amount / 100)
      },
    },
    revalidate: DAILY,
  }
}
