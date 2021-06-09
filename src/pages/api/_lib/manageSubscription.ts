import { query as q } from "faunadb";
import { faunadbClient } from "../../../services/fauna";
import { stripe } from "../../../services/stripe"

interface saveSubscriptionParameters {
  subscriptionId: string,
  customerId: string,
}

export const saveSubscription = async ({ subscriptionId, customerId }: saveSubscriptionParameters) => {

  const userRef = await faunadbClient.query(
    q.Select(
      'ref',
      q.Get(
        q.Match(
          q.Index('user_by_stripeCustomerId'),
          customerId
        ))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
  }

  await faunadbClient.query(
    q.Create(
      q.Collection('subscriptions'),
      {
        data: subscriptionData,
      }
    )
  );

}
