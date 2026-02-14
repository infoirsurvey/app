import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import ReCAPTCHA from "react-google-recaptcha";

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the reCAPTCHA');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <div className="mb-4">
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
        <div className="mb-6">
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

        <div className="flex justify-center mb-6 overflow-hidden">
            <ReCAPTCHA
                sitekey="6LecnGssAAAAALFIe8-D_zEcP-hdj_aFe2TbG0Fq"
                onChange={(token) => setCaptchaToken(token)}
            />
        </div>

        <button
            type="submit"
            disabled={!captchaToken}
            className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          Login
        </button>
      </form>
    </div>
  );
};
