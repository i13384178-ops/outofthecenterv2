import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

/** Matches Firebase Console → Project settings → Your apps → Web app config. */
const firebaseConfig = {
  apiKey: 'AIzaSyBs41tHcv4ilKP_lPCrsId6y9MxvHr9QDE',
  authDomain: 'outofcenter-2c2a4.firebaseapp.com',
  projectId: 'outofcenter-2c2a4',
  storageBucket: 'outofcenter-2c2a4.firebasestorage.app',
  messagingSenderId: '743230633562',
  appId: '1:743230633562:web:00a15ffda86180f2a18a63',
};

export const app = initializeApp(firebaseConfig);

/** Long-polling fallback helps some networks / static hosts where default WebChannel is blocked. */
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
