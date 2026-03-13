"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();

  // 1. Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  
  // 2. Status State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 3. Handle Form Submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send the data to our backend registration route
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
        name,
        email,
        password,
        university
      });

      // Success! Send them to the login page so they can sign in
      alert("Account created successfully! Please sign in.");
      router.push('/login');
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
        
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Join CampusGig
        </h2>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="John Doe"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="john.doe@university.edu"
            />
          </div>

          {/* University Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
            <input
              type="text"
              required
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="University of Namibia"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 mt-4"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
        
      </div>
    </div>
  );
}