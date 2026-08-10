'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import Link from 'next/link';
import Toast from '@/components/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn, GraduationCap, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const { school } = useSchool();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-container'),
          {
            theme: 'outline',
            size: 'large',
            width: 400,
            text: 'signin_with',
            locale: 'en',
            shape: 'rectangular'
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      setLoading(true);
      setError('');
      await googleLogin(response.credential);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Google لاگ ان ناکام ٿيو');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'لاگ ان ناڪام ٿيو. مهرباني ڪري ٻيهر ڪوشش ڪريو.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="ltr">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in flex flex-row-reverse items-center justify-around">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <div className="flex items-center justify-center flex-col">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {school?.school_name || 'اسڪول مئنيجمينٽ سسٽم'}
          </h1>
          <p className="text-lg text-gray-600">
            پنهنجي اڪائونٽ ۾ لاگ ان ڪريو
          </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="animate-slide-up">
          {error && (
            <Toast
              message={error}
              type="error"
              onClose={() => setError('')}
              duration={5000}
            />
          )}

          <CardContent className="pt-2">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">اي ميل ايڊريس</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="password">پاسورڊ</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors hover:underline underline-offset-4"
                >
                  پاسورڊ وسري ويو؟
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    لاگ ان ٿي رهيو آهي...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    لاگ ان
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-semibold">يا</span>
              </div>
            </div>

            {/* Google Sign-in */}
            <div className="flex justify-center items-center">
              <div id="google-signin-container"></div>
            </div>

            {/* Sign up link */}
            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <p className="text-center text-sm text-gray-600">
                اڪائونٽ نه آهي؟{' '}
                <Link
                  href="/register"
                  className="font-bold text-green-600 hover:text-green-700 transition-colors hover:underline underline-offset-2"
                >
                  رجسٽر ڪريو
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 animate-fade-in">
          © 2026 {school?.school_name || 'گورنمينٽ پرائمري اسڪول مئنيجمينٽ سسٽم'}
        </p>
      </div>
    </div>
  );
}
