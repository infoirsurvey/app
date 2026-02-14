import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../firebase';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snap) => {
      const l: any[] = [];
      snap.forEach(doc => l.push({ id: doc.id, ...doc.data() }));
      setLogs(l);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">System Audit Logs</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left border-b">Timestamp</th>
              <th className="p-3 text-left border-b">User</th>
              <th className="p-3 text-left border-b">Action</th>
              <th className="p-3 text-left border-b">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="p-3 border-b text-sm">
                  {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Pending...'}
                </td>
                <td className="p-3 border-b text-sm">{log.userEmail}</td>
                <td className="p-3 border-b text-sm font-semibold">{log.actionType}</td>
                <td className="p-3 border-b text-xs text-gray-600">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
