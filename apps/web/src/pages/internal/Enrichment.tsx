import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const Enrichment: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'surveys'), where('locked', '==', true));
    const unsubscribe = onSnapshot(q, (snap) => {
      const s: any[] = [];
      snap.forEach(doc => s.push({ id: doc.id, ...doc.data() }));
      setSubmissions(s);
    });
    return unsubscribe;
  }, []);

  const handleUpdate = async () => {
    if (!selectedSurvey) return;
    await updateDoc(doc(db, 'surveys', selectedSurvey.id), {
      internalNotes: notes,
      status: 'INTERNAL_ADDED'
    });
    await updateDoc(doc(db, 'assignments', selectedSurvey.assignmentId), {
      status: 'INTERNAL_ADDED'
    });
    alert('Supplementary data added');
    setSelectedSurvey(null);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Internal Office - Data Enrichment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded p-4">
          <h3 className="font-bold mb-4">Submitted Surveys</h3>
          {submissions.map(s => (
            <div
              key={s.id}
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => { setSelectedSurvey(s); setNotes(s.internalNotes || ''); }}
            >
              <p className="font-bold">Survey ID: {s.id}</p>
              <p className="text-sm">Location ID: {s.locationData.constituencyId}</p>
            </div>
          ))}
        </div>
        {selectedSurvey && (
          <div className="border rounded p-4 bg-white shadow">
            <h3 className="font-bold mb-4">Edit Supplementary Data</h3>
            <label className="block text-sm mb-2">Internal Notes / Historical Data</label>
            <textarea
              className="w-full p-2 border rounded h-40"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={handleUpdate}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Save & Finalize for Approval
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
