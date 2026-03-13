"use client"; // We need this now because the Navbar is checking browser storage

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // 1. Check if the user is logged in when the Navbar loads
  useEffect(() => {
    // We look into Local Storage for the saved user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Convert it back from text to a proper object
    }
  }, []);

  // 2. The Logout Function
  const handleLogout = () => {
    // Destroy the digital ID card and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update the Navbar state so it instantly changes the buttons back
    setUser(null);
    
    // Redirect back to the login page
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-3xl font-extrabold text-green-600 tracking-tighter">
              CampusGig.
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full flex">
              <input
                type="text"
                placeholder="Find services, textbooks, or tutoring..."
                className="w-full border border-gray-300 rounded-l-md py-2 pl-4 pr-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-600 flex items-center justify-center px-4 rounded-r-md hover:bg-green-700 transition-colors">
                <Search className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* 3. CONDITIONAL RENDERING: Logged In vs Logged Out */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* --- SHOW THIS IF LOGGED IN --- */
              <>
                <div className="hidden sm:flex items-center text-gray-700 mr-2 font-medium">
                  <UserIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Hi, {user.name.split(' ')[0]} {/* Grabs just their first name! */}
                </div>

                <Link href="/dashboard" className="text-gray-600 hover:text-green-600 font-semibold transition-colors">
                  Dashboard
                </Link>
                
                {/* --- NEW INBOX LINK --- */}
                <Link href="/inbox" className="text-gray-600 hover:text-green-600 font-semibold mr-4 transition-colors">
                  Inbox
                </Link>
                
                <Link 
                  href="/create-listing" 
                  className="flex items-center bg-white text-green-600 border border-green-600 px-4 py-2 rounded-md font-semibold hover:bg-green-50 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post a Gig
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center text-gray-500 hover:text-red-600 font-semibold transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              /* --- SHOW THIS IF LOGGED OUT --- */
              <>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-green-600 font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-green-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}