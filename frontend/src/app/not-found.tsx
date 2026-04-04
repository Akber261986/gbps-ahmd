"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* 404 Number */}
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-bold text-green-600 mb-2">404</h1>
            <div className="h-1 w-24 bg-green-600 mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            صفحو نه مليو
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            معاف ڪجو، جيڪو صفحو توهان ڳولي رهيا آهيو اهو موجود ناهي يا منتقل ڪيو ويو آهي.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              گهر واپس وڃو
            </Link>

            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-gray-200 text-gray-800 font-bold rounded-lg shadow-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              پوئتي وڃو
            </button>
          </div>

          {/* Quick Links */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-600 mb-4">شايد توهان ڳولي رهيا آهيو:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/students"
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                اسٽوڊنٽس
              </Link>
              <Link
                href="/admission"
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                نئون داخلو
              </Link>
              <Link
                href="/leaving-certificates"
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                ڇڏڻ جا سرٽيفڪيٽ
              </Link>
              <Link
                href="/school-settings"
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                اسڪول سيٽنگس
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            جيڪڏهن توهان سمجهو ٿا ته هي غلطي آهي، مهرباني ڪري منتظم سان رابطو ڪريو.
          </p>
        </div>
      </div>
    </div>
  );
}
