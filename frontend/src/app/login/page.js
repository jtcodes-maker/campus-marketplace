"use client"; // Required because we are using user inputs and state

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Helps us redirect the user
import Link from 'next/link';

export default function Login() {
  // 1. Set up state to hold the user's typed input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); // Initialize the router for page navigation

  // 2. The function that runs when the user clicks "Sign In"
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    setError('');
    setLoading(true);

    try {
      // 3. Send the email and password to our backend API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
        email,
        password,
      });

      // 4. Success! Grab the token and user data from the response
      const { token, user } = response.data;

      // 5. Save the digital ID card (token) into the browser's Local Storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 6. Redirect the user back to the homepage
      window.location.href = '/';
      
    } catch (err) {
      // If the backend sends back an error (like "Wrong password"), display it
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
        
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Welcome Back
        </h2>

        {/* Display error message if there is one */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* 7. The Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="studentnumber@students.unam.na"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your secure password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-green-600 hover:underline font-semibold">
            Join CampusGig
          </Link>
        </div>
        
      </div>
    </div>
  );
}