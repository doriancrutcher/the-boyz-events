import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

const ADMIN_EMAIL = 'thegayboyzevents@gmail.com';
const googleProvider = new GoogleAuthProvider();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Check if user is admin
        const isAdmin = user.email === ADMIN_EMAIL;
        setUserRole(isAdmin ? 'admin' : 'user');
        
        // Create user document if it doesn't exist
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            role: isAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    return signOut(auth);
  };

  const isAdmin = () => {
    return userRole === 'admin' || currentUser?.email === ADMIN_EMAIL;
  };

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    signInWithGoogle,
    logout,
    isAdmin: isAdmin()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
