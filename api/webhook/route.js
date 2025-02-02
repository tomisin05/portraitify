import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config.js';


dotenv.config();

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const app = express();

app.use(cors({ origin: 'https://portraitify.vercel.app/' })); // Replace with your frontend URL

// Webhook endpoint to handle Stripe events
app.post('/api/webhook',  express.raw({ type: 'application/json' }), async (req, res) => {
    // console.log('Raw body:', req.body.toString()); // Log the raw body
    const sig = req.headers['stripe-signature'];
    // console.log('Signature:', sig);
    let event;
    const body = await req.body.toString();

    // console.log('Request details: ', req);
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        // console.log("webhook event: ", event)
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'charge.succeeded':
            const session = event.data.object.billing_details;
            console.log('Charge succeeded - billing details:', session);
            const amount = event.data.object.amount / 100;
            await handleCheckoutSession(session, amount); // Call the function to handle the checkout session
            break;
        // Handle other event types as needed
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
});

// Function to handle the checkout session
const handleCheckoutSession = async (session, amount) => {
    const email = session.email; // Get the email from the session
    const userId = await getUserIdByEmail(email); // Function to get user ID by email

    if (userId) {
        // const amount = session.amount / 100; // Convert from cents to dollars
        await updateUserCredits(userId, amount); // Function to update user credits
    } else {
        console.log(`No user found for email: ${email}`);
    }
};


const getUserIdByEmail = async (email) => {
    const usersRef = collection(db, 'users'); // Use the collection function
    const q = query(usersRef, where('email', '==', email)); // Create a query
    const snapshot = await getDocs(q); // Use getDocs to fetch the documents

    if (!snapshot.empty) {
        console.log(`User found for email ${email}:`, snapshot.docs[0].id); // Log found user ID
        return snapshot.docs[0].id; // Return the first matching user ID
    }
    console.log(`No user found for email: ${email}`); // Log if no user found
    return null; // No user found
};


// Function to update user credits in Firebase
const updateUserCredits = async (userId, amount) => {
    const userRef = doc(db, 'users', userId);
    console.log(`Updating credits for user ${userId} with amount ${amount}`);
    await updateDoc(userRef, {
        credits: increment(amount), // Increment credits by the amount paid
    });
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


export default app;
