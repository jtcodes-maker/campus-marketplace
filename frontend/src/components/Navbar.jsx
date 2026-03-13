"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
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

          {/* DESKTOP Search Bar (Hidden on mobile) */}
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

          {/* DESKTOP Navigation Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center text-gray-700 mr-2 font-medium">
                  <UserIcon className="w-5 h-5 mr-1 text-gray-400" />
                  Hi, {user.name.split(' ')[0]}
                </div>
                <Link href="/dashboard" className="text-gray-600 hover:text-green-600 font-semibold mr-4 transition-colors">
                  Dashboard
                </Link>
                <Link href="/inbox" className="text-gray-600 hover:text-green-600 font-semibold mr-4 transition-colors">
                  Inbox
                </Link>
                <Link href="/create-listing" className="flex items-center bg-white text-green-600 border border-green-600 px-4 py-2 rounded-md font-semibold hover:bg-green-50 transition-colors">
                  <PlusCircle className="w-4 h-4 mr-2" /> Post a Gig
                </Link>
                <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-600 font-semibold transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-green-600 font-semibold transition-colors">Sign In</Link>
                <Link href="/register" className="bg-green-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors">Join</Link>
              </>
            )}
          </div>

          {/* MOBILE Hamburger Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-green-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0">
          <div className="px-4 pt-4 pb-6 space-y-3">
            
            {/* --- NEW: MOBILE SEARCH BAR --- */}
            <div className="relative w-full flex mb-4">
              <input
                type="text"
                placeholder="Search CampusGig..."
                className="w-full border border-gray-300 rounded-l-md py-2 pl-4 pr-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-600 flex items-center justify-center px-4 rounded-r-md hover:bg-green-700 transition-colors">
                <Search className="h-5 w-5 text-white" />
              </button>
            </div>
            {/* ----------------------------- */}

            {user ? (
              <>
                <div className="flex items-center text-gray-800 px-3 py-3 font-semibold border-b border-gray-100 mb-2 bg-gray-50 rounded-md">
                  <UserIcon className="w-5 h-5 mr-2 text-green-600" />
                  Hi, {user.name.split(' ')[0]}
                </div>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-600">Dashboard</Link>
                <Link href="/inbox" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-600">Inbox</Link>
                <Link href="/create-listing" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-green-600 bg-green-50">
                  <PlusCircle className="w-5 h-5 mr-2" /> Post a Gig
                </Link>
                <button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 mt-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50">
                  <LogOut className="w-5 h-5 mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-green-50">Sign In</Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-green-600 bg-green-50">Join CampusGig</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}