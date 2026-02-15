import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { SurveyData } from '@ir-political-strategies/shared';

export const ReportVersioning: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editedData, setEditedData] = useState<SurveyData | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('version', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const r: any[] = [];
      snap.forEach(doc => r.push({ id: doc.id, ...doc.data() }));
      setReports(r);
    });
    return unsubscribe;
  }, []);

  const handleSelectReport = (report: any) => {
      setSelectedReport(report);
      setEditNotes('');
      // Deep copy the survey data for editing
      setEditedData(JSON.parse(JSON.stringify(report.data)));
  };

  const handleEdit = async () => {
    if (!selectedReport || !editedData) return;

    // 1. Deactivate current version
    await updateDoc(doc(db, 'reports', selectedReport.id), { active: false });

    // 2. Create NEW version with updated data
    await addDoc(collection(db, 'reports'), {
      assignmentId: selectedReport.assignmentId,
      version: selectedReport.version + 1,
      data: editedData,
      editNotes: editNotes,
      generatedAt: serverTimestamp(),
      generatedBy: auth.currentUser?.uid,
      active: true
    });

    alert(`Report version ${selectedReport.version + 1} generated successfully with updated data`);
    setSelectedReport(null);
    setEditedData(null);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Report Versioning & Editing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Active Reports</h3>
          {reports.filter(r => r.active).map(r => (
            <div key={r.id} className="p-4 border rounded bg-white shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold">Assignment: {r.assignmentId.substring(0,8)}...</p>
                <p className="text-sm">Version: v{r.version}</p>
                <p className="text-xs text-gray-500">Date: {r.generatedAt?.seconds ? new Date(r.generatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
              </div>
              <button
                onClick={() => handleSelectReport(r)}
                className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600 transition"
              >
                Edit & Regenerate
              </button>
            </div>
          ))}
          {reports.filter(r => r.active).length === 0 && <p className="text-gray-500 italic">No active reports available.</p>}
        </div>

        {selectedReport && editedData && (
          <div className="p-6 border rounded bg-orange-50 shadow-lg max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Editing v{selectedReport.version} → v{selectedReport.version + 1}</h3>

            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase tracking-wider">Demographics</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500">Male</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={editedData.sampleData.gender.male}
                                onChange={(e) => setEditedData({
                                    ...editedData,
                                    sampleData: {
                                        ...editedData.sampleData,
                                        gender: { ...editedData.sampleData.gender, male: parseInt(e.target.value) || 0 }
                                    }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Female</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={editedData.sampleData.gender.female}
                                onChange={(e) => setEditedData({
                                    ...editedData,
                                    sampleData: {
                                        ...editedData.sampleData,
                                        gender: { ...editedData.sampleData.gender, female: parseInt(e.target.value) || 0 }
                                    }
                                })}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase tracking-wider">Observations</h4>
                    <textarea
                        className="w-full p-2 border rounded h-24"
                        value={editedData.observations}
                        onChange={(e) => setEditedData({ ...editedData, observations: e.target.value })}
                        placeholder="Surveyor's original observations..."
                    />
                </div>

                <div>
                    <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase tracking-wider">Internal Notes</h4>
                    <textarea
                        className="w-full p-2 border rounded h-24 bg-gray-50"
                        value={editedData.internalNotes || ''}
                        onChange={(e) => setEditedData({ ...editedData, internalNotes: e.target.value })}
                        placeholder="Internal office supplementary notes..."
                    />
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-bold text-sm text-gray-800 mb-2">Change Reason / Audit Log Entry</h4>
                    <textarea
                        className="w-full p-2 border border-orange-200 rounded h-20 bg-white"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Why is this report being edited? (e.g., Data correction, updated candidate list)"
                        required
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={() => setSelectedReport(null)}
                        className="flex-1 bg-gray-200 text-gray-800 p-2 rounded font-bold hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleEdit}
                        disabled={!editNotes.trim()}
                        className="flex-2 bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        Generate New Version
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
