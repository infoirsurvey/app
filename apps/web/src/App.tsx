import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from './firebase';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { useTabBlur } from './hooks/useTabBlur';
import { AppRoutes } from './AppRoutes';

const App: React.FC = () => {
  const { user, userData, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const isBlurred = useTabBlur();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold">Loading IR Political Strategies...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-blue-900 text-white p-4 shadow-lg flex justify-between items-center">
          <h1 className="text-xl font-bold">IR POLITICAL STRATEGIES</h1>
          <button
            onClick={() => setShowSignup(!showSignup)}
            className="text-sm underline hover:text-blue-200"
          >
            {showSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </header>
        <main>
          {showSignup ? <Signup /> : <Login />}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isBlurred ? 'blur-xl' : ''} transition-all duration-300`}>
      <header className="bg-blue-900 text-white p-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">IR POLITICAL STRATEGIES</h1>
            <nav className="hidden md:flex gap-4 text-sm">
                <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                {userData?.role === 'ADMIN' && <Link to="/admin/users" className="hover:text-blue-200">Users</Link>}
                {(userData?.role === 'ADMIN' || userData?.role === 'MANAGER') && (
                    <>
                        <Link to="/master/locations" className="hover:text-blue-200">Locations</Link>
                        <Link to="/manager/assign" className="hover:text-blue-200">Assignments</Link>
                        <Link to="/reports/manage" className="hover:text-blue-200">Reports</Link>
                    </>
                )}
            </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium bg-blue-800 px-3 py-1 rounded">
            {userData?.role}
          </span>
          <button
            onClick={() => signOut(auth)}
            className="text-sm underline hover:text-blue-200"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 relative">
        {isBlurred && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-gray-800">Content Hidden for Security</h2>
          </div>
        )}
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
