import { signIn, useSession } from 'next-auth/client';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

export const SubscribeButton: React.FC = () => {
  const [session] = useSession();

  const handleSubscribe = async () => {
    if (!session) {
      signIn('github')
      return;
    }

    try {
      const response = await api.post('/subscribe');

      const { sessionId } = response.data;

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      // TODO: toast errors
    }
  }

  return (
    <button
      className={styles.subscribeButton}
      onClick={handleSubscribe}>
      Subcribe now
    </button>
  )
}
