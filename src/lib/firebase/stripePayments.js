"use client";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  doc, 
  updateDoc, 
  increment,
  limit,
  query,
  orderBy
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";


export const getCheckoutUrl = async (app, priceId) => {
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User is not authenticated");

  const db = getFirestore(app);
  const checkoutSessionRef = collection(
    db,
    "customers",
    userId,
    "checkout_sessions"
  );
  console.log("Checkout session ref:", checkoutSessionRef);

  const docRef = await addDoc(checkoutSessionRef, {
    price: priceId,
    success_url: window.location.origin + '/create', // Explicitly route to /create
    cancel_url: window.location.origin + '/create',  // Route back to /create even on cancel
    mode: 'payment',
  });

  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data();
      if (error) {
        unsubscribe();
        reject(new Error(`An error occurred: ${error.message}`));
      }
      if (url) {
        console.log("Stripe Checkout URL:", url);
        unsubscribe();
        resolve(url);
      }
    });
  });
};

export const getPortalUrl = async (app) => {
  const auth = getAuth(app);
  const user = auth.currentUser;

  let dataWithUrl;
  try {
    const functions = getFunctions(app, "us-central1");
    const functionRef = httpsCallable(
      functions,
      "ext-firestore-stripe-payments-createPortalLink"
    );
    const { data } = await functionRef({
      customerId: user?.uid,
      returnUrl: window.location.origin,
    });

    dataWithUrl = data;
    console.log("Reroute to Stripe portal: ", dataWithUrl.url);
  } catch (error) {
    console.error(error);
  }

  return new Promise((resolve, reject) => {
    if (dataWithUrl && dataWithUrl.url) {
      resolve(dataWithUrl.url);
    } else {
      reject(new Error("No url returned"));
    }
  });
};



// firebase listener that checks the payments sub collection and listens for newly updated payments with status succeeded and then updates the user credits in the user database with the credits
export const listenForPayments = (app, userId) => {
    const db = getFirestore(app);
    const paymentsRef = collection(db, "customers", userId, "payments");

    return onSnapshot(paymentsRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const paymentDoc = change.doc;
        const payment = paymentDoc.data();

        if (change.type === "added" && 
            !payment.processed && 
            payment.status === "succeeded") {
          try {
            const credits = payment.amount / 100;
            
            // Update user credits
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              credits: increment(credits),
            });
            
            // Mark payment as processed in Firebase
            await updateDoc(paymentDoc.ref, {
              processed: true
            });
            
            console.log(`Credits updated for user ${userId}: +${credits}`);
          } catch (error) {
            console.error('Error updating credits:', error);
          }
        }
      });
    });
};

