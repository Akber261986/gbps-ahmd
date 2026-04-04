'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getAuthHeader } from '@/lib/auth';
import Toast from '@/components/Toast';

interface SchoolData {
  school_name: string;
  semis_code: string;
  established_year?: number;
  address?: string;
  contact_number?: string;
  email?: string;
  principal_name?: string;
}

export default function OnboardingPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<SchoolData>({
    school_name: '',
    semis_code: '',
    established_year: undefined,
    address: '',
    contact_number: '',
    email: '',
    principal_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'established_year' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/schools/onboard', formData, {
        headers: getAuthHeader()
      });

      // Refresh user data to get updated school_id
      await refreshUser();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'اسڪول رجسٽريشن ناکام ٿيو. مهرباني ڪري ٻيهر ڪوشش ڪريو.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
              اسڪول جي معلومات
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              مهرباني ڪري پنهنجي اسڪول جي معلومات داخل ڪريو
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Toast
                message={error}
                type="error"
                onClose={() => setError('')}
                duration={5000}
              />
            )}

            <div>
              <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 mb-1">
                اسڪول جو نالو <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="school_name"
                name="school_name"
                required
                value={formData.school_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="مثال: گورنمينٽ بوائز پرائمري اسڪول"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="semis_code" className="block text-sm font-medium text-gray-700 mb-1">
                SEMIS ڪوڊ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="semis_code"
                name="semis_code"
                required
                value={formData.semis_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="SEMIS ڪوڊ داخل ڪريو"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="established_year" className="block text-sm font-medium text-gray-700 mb-1">
                قائم ٿيڻ جو سال
              </label>
              <input
                type="number"
                id="established_year"
                name="established_year"
                value={formData.established_year || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="مثال: 1990"
                min="1800"
                max={new Date().getFullYear()}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="principal_name" className="block text-sm font-medium text-gray-700 mb-1">
                پرنسپال جو نالو
              </label>
              <input
                type="text"
                id="principal_name"
                name="principal_name"
                value={formData.principal_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="پرنسپال جو نالو"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                پتو
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="اسڪول جو مڪمل پتو"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
                رابطي جو نمبر
              </label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="مثال: 0300-1234567"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                اسڪول جو اي ميل
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="school@example.com"
                disabled={loading}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'محفوظ ٿي رهيو آهي...' : 'اسڪول رجسٽر ڪريو'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
