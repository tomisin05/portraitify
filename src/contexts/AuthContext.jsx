import { getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth,
  db,
  storage,
  initFirebase,
} from '../lib/firebase/config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { listenForPayments } from '../lib/firebase/stripePayments'; // Import your function

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // Payment listener effect
  useEffect(() => {
    if (user) {
      // Use your existing listenForPayments function
      const unsubscribe = listenForPayments(initFirebase(), user.uid);
      
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  // Second useEffect for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = (email, password) => {
    // Create a new user with email and password
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("User created:", user);

        // Add user to Firestore
        const usersRef = collection(db, 'users');
        setDoc(doc(usersRef, user.uid), {
          uid: user.uid,
          email: user.email,
          credits: 0,
          createdAt: new Date(),
        }).then(() => {
          console.log("User added to Firestore");
        }).catch((error) => {
          console.error("Error adding user to Firestore:", error);
        });

        return user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error creating user:", errorCode, errorMessage);
        throw error;
      });
    // return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);

  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user already exists in Firestore
      const usersRef = collection(db, 'users'); 
      const userDoc = await getDoc(doc(usersRef, user.uid));
      if (!userDoc.exists()) {
        // Add user to Firestore
        await setDoc(doc(usersRef, user.uid), {
          uid: user.uid,
          email: user.email,
          credits: 0,
          createdAt: new Date(),
        });
      }
      return result;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
