import { onCall, HttpsError } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import { db } from '../config/firebase';
import { Subscription } from '../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createSubscription = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const data = request.data as { priceId: string };
    // Get user from Firestore
    const userRef = db.collection('users').doc(request.auth.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData) {
      throw new HttpsError('not-found', 'User not found');
    }

    // Create or get Stripe customer
    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          firebaseUID: request.auth.uid,
        },
      });
      customerId = customer.id;
      await userRef.update({ stripeCustomerId: customerId });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: data.priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription to Firestore
    const subscriptionData: Subscription = {
      id: subscription.id,
      userId: request.auth.uid,
      status: subscription.status as 'active' | 'canceled' | 'past_due',
      planId: data.priceId,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('subscriptions').doc(subscription.id).set(subscriptionData);

    // Properly narrow the type for payment_intent
    let clientSecret: string | undefined = undefined;
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    if (
      latestInvoice &&
      latestInvoice.payment_intent &&
      typeof latestInvoice.payment_intent !== 'string'
    ) {
      clientSecret = latestInvoice.payment_intent.client_secret ?? undefined;
    }

    return {
      subscriptionId: subscription.id,
      clientSecret,
    };
  } catch (error) {
    throw new HttpsError('internal', 'Error creating subscription');
  }
});

export const cancelSubscription = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const subscriptionRef = db.collection('subscriptions')
      .where('userId', '==', request.auth.uid)
      .where('status', '==', 'active')
      .limit(1);

    const subscriptionDoc = await subscriptionRef.get();
    if (subscriptionDoc.empty) {
      throw new HttpsError('not-found', 'No active subscription found');
    }

    const subscription = subscriptionDoc.docs[0];
    await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });

    await subscription.ref.update({
      status: 'canceled',
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    throw new HttpsError('internal', 'Error canceling subscription');
  }
}); 