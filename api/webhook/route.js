import Stripe from 'stripe';
import { db } from '../../src/lib/firebase/config';
import { doc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Webhook event received:", event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    switch (event.type) {
      case 'charge.succeeded':
        const session = event.data.object.billing_details;
        console.log('Charge succeeded - billing details:', session);
        const amount = event.data.object.amount / 100;
        await handleCheckoutSession(session, amount);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
}

const handleCheckoutSession = async (session, amount) => {
  const email = session.email;
  const userId = await getUserIdByEmail(email);

  if (userId) {
    console.log(`Updating credits for user ${userId} with amount ${amount}`);
    await updateUserCredits(userId, amount);
  } else {
    console.log(`No user found for email: ${email}`);
  }
};

const getUserIdByEmail = async (email) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    console.log(`User found for email ${email}:`, snapshot.docs[0].id);
    return snapshot.docs[0].id;
  }
  console.log(`No user found for email: ${email}`);
  return null;
};

const updateUserCredits = async (userId, amount) => {
  const userRef = doc(db, 'users', userId);
  console.log(`Updating credits for user ${userId} with amount ${amount}`);
  await updateDoc(userRef, {
    credits: increment(amount),
  });
};
