import React from 'react';
import { useTabBlur } from './hooks/useTabBlur';

const App: React.FC = () => {
  const isBlurred = useTabBlur();

  return (
    <div className={`min-h-screen ${isBlurred ? 'blur-xl' : ''} transition-all duration-300`}>
      <header className="bg-blue-900 text-white p-4 shadow-lg">
        <h1 className="text-xl font-bold">IR POLITICAL STRATEGIES</h1>
      </header>
      <main className="container mx-auto p-4">
        {isBlurred && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
            <h2 className="text-2xl font-bold text-gray-800">Content Hidden for Security</h2>
          </div>
        )}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Political Intelligence Dashboard</h2>
          <p>Welcome to the secure data command system.</p>
        </div>
      </main>
    </div>
  );
};

export default App;
