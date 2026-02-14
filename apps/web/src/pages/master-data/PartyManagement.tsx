import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export const PartyManagement: React.FC = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [parties, setParties] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'parties'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p: any[] = [];
      snapshot.forEach((doc) => p.push({ id: doc.id, ...doc.data() }));
      setParties(p);
    });
    return unsubscribe;
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'parties'), { name, symbol });
    setName('');
    setSymbol('');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Political Parties</h2>
      <form onSubmit={handleAdd} className="mb-8 p-4 bg-gray-50 rounded shadow flex gap-4">
        <input
          type="text"
          placeholder="Party Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded flex-1"
          required
        />
        <input
          type="text"
          placeholder="Symbol URL (optional)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Party</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {parties.map(p => (
          <div key={p.id} className="border p-4 rounded bg-white text-center shadow-sm">
            {p.symbol && <img src={p.symbol} alt={p.name} className="w-12 h-12 mx-auto mb-2 object-contain" />}
            <div className="font-bold">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
