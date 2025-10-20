import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  type Auth,
  type UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";

const getEnvValue = (extraKey: string, envKey: keyof NodeJS.ProcessEnv) => {
  const envValue = process.env[envKey];
  if (envValue && envValue !== 'undefined') {
    return envValue;
  }
  const extraValue = Constants.expoConfig?.extra?.[extraKey];
  if (typeof extraValue === 'string' && extraValue.length > 0) {
    return extraValue;
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnvValue('firebaseApiKey', 'EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvValue('firebaseAuthDomain', 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvValue('firebaseProjectId', 'EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvValue('firebaseStorageBucket', 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvValue(
    'firebaseMessagingSenderId',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  ),
  appId: getEnvValue('firebaseAppId', 'EXPO_PUBLIC_FIREBASE_APP_ID'),
  measurementId: getEnvValue('firebaseMeasurementId', 'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'),
};

const missingKey = Object.entries(firebaseConfig).find(([, value]) => !value);
if (missingKey) {
  throw new Error(`Missing Firebase configuration value for ${missingKey[0]}`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);

let firestore: Firestore;
try {
  firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
} catch (error) {
  firestore = getFirestore(app);
}
const storage = getStorage(app);

export {
  app,
  auth,
  firestore,
  storage,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
};
