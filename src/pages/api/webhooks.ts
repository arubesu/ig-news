import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { Stripe } from 'stripe';
import { stripe } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

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
        const subscriptionId = checkoutSession.subscription.toString();
        const customerId = checkoutSession.customer.toString();

        await saveSubscription({
          subscriptionId,
          customerId
        }
        );
    }
  }

  return res.json({ ok: true });
}
