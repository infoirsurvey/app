import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const logAction = async (actionType: string, details: any) => {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      userId: auth.currentUser?.uid,
      userEmail: auth.currentUser?.email,
      actionType,
      details,
      timestamp: serverTimestamp(),
      ip: 'UNAVAILABLE_IN_BROWSER' // In a real cloud function, we'd capture IP
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};
