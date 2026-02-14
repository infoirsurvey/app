import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export const AssignToClient: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedReport, setSelectedReport] = useState('');
  const [expiry, setExpiry] = useState('');

  useEffect(() => {
    // Fetch Clients
    const unsubC = onSnapshot(query(collection(db, 'users'), where('role', '==', 'CLIENT')), (snap) => {
      const c: any[] = [];
      snap.forEach(doc => c.push({ id: doc.id, ...doc.data() }));
      setClients(c);
    });

    // Fetch Active Reports
    const unsubR = onSnapshot(query(collection(db, 'reports'), where('active', '==', true)), (snap) => {
      const r: any[] = [];
      snap.forEach(doc => r.push({ id: doc.id, ...doc.data() }));
      setReports(r);
    });

    return () => { unsubC(); unsubR(); };
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'clientAssignments'), {
      clientId: selectedClient,
      reportId: selectedReport,
      expiryDate: new Date(expiry),
      assignedAt: serverTimestamp(),
      status: 'ASSIGNED'
    });
    alert('Report assigned to client');
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Assign Report to Client</h2>
      <form onSubmit={handleAssign} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm">Select Client</label>
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Select Client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Select Report</label>
          <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Select Report (Latest Active)</option>
            {reports.map(r => <option key={r.id} value={r.id}>Report v{r.version} - {r.assignmentId}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Access Expiry Date</label>
          <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Assign Access</button>
      </form>
    </div>
  );
};
