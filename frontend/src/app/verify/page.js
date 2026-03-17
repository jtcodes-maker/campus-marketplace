"use client";

import { useState, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Grab the email from the URL (e.g., /verify?email=student@unam.na)
  const emailParam = searchParams.get('email') || ''; 

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send the email and code to our new backend route
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/verify`, {
        email,
        code
      });

      setSuccess(res.data.message);
      
      // Send them to the login page after 2 seconds!
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error("Verification failed:", err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-green-100 flex items-center justify-center rounded-full mb-4">
          <MailCheck className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent a 6-digit verification code to <span className="font-bold">{email || 'your email'}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
          
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3 mb-4 text-center">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md p-3 mb-4 text-center font-bold">{success}</div>}

          <form onSubmit={handleVerify} className="space-y-6">
            {!emailParam && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1">
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 text-center mb-2">6-Digit Code</label>
              <input
                type="text" required maxLength="6"
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Only allow numbers!
                placeholder="000000"
                className="block w-full text-center text-3xl tracking-[0.5em] px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 uppercase font-mono"
              />
            </div>

            <button
              type="submit" disabled={loading || code.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-green-600 hover:text-green-500">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense to prevent Next.js cloud build errors!
export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}