import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export const Approval: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'assignments'), where('status', '==', 'INTERNAL_ADDED'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const a: any[] = [];
      snap.forEach(doc => a.push({ id: doc.id, ...doc.data() }));
      setPendingApprovals(a);
    });
    return unsubscribe;
  }, []);

  const handleApprove = async (assignment: any) => {
    // 0. Fetch the associated survey data
    const surveyQuery = query(collection(db, 'surveys'), where('assignmentId', '==', assignment.id));
    const surveySnap = await getDocs(surveyQuery);

    if (surveySnap.empty) {
        alert('No survey data found for this assignment');
        return;
    }

    const surveyData = surveySnap.docs[0].data();

    // 1. Update assignment status
    await updateDoc(doc(db, 'assignments', assignment.id), {
      status: 'APPROVED'
    });

    // 2. Initial Report Generation
    await addDoc(collection(db, 'reports'), {
      assignmentId: assignment.id,
      version: 1,
      data: surveyData,
      generatedAt: serverTimestamp(),
      active: true,
    });

    alert('Assignment approved and Report v1 generated');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Manager Approval</h2>
      <div className="space-y-4">
        {pendingApprovals.map(a => (
          <div key={a.id} className="p-6 bg-white rounded shadow flex justify-between items-center">
            <div>
              <p className="font-bold">{a.electionType} Survey</p>
              <p className="text-sm text-gray-600">Assignment ID: {a.id}</p>
            </div>
            <button
              onClick={() => handleApprove(a)}
              className="bg-blue-600 text-white px-6 py-2 rounded font-bold"
            >
              Approve & Generate Report
            </button>
          </div>
        ))}
        {pendingApprovals.length === 0 && <p className="text-gray-500">No pending approvals found.</p>}
      </div>
    </div>
  );
};
