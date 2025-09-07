// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Auth Provider specifically for popup
export const provider = new GoogleAuthProvider();

// Force popup behavior by setting custom parameters
provider.setCustomParameters({
  prompt: "select_account",
  // Force popup mode
  display: "popup",
  // Prevent redirect
  ux_mode: "popup"
});

// Add required scopes
provider.addScope('email');
provider.addScope('profile');
provider.addScope('openid');

// Export a function to ensure popup behavior
export const signInWithGooglePopup = async () => {
  // Import dynamically to avoid SSR issues
  const { signInWithPopup } = await import('firebase/auth');
  
  return signInWithPopup(auth, provider);
};