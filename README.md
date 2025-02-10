# AI Portrait Studio: Create Custom AI-Powered Portraits

AI Portrait Studio is a web application that allows users to generate custom AI-powered portraits using advanced machine learning techniques. Users can upload images, train custom AI models, and create unique portraits based on their specifications.

This application combines the power of React for the frontend, Firebase for authentication and data storage, and integrates with Stripe for payment processing. It leverages AI technologies to offer a unique and personalized portrait creation experience.

## Repository Structure

```
.
├── src
│   ├── components
│   ├── contexts
│   ├── lib
│   │   ├── fai
│   │   └── firebase
│   ├── pages
│   └── utils
├── .env
├── package.json
├── vite.config.js
└── vercel.json
```

### Key Files:
- `src/App.jsx`: Main application component and routing setup
- `src/pages/Create.jsx`: Core functionality for creating and generating portraits
- `src/lib/firebase/stripePayments.js`: Firebase-based payment processing
- `package.json`: Project dependencies and scripts
- `vite.config.js`: Vite build tool configuration
- `vercel.json`: Vercel deployment configuration

### Important Integration Points:
- Firebase Authentication: User management and authentication
- Firestore: Data storage for user models, portraits, and payment processing
- Stripe: Payment processing integration
- Fal AI: AI model training and image generation

## Usage Instructions

### Installation

Prerequisites:
- Node.js (v14 or later)
- npm (v6 or later)

Steps:
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add the necessary environment variables:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

### Getting Started

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`

### Configuration Options

- Firebase: Update the Firebase configuration in `src/lib/firebase/config.js` if needed
- Stripe: Ensure the Stripe public key is correctly set in the `.env` file

### Common Use Cases

1. User Authentication:
   ```javascript
   import { useAuth } from '../contexts/AuthContext';

   const { user, signOut } = useAuth();
   ```

2. Creating a Portrait:
   ```javascript
   const handleTrain = async () => {
     // Implementation in src/pages/Create.jsx
   };

   const handleGenerate = async () => {
     // Implementation in src/pages/Create.jsx
   };
   ```

3. Handling Payments:
   ```javascript
   // Firebase listener for payment processing in src/lib/firebase/stripePayments.js
   export const listenForPayments = (app, userId) => {
     // Implementation details
   };
   ```

### Integration Patterns

1. Firebase Authentication:
   ```javascript
   import { auth } from '../lib/firebase/config';
   
   const user = auth.currentUser;
   ```

2. Firestore Data Access:
   ```javascript
   import { db } from '../lib/firebase/config';
   import { doc, getDoc, updateDoc } from 'firebase/firestore';

   const userRef = doc(db, 'users', userId);
   const userDoc = await getDoc(userRef);
   ```

3. Stripe Integration:
   ```javascript
   import { loadStripe } from '@stripe/stripe-js';

   const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
   ```

### Testing & Quality

- Run linter:
  ```
  npm run lint
  ```

### Troubleshooting

1. Issue: Firebase authentication not working
   - Confirm Firebase configuration in `src/lib/firebase/config.js`
   - Verify Firebase project settings in the Firebase console

2. Issue: Portrait generation fails
   - Check Fal AI API credentials and quota
   - Ensure user has sufficient credits
   - Review server logs for specific error messages

3. Issue: Payment processing not updating user credits
   - Verify the `listenForPayments` function is properly set up and running
   - Check Firestore rules to ensure proper access to the payments subcollection
   - Review Firebase console logs for any errors in the payment listener function

Debugging:
- Enable verbose logging in `src/pages/Create.jsx`:
  ```javascript
  console.log('Debug: ', { uploadedImages, selectedModelId, formData });
  ```
- Check browser console and Firebase console logs for error messages
- Use Firebase Console to inspect Firestore data and Authentication status

Performance Optimization:
- Monitor Firestore read/write operations
- Optimize image uploads by compressing images before upload
- Implement caching for frequently accessed data

## Data Flow

The AI Portrait Studio application follows a client-server architecture with integration to external services. Here's an overview of the data flow:

1. User Authentication:
   Client -> Firebase Authentication -> Client

2. Model Training:
   Client -> Server -> Fal AI API -> Server -> Firestore

3. Portrait Generation:
   Client -> Server -> Fal AI API -> Server -> Firestore -> Client

4. Payment Processing:
   Client -> Stripe -> Firebase (Payments Subcollection) -> Firestore (User Credits Update)

```
+--------+    +--------+    +-------------+
| Client |<-->| Server |<-->| Fal AI API  |
+--------+    +--------+    +-------------+
    ^             ^
    |             |
    v             v
+--------+    +----------+
| Stripe |    | Firebase |
+--------+    +----------+
```

Notes:
- The client communicates with the server for AI operations and data management
- Firebase handles authentication, data storage, and payment processing
- Stripe processes payments, with Firebase monitoring the payments subcollection for successful transactions
- The Fal AI API is used for model training and image generation