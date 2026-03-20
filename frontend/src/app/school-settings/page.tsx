'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function SchoolSettingsPage() {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const { school, refreshSchool } = useSchool();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    school_name: '',
    semis_code: '',
    established_year: '',
    address: '',
    contact_number: '',
    email: '',
    principal_name: '',
    logo_url: '',
  });

  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (school) {
      setFormData({
        school_name: school.school_name || '',
        semis_code: school.semis_code || '',
        established_year: school.established_year?.toString() || '',
        address: school.address || '',
        contact_number: school.contact_number || '',
        email: school.email || '',
        principal_name: school.principal_name || '',
        logo_url: school.logo_url || '',
      });
      setSchoolLogo(school.logo_url || null);
    }
  }, [authLoading, isAuthenticated, school, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setMessage('');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('براه ڪرم صرف تصوير جي فائل چونڊيو');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('تصوير جي سائيز 5MB کان گهٽ هجڻ گهرجي');
      return;
    }

    setUploadingLogo(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/images/upload/school-logo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSchoolLogo(response.data.logo_url);
      setFormData(prev => ({
        ...prev,
        logo_url: response.data.logo_url
      }));
      setMessage('اسڪول جو لوگو ڪاميابي سان اپڊيٽ ٿي ويو');

      // Refresh school data
      await refreshSchool();

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'لوگو اپلوڊ ڪرڻ ۾ ناڪامي');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const updateData: any = {
        school_name: formData.school_name,
        semis_code: formData.semis_code,
        address: formData.address,
        contact_number: formData.contact_number,
        email: formData.email,
        principal_name: formData.principal_name,
        logo_url: formData.logo_url,
      };

      if (formData.established_year) {
        updateData.established_year = parseInt(formData.established_year);
      }

      const response = await axios.put('/api/schools/update', updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('اسڪول جي معلومات ڪاميابي سان اپڊيٽ ٿي وئي');

      // Refresh school data
      await refreshSchool();

      setTimeout(() => {
        setMessage('');
      }, 3000);
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'اسڪول جي معلومات اپڊيٽ ڪرڻ ۾ ناڪامي');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">لوڊ ٿي رهيو آهي...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
          {message && (
            <div className="fixed top-16 right-8 mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="fixed top-16 right-8 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">اسڪول سيٽنگس</h1>


          {/* School Logo Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              {schoolLogo ? (
                <Image
                  src={schoolLogo}
                  alt="School Logo"
                  fill
                  className="rounded-lg object-contain"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-sm text-center p-2">
                  اسڪول جو لوگو
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {uploadingLogo ? 'اپلوڊ ٿي رهيو آهي...' : 'لوگو تبديل ڪريو'}
            </button>
            <p className="mt-2 text-sm text-gray-500">JPG, PNG, GIF (وڌ ۾ وڌ 5MB)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Name */}
            <div>
              <label htmlFor="school_name" className="block text-lg font-medium text-gray-700 mb-2">
                اسڪول جو نالو *
              </label>
              <input
                type="text"
                id="school_name"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                required
              />
            </div>

            {/* SEMIS Code */}
            <div>
              <label htmlFor="semis_code" className="block text-lg font-medium text-gray-700 mb-2">
                SEMIS ڪوڊ *
              </label>
              <input
                type="text"
                id="semis_code"
                name="semis_code"
                value={formData.semis_code}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                SEMIS ڪوڊ تبديل ڪرڻ سان محتاط رهو - اهو اسڪول جو منفرد سڃاڻپ ڪندڙ آهي
              </p>
            </div>

            {/* Principal Name */}
            <div>
              <label htmlFor="principal_name" className="block text-lg font-medium text-gray-700 mb-2">
                پرنسپال جو نالو
              </label>
              <input
                type="text"
                id="principal_name"
                name="principal_name"
                value={formData.principal_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Established Year */}
            <div>
              <label htmlFor="established_year" className="block text-lg font-medium text-gray-700 mb-2">
                قائم ٿيڻ جو سال
              </label>
              <input
                type="number"
                id="established_year"
                name="established_year"
                value={formData.established_year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-lg font-medium text-gray-700 mb-2">
                پتو
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contact_number" className="block text-lg font-medium text-gray-700 mb-2">
                رابطي جو نمبر
              </label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                اي ميل
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label htmlFor="logo_url" className="block text-lg font-medium text-gray-700 mb-2">
                لوگو URL
              </label>
              <input
                type="text"
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="https://example.com/logo.png"
              />
              <p className="mt-1 text-sm text-gray-500">
                اسڪول جي لوگو جو URL داخل ڪريو
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 space-x-reverse pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                واپس
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'محفوظ ٿي رهيو آهي...' : 'محفوظ ڪريو'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
