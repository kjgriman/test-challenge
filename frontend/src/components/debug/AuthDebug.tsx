import React from 'react';
import { useAuthStore, useIsAuthenticated, useUserRole } from '../../store/authStore';

const AuthDebug: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useIsAuthenticated();
  const userRole = useUserRole();
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-sm">
      <h3 className="font-bold mb-2">🔍 Debug Auth State</h3>
      <div className="text-sm space-y-1">
        <p><strong>isInitialized:</strong> {isInitialized.toString()}</p>
        <p><strong>isAuthenticated:</strong> {isAuthenticated.toString()}</p>
        <p><strong>userRole:</strong> {userRole || 'null'}</p>
        <p><strong>token:</strong> {token ? 'Present' : 'Missing'}</p>
        <p><strong>user:</strong> {user ? `${user.firstName} ${user.lastName}` : 'null'}</p>
      </div>
    </div>
  );
};

export default AuthDebug;
