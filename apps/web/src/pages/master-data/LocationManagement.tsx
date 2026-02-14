import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export const LocationManagement: React.FC = () => {
  const [level, setLevel] = useState<'STATE' | 'DISTRICT' | 'CONSTITUENCY' | 'MANDAL'>('STATE');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'locations'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locs: any[] = [];
      snapshot.forEach((doc) => locs.push({ id: doc.id, ...doc.data() }));
      setLocations(locs);
    });
    return unsubscribe;
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'locations'), {
      name,
      level,
      parentId: level === 'STATE' ? null : parentId,
    });
    setName('');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Location Master Data</h2>
      <form onSubmit={handleAdd} className="mb-8 p-4 bg-gray-50 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={level} onChange={(e: any) => setLevel(e.target.value)} className="p-2 border rounded">
            <option value="STATE">State</option>
            <option value="DISTRICT">District</option>
            <option value="CONSTITUENCY">Constituency</option>
            <option value="MANDAL">Mandal</option>
          </select>
          {level !== 'STATE' && (
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="p-2 border rounded" required>
              <option value="">Select Parent</option>
              {locations
                .filter(l => (level === 'DISTRICT' && l.level === 'STATE') ||
                             (level === 'CONSTITUENCY' && l.level === 'DISTRICT') ||
                             (level === 'MANDAL' && l.level === 'CONSTITUENCY'))
                .map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          )}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Add Location</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['STATE', 'DISTRICT', 'CONSTITUENCY', 'MANDAL'].map(lvl => (
          <div key={lvl} className="border p-4 rounded bg-white">
            <h3 className="font-bold border-bottom mb-2">{lvl}</h3>
            <ul>
              {locations.filter(l => l.level === lvl).map(l => (
                <li key={l.id} className="text-sm py-1 border-b last:border-0">{l.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
