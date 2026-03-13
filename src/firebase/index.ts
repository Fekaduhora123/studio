
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

/**
 * Initializes Firebase services with robust settings for restrictive environments.
 * Uses experimentalForceLongPolling to bypass potential gRPC/WebChannel blocks.
 */
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!app) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      try {
        // Use initializeFirestore with long polling to prevent connection timeouts 
        // in proxied or restrictive network environments often found in cloud IDEs.
        firestore = initializeFirestore(app, {
          experimentalForceLongPolling: true,
        });
      } catch (e) {
        // Fallback if firestore is already initialized
        firestore = getFirestore(app);
      }

      auth = getAuth(app);
    }
    return { app, firestore, auth };
  }

  // Fallback for SSR (though mostly used on client)
  const ssrApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return { 
    app: ssrApp, 
    firestore: getFirestore(ssrApp), 
    auth: getAuth(ssrApp) 
  };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
