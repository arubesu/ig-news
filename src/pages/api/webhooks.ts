import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { Stripe } from 'stripe';
import { stripe } from '../../services/stripe';
import { saveSubscription, updateSubscription } from './_lib/manageSubscription';

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
    return;
  }
  const buf = await buffer(req);
  const secret = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send('webhook error');
  }

  const { type } = event;

  if (relevantEvents.has(type)) {

    switch (type) {
      case 'checkout.session.completed':

        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await saveSubscription({
          subscriptionId: checkoutSession.subscription.toString(),
          customerId: checkoutSession.customer.toString()
        });
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':

        const subscription = event.data.object as Stripe.Subscription;

        await updateSubscription({
          subscriptionId: subscription.id,
          customerId: subscription.customer.toString()
        });
    }
  }

  return res.json({ ok: true });
}
