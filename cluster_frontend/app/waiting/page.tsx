'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function WaitingPage() {
  const { user, logout, refreshUser, hasCluster } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // If user has cluster, redirect to dashboard
    if (hasCluster) {
      router.push('/dashboard');
      return;
    }

    // Auto-refresh every 30 seconds to check if cluster assigned
    const interval = setInterval(async () => {
      setChecking(true);
      await refreshUser();
      setChecking(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [hasCluster, refreshUser, router]);

  const handleCheckNow = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="h-12 w-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pending Cluster Assignment
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is waiting for cluster assignment
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-800 mb-2">Account Information</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Name:</span> {user?.full_name}</p>
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Status:</span> <span className="text-amber-600 font-medium">Awaiting Assignment</span></p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>A system administrator will assign you to a cluster</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>You'll receive access to your cluster dashboard</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>This page will automatically refresh every 30 seconds</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCheckNow}
                disabled={checking}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checking ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  'Check Now'
                )}
              </button>

              <button
                onClick={logout}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Logout
              </button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
