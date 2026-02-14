
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAYqHb4fw3L2PNfnJeGd-92uPSG-pky0U",
  authDomain: "ir-survey-fc9d7.firebaseapp.com",
  projectId: "ir-survey-fc9d7",
  storageBucket: "ir-survey-fc9d7.firebasestorage.app",
  messagingSenderId: "624690659460",
  appId: "1:624690659460:web:66be46afdc602802f682d1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function approveUser(uid: string) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    approved: true,
    role: 'ADMIN'
  });
  console.log("User approved as ADMIN");
}

// usage: node approve_admin.js <UID>
const uid = process.argv[2];
if (uid) {
  approveUser(uid);
} else {
  console.log("Please provide a UID");
}
