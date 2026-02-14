import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { UserRole } from '@ir-political-strategies/shared';
import ReCAPTCHA from "react-google-recaptcha";

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('SURVEYOR');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
        setError('Please complete the reCAPTCHA');
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email,
        name,
        role,
        approved: false, // All roles need approval initially for security
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <form onSubmit={handleSignup} className="p-8 bg-white shadow-md rounded-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Requested Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2 border rounded"
                >
                    <option value="SURVEYOR">Surveyor</option>
                    <option value="INTERNAL_OFFICE">Internal Office</option>
                    <option value="MANAGER">Manager</option>
                    <option value="CLIENT">Client</option>
                </select>
            </div>
        </div>

        <div className="flex justify-center my-6 overflow-hidden scale-90">
            <ReCAPTCHA
                sitekey="6LecnGssAAAAALFIe8-D_zEcP-hdj_aFe2TbG0Fq"
                onChange={(token) => setCaptchaToken(token)}
            />
        </div>

        <button
            type="submit"
            disabled={!captchaToken}
            className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 transition disabled:opacity-50"
        >
          Request Access
        </button>
      </form>
    </div>
  );
};
