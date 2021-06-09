import { query as q } from "faunadb";
import { faunadbClient } from "../../../services/fauna";
import { stripe } from "../../../services/stripe"

interface saveSubscriptionParameters {
  subscriptionId: string,
  customerId: string,
}

export const saveSubscription = async ({ subscriptionId, customerId }: saveSubscriptionParameters) => {

  const subscriptionData = await getUserSubscriptionData(customerId, subscriptionId);

  await faunadbClient.query(
    q.Create(
      q.Collection('subscriptions'),
      {
        data: subscriptionData,
      }
    )
  );
}

export const updateSubscription = async ({ subscriptionId, customerId }: saveSubscriptionParameters) => {

  const subscriptionData = await getUserSubscriptionData(customerId, subscriptionId);

  await faunadbClient.query(
    q.Replace(
      q.Select(
        'ref',
        q.Get(
          q.Match(
            q.Index('subscription_by_id'),
            subscriptionId
          )
        )
      ),
      {
        data: subscriptionData
      },
    ));

}

async function getUserSubscriptionData(customerId: string, subscriptionId: string) {
  const userRef = await getUserRefByCustomerId(customerId);

  return await getStripeSubscription(subscriptionId, userRef);
}

async function getStripeSubscription(subscriptionId: string, userRef: object) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return {
    id: subscription.id,
    status: subscription.status,
    userRef,
    priceId: subscription.items.data[0].price.id,
  };
}

async function getUserRefByCustomerId(customerId: string) {
  return await faunadbClient.query(
    q.Select(
      'ref',
      q.Get(
        q.Match(
          q.Index('user_by_stripeCustomerId'),
          customerId
        ))
    )
  );
}

