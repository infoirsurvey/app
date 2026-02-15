import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { UserRole } from '@ir-political-strategies/shared';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('SURVEYOR');
  const [error, setError] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
        setError('reCAPTCHA not yet available');
        return;
    }
    try {
      const token = await executeRecaptcha('signup');
      if (!token) {
          setError('Failed to verify reCAPTCHA');
          return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email,
        name,
        role,
        approved: false,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10 pb-20">
      <form onSubmit={handleSignup} className="p-8 bg-white shadow-md rounded-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        {error && <p className="text-red-500 mb-4 text-sm text-center font-semibold">{error}</p>}

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Requested Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="SURVEYOR">Surveyor</option>
                    <option value="INTERNAL_OFFICE">Internal Office</option>
                    <option value="MANAGER">Manager</option>
                    <option value="CLIENT">Client</option>
                </select>
            </div>
        </div>

        <p className="text-xs text-gray-500 my-6 text-center">
            This site is protected by reCAPTCHA and the Google
            <a href="https://policies.google.com/privacy" className="text-blue-600 ml-1">Privacy Policy</a> and
            <a href="https://policies.google.com/terms" className="text-blue-600 ml-1">Terms of Service</a> apply.
        </p>

        <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 transition"
        >
          Request Access
        </button>
      </form>
    </div>
  );
};
