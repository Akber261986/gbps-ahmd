'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import Link from 'next/link';
import Toast from '@/components/Toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, UserPlus, GraduationCap, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { school } = useSchool();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('پاسورڊ ۽ تصديق پاسورڊ ملڻ گهرجن');
      return;
    }

    if (password.length < 6) {
      setError('پاسورڊ گهٽ ۾ گهٽ 6 اکرن جو هجڻ گهرجي');
      return;
    }

    setLoading(true);

    try {
      await register({ email, password, full_name: fullName || undefined });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'رجسٽريشن ناکام ٿيو. مهرباني ڪري ٻيهر ڪوشش ڪريو.');
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
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {school?.school_name || 'اسڪول مئنيجمينٽ سسٽم'}
          </h1>
          <p className="text-lg text-gray-600">
            نئون اڪائونٽ ٺاهيو
          </p>
        </div>

        {/* Register Card */}
        <Card className="animate-slide-up">
          {error && (
            <Toast
              message={error}
              type="error"
              onClose={() => setError('')}
              duration={5000}
            />
          )}

          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">
                    پورو نالو <span className="text-gray-400 font-normal text-xs">(اختياري)</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="توهان جو پورو نالو"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>

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
                      autoComplete="new-password"
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

                <div>
                  <Label htmlFor="confirm-password">پاسورڊ تصديق</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    رجسٽر ٿي رهيو آهي...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    رجسٽر ڪريو
                  </>
                )}
              </Button>
            </form>

            {/* Sign in link */}
            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <p className="text-center text-sm text-gray-600">
                اڳ ۾ ئي اڪائونٽ آهي؟{' '}
                <Link
                  href="/login"
                  className="font-bold text-green-600 hover:text-green-700 transition-colors hover:underline underline-offset-2"
                >
                  لاگ ان ڪريو
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
