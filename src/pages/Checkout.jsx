// // import React, { useState } from 'react';
// // import { loadStripe } from '@stripe/stripe-js';

// // const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // Replace with your Stripe public key

// // const Checkout = () => {
// //     const [amount, setAmount] = useState(0);
// //     const [error, setError] = useState(null);
// //     const [loading, setLoading] = useState(false);

// //     const handlePayment = async (e) => {
// //         e.preventDefault();
// //         setLoading(true);
// //         setError(null);

// //         const stripe = await stripePromise;

// //         try {
// //             const response = await fetch('http://localhost:5000/create-payment-intent', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify({ amount: amount * 100 }), // Convert to cents
// //             });

// //             const { clientSecret } = await response.json();

// //             const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
// //                 payment_method: {
// //                     card: elements.getElement(CardElement), // Assuming you are using CardElement
// //                 },
// //             });

// //             if (stripeError) {
// //                 setError(stripeError.message);
// //             } else {
// //                 alert('Payment successful!');
// //             }
// //         } catch (error) {
// //             setError(error.message);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <form onSubmit={handlePayment}>
// //             <input
// //                 type="number"
// //                 value={amount}
// //                 onChange={(e) => setAmount(e.target.value)}
// //                 placeholder="Enter amount"
// //                 required
// //             />
// //             <button type="submit" disabled={loading}>
// //                 {loading ? 'Processing...' : 'Pay'}
// //             </button>
// //             {error && <div>{error}</div>}
// //         </form>
// //     );
// // };

// // export default Checkout; 














// // import React, { useState } from 'react';
// // import { loadStripe } from '@stripe/stripe-js';
// // import { db } from '../lib/firebase/config';
// // import { doc, updateDoc } from 'firebase/firestore';
// // import { useAuth } from '../contexts/AuthContext';
// // import { increment } from 'firebase/firestore';

// // const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); 

// // const Checkout = () => {
// //     const { user } = useAuth();
// //     const [amount, setAmount] = useState(0);
// //     const [error, setError] = useState(null);
// //     const [loading, setLoading] = useState(false);

// //     const handlePayment = async (e) => {
// //         e.preventDefault();
// //         setLoading(true);
// //         setError(null);

// //         const stripe = await stripePromise;
// //         console.log('Stripe initialized:', stripe);
// //         if (!stripe) {
// //             setError('Stripe initialization failed');
// //             return;
// //         }

// //         try {
// //             const response = await fetch('http://localhost:5000/create-payment-intent', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify({ amount: amount * 100 }), // Convert to cents
// //             });

// //             if (!response.ok) {
// //                 throw new Error('Failed to create payment intent');
// //             }
    

// //             const { clientSecret } = await response.json();

// //             const { error: stripeError } = await stripe.confirmCardPayment(clientSecret);

// //             if (stripeError) {
// //                 setError(stripeError.message);
// //             } else {
// //                 // Payment successful, update user credits in Firestore
// //                 await updateDoc(doc(db, 'users', user.uid), {
// //                     credits: increment(amount), // Increment credits by the amount paid
// //                 });
// //                 alert('Payment successful! Your credits have been updated.');
// //                 // Redirect to a success page or another URL
// //                 window.location.href = '/success'; // Change to your desired URL
// //             }
// //         } catch (error) {
// //             setError(error.message);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <form onSubmit={handlePayment}>
// //             <input
// //                 type="number"
// //                 value={amount}
// //                 onChange={(e) => setAmount(e.target.value)}
// //                 placeholder="Enter amount"
// //                 required
// //             />
// //             <button type="submit" disabled={loading}>
// //                 {loading ? 'Processing...' : 'Pay'}
// //             </button>
// //             {error && <div>{error}</div>}
// //         </form>
// //     );
// // };

// // export default Checkout;


// import React, { useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';

// const Checkout = () => {
//     const { user } = useAuth();
//     const [amount, setAmount] = useState(0);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);

//     const handlePayment = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);

//         try {
//             const response = await fetch('http://localhost:5000/create-checkout-session', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ amount }), // Send the amount
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to create checkout session');
//             }

//             const { url } = await response.json();
//             window.location.href = url; // Redirect to the Stripe Checkout page
//         } catch (error) {
//             setError(error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handlePayment}>
//             <input
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="Enter amount"
//                 required
//             />
//             <button type="submit" disabled={loading}>
//                 {loading ? 'Processing...' : 'Pay'}
//             </button>
//             {error && <div>{error}</div>}
//         </form>
//     );
// };

// export default Checkout;


import React from 'react';

const Checkout = () => {
    const paymentLink = 'https://buy.stripe.com/test_6oEeXC7nIeQXdA4144'; // Replace with your actual payment link

    const handleCheckout = () => {
        window.location.href = paymentLink; // Redirect to the Stripe payment link
    };

    return (
        <div>
            <h1>Checkout</h1>
            <button 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleCheckout}>
                Checkout
            </button>
        </div>
    );
};

export default Checkout;