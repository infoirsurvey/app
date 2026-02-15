import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { User as AppUser } from '@ir-political-strategies/shared';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: AppUser[] = [];
      snapshot.forEach((doc) => {
        usersData.push(doc.data() as AppUser);
      });
      setUsers(usersData);
    });
    return unsubscribe;
  }, []);

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { approved: !currentStatus });
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">{user.approved ? 'Approved' : 'Pending'}</td>
              <td className="border p-2">
                <button
                  onClick={() => toggleApproval(user.id, user.approved)}
                  className={`p-1 rounded ${user.approved ? 'bg-red-500' : 'bg-green-500'} text-white`}
                >
                  {user.approved ? 'Revoke' : 'Approve'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
