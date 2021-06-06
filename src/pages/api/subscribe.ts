import { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { faunadbClient } from '../../services/fauna';
import { stripe } from '../../services/stripe'

interface User {
  ref: {
    id: string
  },
  data: {
    stripeCustomerId: string,
    email: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
    return;
  }

  const session = await getSession({ req });

  const user = await faunadbClient.query<User>(
    q.Get(
      q.Match(
        q.Index('user_by_email'),
        q.Casefold(session.user.email)
      ))
  );

  let stripeCustomerId = user.data.stripeCustomerId;

  if (!stripeCustomerId) {

    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    });

    stripeCustomerId = stripeCustomer.id;

    await faunadbClient.query(
      q.Update(
        q.Ref(
          q.Collection('users'),
          user.ref.id
        ),
        {
          data: {
            stripeCustomerId,
          }
        },
      ));
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: `${process.env.API_URL}/posts`,
    cancel_url: process.env.APP_URL,
  });

  return res.status(200).json({
    sessionId: checkoutSession.id,
  });
}
