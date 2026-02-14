import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { UserManagement } from './pages/admin/UserManagement';
import { AuditLogs } from './pages/admin/AuditLogs';
import { LocationManagement } from './pages/master-data/LocationManagement';
import { PartyManagement } from './pages/master-data/PartyManagement';
import { CreateAssignment } from './pages/manager/CreateAssignment';
import { Approval } from './pages/manager/Approval';
import { Enrichment } from './pages/internal/Enrichment';
import { ReportVersioning } from './pages/reports/ReportVersioning';
import { AssignToClient } from './pages/reports/AssignToClient';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (userData && !userData.approved) return <Navigate to="/pending" />;
  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

const Dashboard: React.FC = () => {
    const { userData } = useAuth();
    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Political Intelligence Dashboard</h2>
            <p>Welcome, <strong>{userData?.name}</strong>.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
                <Link to="/manager/assign" className="p-4 border rounded hover:shadow-md transition">
                    <h3 className="font-bold">Active Assignments</h3>
                    <p className="text-sm text-gray-500">View and manage work</p>
                </Link>
                <Link to="/reports/manage" className="p-4 border rounded hover:shadow-md transition">
                    <h3 className="font-bold">Reports</h3>
                    <p className="text-sm text-gray-500">Manage versions and client access</p>
                </Link>
                <Link to="/master/locations" className="p-4 border rounded hover:shadow-md transition">
                    <h3 className="font-bold">Master Data</h3>
                    <p className="text-sm text-gray-500">Locations & Parties</p>
                </Link>
            </div>
        </div>
    );
};

export const AppRoutes: React.FC = () => {
  const { user, userData } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <div className="text-center p-8">Redirecting...</div>} />

      <Route path="/pending" element={
          userData && !userData.approved ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
                  <h2 className="text-2xl font-bold text-orange-600 mb-4">Approval Pending</h2>
                  <p className="text-gray-700 mb-6">Your account has been created successfully but is currently awaiting administrator approval.</p>
                  </div>
              </div>
          ) : <Navigate to="/" />
      } />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />

      {/* Master Data */}
      <Route path="/master/locations" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><LocationManagement /></ProtectedRoute>} />
      <Route path="/master/parties" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><PartyManagement /></ProtectedRoute>} />

      {/* Manager Routes */}
      <Route path="/manager/assign" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><CreateAssignment /></ProtectedRoute>} />
      <Route path="/manager/approvals" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><Approval /></ProtectedRoute>} />

      {/* Internal Office */}
      <Route path="/internal/enrichment" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'INTERNAL_OFFICE']}><Enrichment /></ProtectedRoute>} />

      {/* Reports */}
      <Route path="/reports/manage" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ReportVersioning /></ProtectedRoute>} />
      <Route path="/reports/assign-client" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><AssignToClient /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
