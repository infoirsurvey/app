
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDAYqHb4fw3L2PNfnJeGd-92uPSG-pky0U",
  authDomain: "ir-survey-fc9d7.firebaseapp.com",
  projectId: "ir-survey-fc9d7",
  storageBucket: "ir-survey-fc9d7.firebasestorage.app",
  messagingSenderId: "624690659460",
  appId: "1:624690659460:web:66be46afdc602802f682d1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
