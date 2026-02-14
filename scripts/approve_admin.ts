
import * as admin from 'firebase-admin';

// Initialize the Admin SDK
// In a real scenario, you'd provide service account credentials
// For this environment, we assume the credentials are in a specific file or env var
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   projectId: "ir-survey-fc9d7"
// });

// If running in a trusted environment (like a Google Cloud Function or with GOOGLE_APPLICATION_CREDENTIALS)
if (!admin.apps.length) {
  admin.initializeApp({
      projectId: "ir-survey-fc9d7"
  });
}

const db = admin.firestore();

async function approveUser(uid: string) {
  try {
    const userRef = db.collection("users").doc(uid);
    await userRef.update({
      approved: true,
      role: 'ADMIN'
    });
    console.log(`User ${uid} successfully approved as ADMIN`);
  } catch (error) {
    console.error("Error approving user:", error);
  }
}

const uid = process.argv[2];
if (uid) {
  approveUser(uid);
} else {
  console.log("Please provide a UID as an argument: ts-node scripts/approve_admin.ts <UID>");
}
