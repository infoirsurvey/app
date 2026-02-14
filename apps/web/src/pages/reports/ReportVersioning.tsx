import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export const ReportVersioning: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('version', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const r: any[] = [];
      snap.forEach(doc => r.push({ id: doc.id, ...doc.data() }));
      setReports(r);
    });
    return unsubscribe;
  }, []);

  const handleEdit = async () => {
    if (!selectedReport) return;

    // 1. Deactivate current version
    await updateDoc(doc(db, 'reports', selectedReport.id), { active: false });

    // 2. Create NEW version
    await addDoc(collection(db, 'reports'), {
      assignmentId: selectedReport.assignmentId,
      version: selectedReport.version + 1,
      editNotes: editNotes,
      generatedAt: serverTimestamp(),
      generatedBy: auth.currentUser?.uid,
      active: true
    });

    alert(`Report version ${selectedReport.version + 1} generated successfully`);
    setSelectedReport(null);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Report Versioning & Editing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold">Active Reports</h3>
          {reports.filter(r => r.active).map(r => (
            <div key={r.id} className="p-4 border rounded bg-white shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold">Assignment: {r.assignmentId}</p>
                <p className="text-sm">Version: v{r.version}</p>
              </div>
              <button
                onClick={() => { setSelectedReport(r); setEditNotes(''); }}
                className="bg-orange-500 text-white px-4 py-1 rounded text-sm"
              >
                Edit & Regenerate
              </button>
            </div>
          ))}
        </div>

        {selectedReport && (
          <div className="p-6 border rounded bg-orange-50 shadow-lg">
            <h3 className="font-bold mb-4">Editing v{selectedReport.version} → v{selectedReport.version + 1}</h3>
            <label className="block text-sm mb-2">Change Log / Observations</label>
            <textarea
              className="w-full p-2 border rounded h-32 mb-4"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Describe the changes made to the report data..."
            />
            <button
              onClick={handleEdit}
              className="w-full bg-blue-600 text-white p-2 rounded font-bold"
            >
              Generate New Version
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
