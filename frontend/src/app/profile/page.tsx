'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isAuthenticated, token, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [loadingState, setLoadingState] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || '',
        email: user.email || '',
      }));
      setProfileImage(user.profile_image_url || null);
    }
  }, [loading, isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setMessage('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/auth/upload-profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfileImage(response.data.profile_image_url);
      setMessage('پروفائل تصوير ڪاميابي سان اپڊيٽ ٿي وئي');

      // Refresh user data to update navbar
      await refreshUser();

      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'تصوير اپلوڊ ڪرڻ ۾ ناڪامي');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState(true);
    setError('');
    setMessage('');

    try {
      // Validate password fields if user is trying to change password
      if (formData.new_password || formData.confirm_password) {
        if (!formData.current_password) {
          setError('براه ڪرم موجوده پاسورڊ داخل ڪريو');
          setLoadingState(false);
          return;
        }
        if (formData.new_password !== formData.confirm_password) {
          setError('نوان پاسورڊ ۽ تصديق پاسورڊ ملن نه ٿا');
          setLoadingState(false);
          return;
        }
        if (formData.new_password.length < 6) {
          setError('نئون پاسورڊ گهٽ ۾ گهٽ 6 اکرن جو هجڻ گهرجي');
          setLoadingState(false);
          return;
        }
      }

      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
      };

      // Only include password fields if user is changing password
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const response = await axios.put('/api/auth/profile', updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage('پروفائل ڪاميابي سان اپڊيٽ ٿي وئي');

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));

      // Reload user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'پروفائل اپڊيٽ ڪرڻ ۾ ناڪامي');
    } finally {
      setLoadingState(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">لوڊ ٿي رهيو آهي...</div>
      </div>
    );
  }

  const isOAuthUser = user.oauth_provider !== null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">پروفائل سيٽنگس</h1>

          {message && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Profile Image Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-green-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {uploadingImage ? 'اپلوڊ ٿي رهيو آهي...' : 'تصوير تبديل ڪريو'}
            </button>
            <p className="mt-2 text-sm text-gray-500">JPG, PNG, GIF (وڌ ۾ وڌ 5MB)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-lg font-medium text-gray-700 mb-2">
                پورو نالو
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                required
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
                required
              />
            </div>

            {/* Password Change Section - Only for non-OAuth users */}
            {!isOAuthUser && (
              <>
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">پاسورڊ تبديل ڪريو</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    جيڪڏهن توهان پنهنجو پاسورڊ تبديل ڪرڻ نٿا چاهيو، ته هيٺيون فيلڊ خالي ڇڏي ڏيو
                  </p>
                </div>

                {/* Current Password */}
                <div>
                  <label htmlFor="current_password" className="block text-lg font-medium text-gray-700 mb-2">
                    موجوده پاسورڊ
                  </label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new_password" className="block text-lg font-medium text-gray-700 mb-2">
                    نئون پاسورڊ
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm_password" className="block text-lg font-medium text-gray-700 mb-2">
                    نئون پاسورڊ تصديق ڪريو
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                </div>
              </>
            )}

            {isOAuthUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  توهان {user.oauth_provider} ذريعي لاگ ان ٿيل آهيو. پاسورڊ تبديل ڪرڻ جي ضرورت ناهي.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 space-x-reverse pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                واپس
              </button>
              <button
                type="submit"
                disabled={loadingState}
                className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingState ? 'محفوظ ٿي رهيو آهي...' : 'محفوظ ڪريو'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
