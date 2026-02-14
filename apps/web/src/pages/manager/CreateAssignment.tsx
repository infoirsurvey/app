import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { ElectionType, User as AppUser } from '@ir-political-strategies/shared';

export const CreateAssignment: React.FC = () => {
  const [surveyors, setSurveyors] = useState<AppUser[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedSurveyor, setSelectedSurveyor] = useState('');
  const [electionType, setElectionType] = useState<ElectionType>('MLA');
  const [deadline, setDeadline] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');

  useEffect(() => {
    // Fetch Surveyors
    const qS = query(collection(db, 'users'), where('role', '==', 'SURVEYOR'), where('approved', '==', true));
    const unsubS = onSnapshot(qS, (snap) => {
      const s: AppUser[] = [];
      snap.forEach(doc => s.push(doc.data() as AppUser));
      setSurveyors(s);
    });

    // Fetch Locations
    const qL = query(collection(db, 'locations'));
    const unsubL = onSnapshot(qL, (snap) => {
      const l: any[] = [];
      snap.forEach(doc => l.push({ id: doc.id, ...doc.data() }));
      setLocations(l);
    });

    return () => { unsubS(); unsubL(); };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'assignments'), {
      surveyorId: selectedSurveyor,
      electionType,
      deadline: new Date(deadline),
      location: {
        stateId: selectedState,
        districtId: selectedDistrict,
        constituencyId: selectedConstituency,
      },
      status: 'PENDING',
      createdAt: serverTimestamp(),
    });
    alert('Assignment created successfully');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Assignment</h2>
      <form onSubmit={handleCreate} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Select Surveyor</label>
          <select value={selectedSurveyor} onChange={(e) => setSelectedSurveyor(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Select Surveyor</option>
            {surveyors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Election Type</label>
          <select value={electionType} onChange={(e: any) => setElectionType(e.target.value)} className="w-full p-2 border rounded">
            {['MLA', 'MP', 'MLC', 'Sarpanch', 'MPTC', 'ZPTC', 'GHMC', 'Municipality', 'Municipal Corporation', 'Other'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">State</label>
          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Select State</option>
            {locations.filter(l => l.level === 'STATE').map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">District</label>
          <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full p-2 border rounded" required disabled={!selectedState}>
            <option value="">Select District</option>
            {locations.filter(l => l.level === 'DISTRICT' && l.parentId === selectedState).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Constituency</label>
          <select value={selectedConstituency} onChange={(e) => setSelectedConstituency(e.target.value)} className="w-full p-2 border rounded" required disabled={!selectedDistrict}>
            <option value="">Select Constituency</option>
            {locations.filter(l => l.level === 'CONSTITUENCY' && l.parentId === selectedDistrict).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Deadline</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">Create Assignment</button>
      </form>
    </div>
  );
};
