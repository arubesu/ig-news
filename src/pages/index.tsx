import { Header } from "../components/Header";
import styles from "./home.module.scss";

export default function Home() {
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
            <span>for $9.90 month</span>
          </p>
        </section>

        <img
          src="/images/avatar.svg"
          alt="girl coding"
        />
      </main>
    </>
  )
}
