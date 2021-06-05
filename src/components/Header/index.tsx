import React from 'react';
import Image from 'next/image'
import styles from './styles.module.scss';
import { SignInButton } from '../SignInButton';

export const Header: React.FC = () => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Image
          src="/images/logo.svg"
          height={30}
          width={100}
        />

        <nav>
          <a className={styles.active}>Home</a>
          <a>Posts</a>
        </nav>
        <SignInButton />
      </div>

    </header>
  )
}

