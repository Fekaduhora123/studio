
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Use initializeFirestore with long polling to prevent connection timeouts 
  // in proxied or restrictive network environments.
  let firestore;
  try {
    firestore = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    // Fallback if firestore is already initialized
    firestore = getFirestore(app);
  }

  const auth = getAuth(app);
  return { app, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
