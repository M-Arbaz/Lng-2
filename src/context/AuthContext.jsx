'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...userDocSnap.data(),
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, firstName, lastName) => {
    try {
      setError(null);
      const trimmedEmail = email?.trim();
      const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const firebaseUser = result.user;

      const displayName = `${firstName} ${lastName}`.trim();
      await firebaseUpdateProfile(firebaseUser, { displayName });

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName,
        firstName: firstName || '',
        lastName: lastName || '',
        createdAt: new Date().toISOString(),
        role: 'user',
      });

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'user',
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData };
    } catch (err) {
      let message = 'Signup failed';
      if (err.code === 'auth/configuration-not-found') {
        message = 'Authentication is not configured. Please enable Email/Password sign-in in your Firebase Console.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email already in use';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (err.code === 'auth/invalid-api-key') {
        message = 'Invalid Firebase API key. Check your .env configuration.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email format. Please enter a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const signin = async (email, password) => {
    try {
      setError(null);
      const trimmedEmail = email?.trim();
      const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const firebaseUser = result.user;

      // Get user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        ...userDocSnap.data(),
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData };
    } catch (err) {
      let message = 'Signin failed';
      if (err.code === 'auth/configuration-not-found') {
        message = 'Authentication is not configured. Please enable Email/Password sign-in in your Firebase Console.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'User not found';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Wrong password';
      } else if (err.code === 'auth/invalid-api-key') {
        message = 'Invalid Firebase API key. Check your .env configuration.';
      } else if (err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };
  const signInWithGoogle = async () => {
    try {
      setError(null);

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      // First Google login: create customer document
      if (!userDocSnap.exists()) {
        const displayName = firebaseUser.displayName || '';
        const nameParts = displayName.trim().split(/\s+/);

        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ');

        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName,
          firstName,
          lastName,
          photoURL: firebaseUser.photoURL || '',
          createdAt: new Date().toISOString(),
          role: 'user',
          authProvider: 'google',
        });
      }

      const updatedUserDoc = await getDoc(userDocRef);

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        ...updatedUserDoc.data(),
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { user: userData };
    } catch (err) {
      console.error('Google sign-in error:', err);

      let message = 'Google sign-in failed. Please try again.';

      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Google sign-in popup was blocked by your browser.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized for Google sign-in.';
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      throw new Error(message);
    }
  };
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      const message = err.message || 'Logout failed';
      setError(message);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No user logged in');

      // Update Firebase profile if displayName is provided
      if (profileData.displayName) {
        await firebaseUpdateProfile(firebaseUser, {
          displayName: profileData.displayName,
          photoURL: profileData.photoURL || firebaseUser.photoURL,
        });
      }

      // Update Firestore user document
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, profileData, { merge: true });

      // Update local state
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    } catch (err) {
      const message = err.message || 'Profile update failed';
      setError(message);
      throw err;
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isLoggedIn = () => !!user;

  const value = {
    user,
    loading,
    error,
    signup,
    signin,
    signInWithGoogle,

    logout,
    updateProfile,
    isAdmin,
    isLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
