import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      setError('reCAPTCHA not yet available');
      return;
    }

    try {
      const token = await executeRecaptcha('login');
      if (!token) {
          setError('Failed to verify reCAPTCHA');
          return;
      }
      // In a real production app, we would verify this token on the server using Admin SDK
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4 text-sm text-center font-semibold">{error}</p>}
        <div className="mb-4">
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
        <div className="mb-6">
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

        <p className="text-xs text-gray-500 mb-6 text-center">
            This site is protected by reCAPTCHA and the Google
            <a href="https://policies.google.com/privacy" className="text-blue-600 ml-1">Privacy Policy</a> and
            <a href="https://policies.google.com/terms" className="text-blue-600 ml-1">Terms of Service</a> apply.
        </p>

        <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};
