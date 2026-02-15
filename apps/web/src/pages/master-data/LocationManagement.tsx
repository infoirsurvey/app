import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

type LocationLevel = 'STATE' | 'DISTRICT' | 'CONSTITUENCY' | 'MANDAL' | 'VILLAGE' | 'WARD' | 'GHMC_ZONE' | 'MUNICIPALITY' | 'MUNICIPAL_CORPORATION';

export const LocationManagement: React.FC = () => {
  const [level, setLevel] = useState<LocationLevel>('STATE');
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

  const getParentLevels = (childLevel: LocationLevel): LocationLevel[] => {
      switch(childLevel) {
          case 'DISTRICT': return ['STATE'];
          case 'CONSTITUENCY': return ['DISTRICT'];
          case 'MANDAL': return ['CONSTITUENCY'];
          case 'VILLAGE': return ['MANDAL'];
          case 'WARD': return ['MUNICIPALITY', 'MUNICIPAL_CORPORATION', 'GHMC_ZONE'];
          case 'GHMC_ZONE': return ['CONSTITUENCY'];
          case 'MUNICIPALITY': return ['CONSTITUENCY'];
          case 'MUNICIPAL_CORPORATION': return ['CONSTITUENCY'];
          default: return [];
      }
  }

  const parentLevels = getParentLevels(level);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Location Master Data</h2>
      <form onSubmit={handleAdd} className="mb-8 p-6 bg-white rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Target Level</label>
            <select value={level} onChange={(e: any) => setLevel(e.target.value)} className="w-full p-2 border rounded shadow-sm">
                <option value="STATE">State</option>
                <option value="DISTRICT">District</option>
                <option value="CONSTITUENCY">Constituency</option>
                <option value="MANDAL">Mandal</option>
                <option value="VILLAGE">Village</option>
                <option value="WARD">Ward</option>
                <option value="GHMC_ZONE">GHMC Zone</option>
                <option value="MUNICIPALITY">Municipality</option>
                <option value="MUNICIPAL_CORPORATION">Municipal Corporation</option>
            </select>
          </div>

          {level !== 'STATE' && (
            <div>
              <label className="block text-sm font-medium mb-1">Parent Location</label>
              <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full p-2 border rounded shadow-sm" required>
                <option value="">Select Parent</option>
                {locations
                  .filter(l => parentLevels.includes(l.level))
                  .map(l => <option key={l.id} value={l.id}>{l.name} ({l.level})</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Location Name</label>
            <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded shadow-sm"
                required
            />
          </div>
        </div>
        <button type="submit" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
            Add Location Entry
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {['STATE', 'DISTRICT', 'CONSTITUENCY', 'MANDAL', 'VILLAGE', 'WARD', 'GHMC_ZONE', 'MUNICIPALITY', 'MUNICIPAL_CORPORATION'].map(lvl => (
          <div key={lvl} className="border rounded-lg bg-white overflow-hidden shadow-sm flex flex-col h-64">
            <div className="bg-gray-50 p-3 border-b">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">{lvl.replace('_', ' ')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-1">
                {locations.filter(l => l.level === lvl).map(l => (
                    <li key={l.id} className="text-sm p-2 border rounded bg-white hover:border-blue-300 transition">
                        {l.name}
                        {l.parentId && (
                            <p className="text-[10px] text-gray-400">Parent ID: {l.parentId.substring(0,6)}</p>
                        )}
                    </li>
                ))}
                </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
