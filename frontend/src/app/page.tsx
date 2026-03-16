'use client';

import Link from 'next/link';
import Image from "next/image";
import { useSchool } from '@/contexts/SchoolContext';

export default function Home() {
  const { school } = useSchool();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-green-800 text-white py-3 shadow-md">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center">{school?.school_name || 'اسڪول مئنيجمينٽ سسٽم'}</h1>
          {school?.semis_code && (
            <p className="text-center mt-1 opacity-90 text-base md:text-lg">SEMIS Code: {school.semis_code}</p>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-5">
                <span className="block">Welcome to</span>
                <span className="text-green-700">{school?.school_name || 'School Management System'}</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-7 max-w-2xl mx-auto md:mx-0">
                {school?.school_name || 'Our school'} is dedicated to providing quality education and fostering academic excellence for our students.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                <Link
                  href="/admission"
                  className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-800 transition duration-300 text-center text-base md:text-lg"
                >
                  New Admission
                </Link>
                <Link
                  href="/students"
                  className="px-6 py-3 bg-white text-green-700 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition duration-300 border border-green-700 text-center text-base md:text-lg"
                >
                  View Students
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-green-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                  {school?.logo_url ? (
                    <Image
                      src={school.logo_url}
                      alt="School Logo"
                      width={160}
                      height={160}
                      className="object-contain"
                    />
                  ) : (
                    <div className="text-green-700 text-6xl font-bold">
                      {school?.school_name?.[0] || 'S'}
                    </div>
                  )}
                </div>
                {school?.established_year && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full font-bold text-xs shadow-lg">
                    Est. {school.established_year}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-white px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">Our Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-5 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Admissions</h3>
              <p className="text-sm text-gray-600">Easy and streamlined admission process for new students with digital forms and records.</p>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Student Records</h3>
              <p className="text-sm text-gray-600">Maintain comprehensive digital records of all enrolled students with easy access and management.</p>
            </div>

            <div className="bg-yellow-50 p-5 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">Secure System</h3>
              <p className="text-sm text-gray-600">All student data is securely stored with proper access controls and backup systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-6xl mx-auto px-6 md:px-10 text-center">
          <p className="mb-1 text-sm md:text-base">{school?.school_name || 'School Management System'}</p>
          <p className="text-gray-400 text-xs md:text-sm">© {new Date().getFullYear()} All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
